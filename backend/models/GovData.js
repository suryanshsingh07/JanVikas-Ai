/**
 * GovData Model — government datasets for comparison
 */
const mongoose = require('mongoose');

const govDataSchema = new mongoose.Schema({
  source: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'population', 'infrastructure', 'plan'
  properties: { type: mongoose.Schema.Types.Mixed },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }, // [lng, lat]
    address: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
  },
}, { timestamps: true });

// Create geospatial index on the location subdocument
govDataSchema.index({ 'location': '2dsphere' });

module.exports = mongoose.model('GovData', govDataSchema);

module.exports = mongoose.model('GovData', govDataSchema);
