const Appeal = require('../models/Appeal');
const Submission = require('../models/Submission');
const Image = require('../models/Image');
const Verdict = require('../models/Verdict');

exports.createAppeal = async (req, res) => {
  try {
    const { submission_id, justification } = req.body;

    if (!submission_id || !justification) {
      return res.status(400).json({ message: 'Submission ID and justification are required.' });
    }

    const submission = await Submission.findOne({
      _id: submission_id,
      user_id: req.user._id,
    }).populate({
      path: 'images',
      populate: { path: 'verdict_id' },
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    const hasAppealableVerdict = submission.images.some(
      (img) =>
        img.verdict_id &&
        (img.verdict_id.outcome === 'Flagged for Review' || img.verdict_id.outcome === 'Blocked')
    );

    if (!hasAppealableVerdict) {
      return res.status(400).json({
        message: 'Appeals can only be filed on Flagged or Blocked submissions.',
      });
    }

    const existingAppeal = await Appeal.findOne({ submission_id });
    if (existingAppeal) {
      return res.status(409).json({ message: 'An appeal already exists for this submission.' });
    }

    const appeal = await Appeal.create({
      submission_id,
      user_id: req.user._id,
      justification,
      status: 'Pending',
    });

    res.status(201).json(appeal);
  } catch (error) {
    console.error('Create appeal error:', error);
    res.status(500).json({ message: 'Failed to create appeal.' });
  }
};

exports.getAppealById = async (req, res) => {
  try {
    const appeal = await Appeal.findById(req.params.id)
      .populate('submission_id')
      .populate('user_id', 'name email')
      .lean();

    if (!appeal) {
      return res.status(404).json({ message: 'Appeal not found.' });
    }

    if (
      appeal.user_id._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json(appeal);
  } catch (error) {
    console.error('Get appeal error:', error);
    res.status(500).json({ message: 'Failed to fetch appeal.' });
  }
};

exports.getAdminAppeals = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const appeals = await Appeal.find(filter)
      .populate('user_id', 'name email')
      .populate({
        path: 'submission_id',
        populate: {
          path: 'images',
          populate: { path: 'verdict_id' },
        },
      })
      .sort({ created_at: -1 })
      .lean();

    res.json(appeals);
  } catch (error) {
    console.error('Get admin appeals error:', error);
    res.status(500).json({ message: 'Failed to fetch appeals queue.' });
  }
};

exports.resolveAppeal = async (req, res) => {
  try {
    const { status, admin_response } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Accepted or Rejected.' });
    }

    const appeal = await Appeal.findById(req.params.id);
    if (!appeal) {
      return res.status(404).json({ message: 'Appeal not found.' });
    }

    if (appeal.status !== 'Pending') {
      return res.status(400).json({ message: 'Appeal has already been resolved.' });
    }

    appeal.status = status;
    appeal.admin_response = admin_response || '';
    appeal.resolved_at = new Date();
    await appeal.save();

    if (status === 'Accepted') {
      const submission = await Submission.findById(appeal.submission_id);
      const images = await Image.find({ submission_id: submission._id });

      for (const image of images) {
        if (image.verdict_id) {
          await Verdict.findByIdAndUpdate(image.verdict_id, {
            outcome: 'Approved',
          });
        }
      }
    }

    const updated = await Appeal.findById(appeal._id)
      .populate('user_id', 'name email')
      .populate({
        path: 'submission_id',
        populate: {
          path: 'images',
          populate: { path: 'verdict_id' },
        },
      })
      .lean();

    res.json(updated);
  } catch (error) {
    console.error('Resolve appeal error:', error);
    res.status(500).json({ message: 'Failed to resolve appeal.' });
  }
};
