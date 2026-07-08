/**
 * Seed Gov sample data without starting the server.
 * Usage: node backend/scripts/seedGov.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const { ingestSampleData } = require('../services/govIngestService');

const run = async () => {
  try {
    await connectDB();
    const res = await ingestSampleData();
    console.log('Seed result:', res);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

run();
