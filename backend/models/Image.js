const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  file_path: { type: String, required: true },
  verdict_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Verdict' },
});

module.exports = mongoose.model('Image', imageSchema);
