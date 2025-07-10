// gridfs.js
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import dotenv from 'dotenv';

dotenv.config();

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return {
      filename: `${Date.now()}_${file.originalname}`,
      bucketName: 'videos', // This creates 'videos.files' & 'videos.chunks'
    };
  },
});

const upload = multer({ storage });

export default upload;
