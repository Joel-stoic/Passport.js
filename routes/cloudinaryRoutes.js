// routes/cloudinaryRoutes.js
import express from 'express';
import multer from 'multer';
import { cloudinaryUpload } from '../controllers/cloudinaryController.js'; // ✅ Matches export now

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/temp'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/upload', upload.single('video'), cloudinaryUpload);

export const cloudinaryRoute = router;
