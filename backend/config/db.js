/**
 * JanVikas AI — MongoDB Database Connection
 * Manages Mongoose connection with retry logic
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || (process.env.NODE_ENV === 'development' ? 'mongodb://127.0.0.1:27017/janvikas_ai' : null);
    if (!mongoUri) {
      logger.error('Missing MONGODB_URI configuration. Please define it in backend/.env or your environment.');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri, {
      // Modern Mongoose 8.x - these options are defaults, kept for clarity
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database: ${conn.connection.name}`);

    // ─── Auto-seed GovData if empty ─────────────────────
    try {
      const GovData = require('../models/GovData');
      const govCount = await GovData.countDocuments();
      if (govCount === 0) {
        logger.info('Seeding GovData collection with sample records...');
        const { ingestSampleData } = require('../services/govIngestService');
        const result = await ingestSampleData();
        logger.info(`Seeded ${result.inserted} GovData records`);
      }
    } catch (err) {
      logger.warn(`Could not auto-seed GovData: ${err.message}`);
    }

    // ─── Connection Event Listeners ─────────────────────
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });

  } catch (error) {
    logger.error(`❌ MongoDB Connection Failed: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
