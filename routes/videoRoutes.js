import express from 'express';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { uploadVideo, getVideoList, streamVideo } from '../controllers/videoController.js';
import { authenticate } from '../middleware/authMiddleware.js'; // ✅ import it

dotenv.config();
const router = express.Router();

// Multer GridFS Storage setup
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: Date.now() + '_' + file.originalname,
      bucketName: 'videos',
    };
  },
});

const upload = multer({ storage });

// ✅ Protect upload and listing
router.post('/upload', authenticate, upload.single('video'), uploadVideo);
router.get('/videos', authenticate, getVideoList);

// ❌ Leave public if needed (e.g., for streaming by anyone)
router.get('/video/:filename', streamVideo);

export default router;
