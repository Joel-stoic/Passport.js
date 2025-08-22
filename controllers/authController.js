import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { addToBlacklist } from '../config/blacklist.js';
import redisClient from '../config/redisClient.js'; // 🔁 Import Redis client
import { sendLoginEmail } from '../config/emailService.js';
import { loginSchema } from '../config/authValidation.js';

// LOGIN
export const login = async (req, res) => {
  // ✅ Joi validation
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, password } = req.body;

  try {
    const existingUser = await User.findOne({ name });

    if (!existingUser) {
      // New user creation
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, password: hashedPassword });
      await newUser.save();

      const token = generateToken({ name });
      req.session.user = { name };
      res.cookie('token', token, { httpOnly: true });

      await redisClient.set(`session:${name}`, JSON.stringify({ name }), { EX: 3600 });

      return res.json({ message: 'User added', token });
    }

    // Existing user login
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = generateToken({ name });
    req.session.user = { name };
    res.cookie('token', token, { httpOnly: true });

    await redisClient.set(`session:${name}`, JSON.stringify({ name }), { EX: 3600 });

    return res.json({ message: 'User logged in', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  const token = req.cookies.token;
  const user = req.session.user;

  if (token) {
    addToBlacklist(token);
  }

  // 🗑️ Delete session from Redis
  if (user?.name) {
    await redisClient.del(`session:${user.name}`);
  }

  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });

    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  });
};

// PASSPORT LOGIN SUCCESS
export const passportloginSuccess = async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');

  const token = generateToken({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });

  req.session.user = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  };

  res.cookie('token', token, { httpOnly: true });

  await redisClient.set(
    `session:${req.user.name}`,
    JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    }),
    { EX: 3600 }
  );

  

  // Send login success email
  sendLoginEmail(req.user.email, req.user.name);

  res.redirect('/');
};

export const passportlogout = async (req, res) => {
  const user = req.session.user;

  try {
    // 🗑️ Delete user session from Redis if it exists
    if (user?.name) {
      await redisClient.del(`session:${user.name}`);
    }

    // 🔒 Passport logout
    req.logout(err => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).send('Logout failed');
      }

      // 💣 Destroy session
      req.session.destroy(() => {
        // 🍪 Clear token cookie
        res.clearCookie('token');
        // 🚀 Redirect to home
        res.redirect('/');
      });
    });
  } catch (err) {
    console.error('Logout exception:', err);
    res.status(500).json({ error: 'Server error during logout' });
  }
};


// PASSPORT LOGOUT
// export const passportlogout = async (req, res) => {
//   const user = req.session.user;

//   // 🗑️ Delete session from Redis
//   if (user?.name) {
//     await redisClient.del(`session:${user.name}`);
//   }

//   req.logout(err => {
//     if (err) return res.status(500).send('Logout failed');

//     req.session.destroy(() => {
//       res.clearCookie('token');
//       res.redirect('/');
//     });
//   });
// };
