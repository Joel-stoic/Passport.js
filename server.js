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
import stripeRoutes from './routes/stripeRoutes.js';
import { authenticate } from './middleware/authMiddleware.js';
import {cloudinaryRoute} from './routes/cloudinaryRoutes.js'
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const conn = mongoose.connection;

conn.once('open', () => console.log('✅ MongoDB connected'));
conn.on('error', (err) => console.error('❌ MongoDB error:', err));

// Connect to Redis
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('error', (err) => console.error('❌ Redis error:', err));
await redisClient.connect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', videoRoutes);
app.use('/auth', authRoutes);
app.use('/stripe',authenticate, stripeRoutes);

app.use('/cloudinary',cloudinaryRoute)

// Pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/stripe',authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'subscription.html'));
});

// Start
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});