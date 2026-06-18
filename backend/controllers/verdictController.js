const Verdict = require('../models/Verdict');
const Image = require('../models/Image');
const Submission = require('../models/Submission');

exports.getVerdictByImageId = async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId).populate('verdict_id');

    if (!image) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    const submission = await Submission.findById(image.submission_id);
    if (!submission || submission.user_id.toString() !== req.user._id.toString()) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
      }
    }

    if (!image.verdict_id) {
      return res.status(404).json({ message: 'Verdict not found for this image.' });
    }

    res.json(image.verdict_id);
  } catch (error) {
    console.error('Get verdict error:', error);
    res.status(500).json({ message: 'Failed to fetch verdict.' });
  }
};
