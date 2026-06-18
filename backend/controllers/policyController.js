const Policy = require('../models/Policy');
const { CATEGORIES } = require('../models/Policy');

exports.getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().sort({ category: 1 });
    res.json(policies);
  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({ message: 'Failed to fetch policies.' });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid policy category.' });
    }

    const { is_enabled, confidence_threshold, enforcement_behavior } = req.body;
    const updates = {};

    if (typeof is_enabled === 'boolean') updates.is_enabled = is_enabled;
    if (confidence_threshold !== undefined) {
      const threshold = Number(confidence_threshold);
      if (isNaN(threshold) || threshold < 0 || threshold > 100) {
        return res.status(400).json({ message: 'Confidence threshold must be 0-100.' });
      }
      updates.confidence_threshold = threshold;
    }
    if (enforcement_behavior !== undefined) {
      if (!['Auto-Block', 'Flag for Review'].includes(enforcement_behavior)) {
        return res.status(400).json({ message: 'Invalid enforcement behavior.' });
      }
      updates.enforcement_behavior = enforcement_behavior;
    }

    updates.updated_at = new Date();

    const policy = await Policy.findOneAndUpdate({ category }, updates, {
      new: true,
      runValidators: true,
    });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found.' });
    }

    res.json(policy);
  } catch (error) {
    console.error('Update policy error:', error);
    res.status(500).json({ message: 'Failed to update policy.' });
  }
};
