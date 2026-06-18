const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Submission', submissionSchema);
