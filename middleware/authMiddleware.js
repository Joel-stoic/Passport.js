// middleware/authMiddleware.js
import { verifyToken } from '../utils/jwt.js';
import { isTokenBlacklisted } from '../config/blacklist.js';

export const authenticate = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Authentication Required</title>
        <style>
          body {
            background-color: #121212;
            color: #f1f1f1;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            background-color: #1f1f1f;
            padding: 2rem 3rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(255, 0, 0, 0.4);
            text-align: center;
          }
          h1 {
            color: #ff4c4c;
            margin-bottom: 1rem;
          }
          p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
          }
          a {
            display: inline-block;
            text-decoration: none;
            background: linear-gradient(145deg, #ff4c4c, #cc0000);
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            transition: background 0.3s ease;
          }
          a:hover {
            background: linear-gradient(145deg, #e60000, #ff1a1a);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Authentication Required</h1>
          <p>Please log in to continue.</p>
          <a href="/login">Go to Login</a>
        </div>
      </body>
      </html>
    `);
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
