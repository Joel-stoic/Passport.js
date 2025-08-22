// router file
import express from 'express';
import { uploadVideo, getVideoList, streamVideo } from '../controllers/videoController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import upload from '../config/gridfs.js'; // ✅ use the shared config

const router = express.Router();

router.post('/upload', authenticate, upload.single('video'), uploadVideo);
router.get('/videos', authenticate, getVideoList);
router.get('/video/:filename', streamVideo);


export default router;
