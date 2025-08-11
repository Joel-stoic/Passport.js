// index.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from 'redis';
import './config/passport.js';
import videoRoutes from './routes/videoRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// __dirname workaround for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const conn = mongoose.connection;

conn.once('open', () => {
  console.log('✅ MongoDB connected');
});
conn.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

// ✅ REDIS connection using Docker host
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});


redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});
redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});
await redisClient.connect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'mysecret',
    resave: false,
    saveUninitialized: true,
  })
);

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', videoRoutes);    // e.g., /api/upload
app.use('/auth', authRoutes);    // login, logout, etc.

// Test Redis Route (optional)
app.get('/redis-test', async (req, res) => {
  await redisClient.set('test-key', 'Redis is working!');
  const value = await redisClient.get('test-key');
  res.send(`🔑 test-key = ${value}`);
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
