/**
 * Gov Ingest Service — simple ingester for gov datasets (placeholder)
 */
const GovData = require('../models/GovData');

const sampleGovRecords = [
  {
    source: 'census_2021',
    type: 'population',
    properties: { population: 12500, households: 2800 },
    location: { type: 'Point', coordinates: [77.5946, 12.9716], district: 'Bengaluru Urban', state: 'Karnataka', address: 'Central Town' },
  },
  {
    source: 'infrastructure_db',
    type: 'infrastructure',
    properties: { type: 'school', name: 'Govt Primary School', status: 'active' },
    location: { type: 'Point', coordinates: [77.5950, 12.9720], district: 'Bengaluru Urban', state: 'Karnataka', address: 'Near Market' },
  },
  {
    source: 'development_plan_2025',
    type: 'plan',
    properties: { title: 'Drainage Improvement', budget: 5000000, timeframe: '2024-2026' },
    location: { type: 'Point', coordinates: [77.5960, 12.9700], district: 'Bengaluru Urban', state: 'Karnataka', address: 'Ward 12' },
  }
];

const ingestSampleData = async () => {
  // Keep idempotent: only insert if no GovData exists
  const count = await GovData.countDocuments();
  if (count > 0) return { inserted: 0 };
  const inserted = await GovData.insertMany(sampleGovRecords);
  return { inserted: inserted.length };
};

module.exports = { ingestSampleData };
