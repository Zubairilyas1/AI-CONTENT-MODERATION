const mongoose = require('mongoose');

const CATEGORIES = [
  'Graphic Violence',
  'Hate Symbols',
  'Self-Harm',
  'Extremist Propaganda',
  'Weapons & Contraband',
  'Harassment & Humiliation',
];

const policySchema = new mongoose.Schema({
  category: {
    type: String,
    enum: CATEGORIES,
    required: true,
    unique: true,
  },
  is_enabled: { type: Boolean, default: true },
  confidence_threshold: { type: Number, min: 0, max: 100, default: 70 },
  enforcement_behavior: {
    type: String,
    enum: ['Auto-Block', 'Flag for Review'],
    default: 'Flag for Review',
  },
  updated_at: { type: Date, default: Date.now },
});

policySchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Policy', policySchema);
module.exports.CATEGORIES = CATEGORIES;
