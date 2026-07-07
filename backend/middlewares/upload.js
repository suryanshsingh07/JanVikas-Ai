/**
 * JanVikas AI — Multer Upload Configuration
 * Handles file uploads with size and type validation
 */

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createError } = require('../utils/helpers');

// ─── Allowed File Types ───────────────────────────────────
const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|gif|webp/;
const ALLOWED_VIDEO_TYPES = /mp4|mov|avi|mkv|webm/;
const ALLOWED_AUDIO_TYPES = /mp3|wav|ogg|m4a|webm/;
const ALLOWED_DOC_TYPES = /pdf|doc|docx|txt/;

// ─── Local Disk Storage (fallback for dev) ────────────────
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// ─── Memory Storage (for Firebase upload) ────────────────
const memoryStorage = multer.memoryStorage();

// ─── File Filter ──────────────────────────────────────────
const fileFilter = (allowedTypes) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimetype = file.mimetype.split('/')[1];

  if (allowedTypes.test(ext) || allowedTypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(createError(`Invalid file type. Allowed: ${allowedTypes}`, 400), false);
  }
};

// ─── Image Upload ─────────────────────────────────────────
const uploadImages = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 5,
  },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
});

// ─── Voice Upload ─────────────────────────────────────────
const uploadVoice = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
    files: 1,
  },
  fileFilter: fileFilter(ALLOWED_AUDIO_TYPES),
});

// ─── Document Upload ──────────────────────────────────────
const uploadDocuments = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
    files: 3,
  },
  fileFilter: fileFilter(ALLOWED_DOC_TYPES),
});

// ─── Mixed Upload (images + videos + voice in one request) ─────────
const uploadMixed = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB to accommodate videos
    files: 8, // 5 images + 2 videos + 1 voice
  },
});

// ─── Avatar Upload ────────────────────────────────────────
const uploadAvatar = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
});

module.exports = {
  uploadImages,
  uploadVoice,
  uploadDocuments,
  uploadMixed,
  uploadAvatar,
};
