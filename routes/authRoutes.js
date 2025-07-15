import express from 'express';
import passport from 'passport';
import {
  login,
  logout,
  passportloginSuccess,
  passportlogout,
} from '../controllers/authController.js';

const router = express.Router();

// 🔐 Local Login & Logout
router.post('/login', login);
router.post('/logout', logout);

// 🔵 Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
  }),
  passportloginSuccess
);

// 🔵 Facebook OAuth
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/failure',
  }),
  passportloginSuccess
);

// ✅ OAuth Login Success Handler
router.get('/success', passportloginSuccess);

// 🚪 Logout
router.get('/logout', passportlogout);

// ❌ OAuth Failure
router.get('/failure', (req, res) => {
  res.status(401).json({ error: 'OAuth Authentication Failed' });
});

export default router;
