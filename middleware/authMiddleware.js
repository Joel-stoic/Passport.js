// middleware/authMiddleware.js
import { verifyToken } from '../utils/jwt.js';
import { isTokenBlacklisted } from '../config/blacklist.js'

export const authenticate = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const blacklisted = await isTokenBlacklisted(token);
  if (blacklisted) {
    return res.status(401).json({ error: 'Token is blacklisted' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
