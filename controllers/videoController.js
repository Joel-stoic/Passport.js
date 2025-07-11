import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = new GridFSBucket(conn.db, { bucketName: 'videos' });
});

// Upload video
export const uploadVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  res.status(201).json({
    message: 'Video uploaded successfully',
    file: {
      id: req.file.id,
      filename: req.file.filename,
      originalname: req.file.originalname,
    },
  });
};

// List all videos
export const getVideoList = async (req, res) => {
  try {
    const files = await conn.db.collection('videos.files').find().sort({ uploadDate: -1 }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'No videos found' });
    }

    res.json(files.map(file => ({
      filename: file.filename,
      length: file.length,
      uploadDate: file.uploadDate,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching video list' });
  }
};

// Stream video
export const streamVideo = async (req, res) => {
  try {
    const { filename } = req.params;
    const range = req.headers.range;

    if (!range) {
      return res.status(416).send("Requires Range header");
    }

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'videos' });

    const files = await db.collection('videos.files').findOne({ filename });

    if (!files) {
      return res.status(404).send("Video not found in model");
    }

    const videoSize = files.length;
    const CHUNK_SIZE = 1 * 1e6; // 1MB

    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    if (start >= videoSize) {
      return res.status(416).send("Requested range not satisfiable");
    }

    const contentLength = end - start + 1;

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const downloadStream = bucket.openDownloadStreamByName(filename, {
      start,
      end: end + 1 // Mongo expects end to be exclusive
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error streaming video");
  }
};
