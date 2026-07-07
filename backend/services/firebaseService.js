/**
 * JanVikas AI — Firebase Storage Service
 * Upload files to Firebase Storage with fallback
 */

const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getStorageBucket } = require('../config/firebase');
const logger = require('../utils/logger');

/**
 * Upload a file buffer to Firebase Storage
 * @param {Buffer} fileBuffer - File buffer from Multer
 * @param {string} originalName - Original filename
 * @param {string} folder - Storage folder (e.g., 'images', 'voice', 'documents')
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} Public download URL
 */
const uploadFile = async (fileBuffer, originalName, folder = 'uploads', mimeType = 'application/octet-stream') => {
  try {
    const bucket = getStorageBucket();

    // ─── Fallback: return placeholder URL if Firebase not configured ─
    if (!bucket) {
      logger.warn('Firebase not configured — returning placeholder URL');
      return `https://placehold.co/400x300?text=File+Uploaded`;
    }

    const ext = path.extname(originalName);
    const filename = `${folder}/${uuidv4()}${ext}`;
    const file = bucket.file(filename);

    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Make the file publicly accessible
    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    logger.info(`✅ File uploaded to Firebase: ${publicUrl}`);
    return publicUrl;

  } catch (error) {
    logger.error(`Firebase upload error: ${error.message}`);
    // Return placeholder on error during development
    return `https://placehold.co/400x300?text=Upload+Error`;
  }
};

/**
 * Upload multiple image files
 * @param {Array} files - Multer file array
 * @returns {Promise<string[]>} Array of public URLs
 */
const uploadImages = async (files) => {
  const uploadPromises = files.map((file) =>
    uploadFile(file.buffer, file.originalname, 'images', file.mimetype)
  );
  return Promise.all(uploadPromises);
};

/**
 * Upload a voice recording
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} Public URL
 */
const uploadVoice = async (file) => {
  return uploadFile(file.buffer, file.originalname, 'voice', file.mimetype);
};

/**
 * Upload documents
 * @param {Array} files - Multer file array
 * @returns {Promise<string[]>} Array of public URLs
 */
const uploadDocuments = async (files) => {
  const uploadPromises = files.map((file) =>
    uploadFile(file.buffer, file.originalname, 'documents', file.mimetype)
  );
  return Promise.all(uploadPromises);
};

/**
 * Delete a file from Firebase Storage
 * @param {string} fileUrl - Public URL of the file
 */
const deleteFile = async (fileUrl) => {
  try {
    const bucket = getStorageBucket();
    if (!bucket) return;

    // Extract filename from URL
    const urlParts = fileUrl.split(`/${bucket.name}/`);
    if (urlParts.length < 2) return;

    const filename = urlParts[1];
    await bucket.file(filename).delete();
    logger.info(`🗑️ Deleted file from Firebase: ${filename}`);
  } catch (error) {
    logger.error(`Firebase delete error: ${error.message}`);
  }
};

module.exports = { uploadFile, uploadImages, uploadVoice, uploadDocuments, deleteFile };
