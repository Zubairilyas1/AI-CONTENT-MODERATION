const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Apply policy rules to AI category results and determine overall outcome.
 */
function applyPolicyRules(categoryResults, activePolicies) {
  const policyMap = {};
  activePolicies.forEach((p) => {
    policyMap[p.category] = p;
  });

  const processedResults = categoryResults.map((result) => {
    const policy = policyMap[result.category];
    if (!policy || !policy.is_enabled) {
      return {
        ...result,
        classification: 'not_detected',
        confidence: result.confidence,
        reasoning: policy ? 'Category disabled at time of screening.' : result.reasoning,
      };
    }

    if (result.classification === 'detected' && result.confidence < policy.confidence_threshold) {
      return {
        ...result,
        classification: 'not_detected',
        reasoning: `Confidence ${result.confidence}% below threshold ${policy.confidence_threshold}%.`,
      };
    }

    return result;
  });

  let outcome = 'Approved';
  let hasBlock = false;
  let hasFlag = false;

  for (const result of processedResults) {
    const policy = policyMap[result.category];
    if (!policy || !policy.is_enabled) continue;
    if (result.classification !== 'detected') continue;

    if (policy.enforcement_behavior === 'Auto-Block') {
      hasBlock = true;
    } else if (policy.enforcement_behavior === 'Flag for Review') {
      hasFlag = true;
    }
  }

  if (hasBlock) {
    outcome = 'Blocked';
  } else if (hasFlag) {
    outcome = 'Flagged for Review';
  }

  return { outcome, category_results: processedResults };
}

function parseJsonArray(rawText) {
  let text = rawText.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const categoryResults = JSON.parse(text);
  if (!Array.isArray(categoryResults)) {
    throw new Error('Gemini API response is not a JSON array');
  }

  return categoryResults.map((r) => ({
    category: r.category,
    classification: r.classification === 'detected' ? 'detected' : 'not_detected',
    confidence: Math.min(100, Math.max(0, Number(r.confidence) || 0)),
    reasoning: r.reasoning || 'No reasoning provided.',
  }));
}

/**
 * Moderate an image using Google Gemini vision API with retry logic.
 * @param {string} imageBase64 - Base64-encoded image data (without data URI prefix)
 * @param {string} mediaType - MIME type e.g. image/jpeg
 * @param {Array} activePolicies - List of policy objects from snapshot
 */
async function moderateImage(imageBase64, mediaType, activePolicies, retries = 3) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const enabledCategories = activePolicies
    .filter((p) => p.is_enabled)
    .map((p) => p.category);

  if (enabledCategories.length === 0) {
    return {
      outcome: 'Approved',
      category_results: [],
    };
  }

  const categoryList = enabledCategories.join(', ');

  const prompt = `You are a content moderation AI. Analyze the provided image against the following active categories only: ${categoryList}.
For each category return a JSON object with:

category: category name
classification: "detected" or "not_detected"
confidence: number from 0 to 100
reasoning: one short sentence explaining your decision

Respond ONLY with a valid JSON array. No explanation, no markdown, no extra text.`;

  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent([
        {
          inlineData: {
            data: imageBase64,
            mimeType: mediaType || 'image/jpeg',
          },
        },
        { text: prompt },
      ]);

      const rawText = result.response.text();
      if (!rawText) {
        throw new Error('No text response from Gemini API');
      }

      const normalized = parseJsonArray(rawText);
      return applyPolicyRules(normalized, activePolicies);
    } catch (error) {
      lastError = error;
      
      // Check for rate limit error (429)
      if (error.status === 429 && attempt < retries) {
        const waitTime = Math.pow(2, attempt) * 5000; // Exponential backoff: 10s, 20s, 40s
        console.warn(`Rate limited. Retry attempt ${attempt}/${retries} in ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // If last attempt or not a rate limit error, throw
      if (attempt === retries) {
        console.error(`Moderation failed after ${retries} attempts:`, error.message);
        throw error;
      }
    }
  }

  throw lastError;
}

/**
 * Read image file and return base64 + media type.
 */
function imageFileToBase64(filePath) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mediaTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return {
    base64: buffer.toString('base64'),
    mediaType: mediaTypes[ext] || 'image/jpeg',
  };
}

module.exports = {
  moderateImage,
  applyPolicyRules,
  imageFileToBase64,
};
