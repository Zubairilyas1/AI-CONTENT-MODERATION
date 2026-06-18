const mongoose = require('mongoose');

const embeddedPolicySchema = new mongoose.Schema(
  {
    category: String,
    is_enabled: Boolean,
    confidence_threshold: Number,
    enforcement_behavior: String,
    updated_at: Date,
  },
  { _id: false }
);

const policySnapshotSchema = new mongoose.Schema({
  captured_at: { type: Date, default: Date.now },
  policies: [embeddedPolicySchema],
});

module.exports = mongoose.model('PolicySnapshot', policySnapshotSchema);
