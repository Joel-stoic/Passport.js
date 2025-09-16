// models/Video.js
import mongoose from 'mongoose';

const cloudSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  cloudinaryUrl: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const Cloud = mongoose.model('Cloudinary', cloudSchema);

export default Cloud;