// controllers/cloudinaryController.js
import Cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs';
// 1. Import the Video model
import Cloud from '../models/Cloud.js';

export const cloudinaryUpload = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await Cloudinary.uploader.upload(file.path, {
      resource_type: 'video',
      folder: 'videos',
    });

    // Clean up the temporary file
    fs.unlinkSync(file.path);

    // 2. Create and save the video metadata to MongoDB
    const newVideo = new Cloud({
      filename: file.originalname,
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
    });
    await newVideo.save();

    res.status(200).json({
      message: 'Video uploaded successfully and saved to DB!',
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Video upload failed' });
  }
};