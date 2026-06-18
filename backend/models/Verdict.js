const mongoose = require('mongoose');

const categoryResultSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    classification: { type: String, enum: ['detected', 'not_detected'], required: true },
    confidence: { type: Number, min: 0, max: 100, required: true },
    reasoning: { type: String, required: true },
  },
  { _id: false }
);

const verdictSchema = new mongoose.Schema({
  image_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: true },
  outcome: {
    type: String,
    enum: ['Approved', 'Flagged for Review', 'Blocked'],
    required: true,
  },
  policy_snapshot_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PolicySnapshot',
    required: true,
  },
  category_results: [categoryResultSchema],
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Verdict', verdictSchema);
