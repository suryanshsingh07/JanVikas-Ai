/**
 * JanVikas AI — Firebase Admin SDK Configuration
 * Initializes Firebase Admin for Storage operations
 */

const admin = require('firebase-admin');
const logger = require('../utils/logger');

let firebaseApp = null;

const initializeFirebase = () => {
  // Skip if already initialized
  if (firebaseApp) return firebaseApp;

  // Skip if Firebase credentials are not configured (dev mode)
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
    logger.warn('⚠️  Firebase credentials not configured. Storage will use local fallback.');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    logger.info('✅ Firebase Admin SDK initialized');
    return firebaseApp;
  } catch (error) {
    logger.error(`❌ Firebase initialization failed: ${error.message}`);
    return null;
  }
};

/**
 * Get Firebase Storage bucket
 * @returns {Object|null} Firebase storage bucket or null
 */
const getStorageBucket = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  if (!firebaseApp) return null;

  return admin.storage().bucket();
};

/**
 * Get Firebase Admin instance
 * @returns {Object|null} Firebase admin instance or null
 */
const getFirebaseAdmin = () => admin;

module.exports = {
  initializeFirebase,
  getStorageBucket,
  getFirebaseAdmin,
};
