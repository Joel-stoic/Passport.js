import express from 'express';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { uploadVideo, getVideoList, streamVideo } from '../controllers/videoController.js';

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

router.post('/upload', upload.single('video'), uploadVideo);
router.get('/videos', getVideoList);
router.get('/video/:filename', streamVideo);

export default router;
