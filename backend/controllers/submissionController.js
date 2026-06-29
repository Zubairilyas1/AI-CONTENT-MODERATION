const Submission = require('../models/Submission');
const Image = require('../models/Image');
const Verdict = require('../models/Verdict');
const Policy = require('../models/Policy');
const PolicySnapshot = require('../models/PolicySnapshot');
const Appeal = require('../models/Appeal');
const { moderateImage, imageUrlToBase64 } = require('../services/moderationService');

async function capturePolicySnapshot() {
  const policies = await Policy.find().lean();
  const snapshot = await PolicySnapshot.create({
    captured_at: new Date(),
    policies: policies.map((p) => ({
      category: p.category,
      is_enabled: p.is_enabled,
      confidence_threshold: p.confidence_threshold,
      enforcement_behavior: p.enforcement_behavior,
      updated_at: p.updated_at,
    })),
  });
  return snapshot;
}

exports.createSubmission = async (req, res) => {
  try {
    const { imageUrls } = req.body;

    // Validate input
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ 
        message: 'At least one image URL is required. Send as JSON: { "imageUrls": ["url1", "url2", ...] }' 
      });
    }

    if (imageUrls.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 images per submission.' });
    }

    // Validate all URLs are strings and valid URLs
    for (const url of imageUrls) {
      if (typeof url !== 'string') {
        return res.status(400).json({ message: 'All image URLs must be strings.' });
      }
      try {
        new URL(url);
      } catch (error) {
        return res.status(400).json({ message: `Invalid URL: ${url}` });
      }
    }

    const snapshot = await capturePolicySnapshot();
    const activePolicies = snapshot.policies;

    const submission = await Submission.create({
      user_id: req.user._id,
      images: [],
    });

    const imageIds = [];

    // Process each image URL
    for (const imageUrl of imageUrls) {
      let base64Data;
      let mediaType;

      try {
        // Download image from URL
        console.log(`Downloading image from URL: ${imageUrl}`);
        const result = await imageUrlToBase64(imageUrl);
        base64Data = result.base64;
        mediaType = result.mediaType;
      } catch (downloadError) {
        console.error('Image download error:', downloadError);
        return res.status(400).json({ 
          message: `Failed to download image from URL: ${downloadError.message}` 
        });
      }

      // Create image record with URL
      const image = await Image.create({
        submission_id: submission._id,
        image_url: imageUrl,
      });

      let moderationResult;
      try {
        // Moderate the image
        moderationResult = await moderateImage(base64Data, mediaType, activePolicies);
      } catch (aiError) {
        console.error('AI moderation error:', aiError);
        moderationResult = {
          outcome: 'Flagged for Review',
          category_results: [
            {
              category: 'System',
              classification: 'detected',
              confidence: 100,
              reasoning: 'AI moderation service unavailable. Flagged for manual review.',
            },
          ],
        };
      }

      // Create verdict
      const verdict = await Verdict.create({
        image_id: image._id,
        outcome: moderationResult.outcome,
        policy_snapshot_id: snapshot._id,
        category_results: moderationResult.category_results,
      });

      image.verdict_id = verdict._id;
      await image.save();
      imageIds.push(image._id);
    }

    submission.images = imageIds;
    await submission.save();

    const populated = await Submission.findById(submission._id)
      .populate({
        path: 'images',
        populate: { path: 'verdict_id' },
      })
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ message: 'Failed to process submission.' });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const { outcome, category, startDate, endDate } = req.query;

    let submissions = await Submission.find({ user_id: req.user._id })
      .populate({
        path: 'images',
        populate: { path: 'verdict_id' },
      })
      .sort({ created_at: -1 })
      .lean();

    if (outcome) {
      submissions = submissions.filter((sub) =>
        sub.images.some((img) => img.verdict_id && img.verdict_id.outcome === outcome)
      );
    }

    if (category) {
      submissions = submissions.filter((sub) =>
        sub.images.some(
          (img) =>
            img.verdict_id &&
            img.verdict_id.category_results.some(
              (cr) => cr.category === category && cr.classification === 'detected'
            )
        )
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      submissions = submissions.filter((sub) => new Date(sub.created_at) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      submissions = submissions.filter((sub) => new Date(sub.created_at) <= end);
    }

    const submissionIds = submissions.map((s) => s._id);
    const appeals = await Appeal.find({ submission_id: { $in: submissionIds } }).lean();
    const appealMap = {};
    appeals.forEach((a) => {
      appealMap[a.submission_id.toString()] = a;
    });

    const result = submissions.map((sub) => ({
      ...sub,
      appeal: appealMap[sub._id.toString()] || null,
    }));

    res.json(result);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Failed to fetch submissions.' });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    })
      .populate({
        path: 'images',
        populate: { path: 'verdict_id' },
      })
      .lean();

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    const appeal = await Appeal.findOne({ submission_id: submission._id }).lean();

    res.json({ ...submission, appeal });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Failed to fetch submission.' });
  }
};
