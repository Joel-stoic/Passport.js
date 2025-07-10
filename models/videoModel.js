import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: String,
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Video', videoSchema);
