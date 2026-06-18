const mongoose = require('mongoose');

const appealSchema = new mongoose.Schema({
  submission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  justification: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
  admin_response: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
  resolved_at: { type: Date },
});

module.exports = mongoose.model('Appeal', appealSchema);
