import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const login = async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: 'Name and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const existingUser = await User.findOne({ name });

    if (!existingUser) {
      // Hash and save the new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, password: hashedPassword });
      await newUser.save();

      const token = jwt.sign({ name }, process.env.JWT_SECRET, { expiresIn: '1h' });
      req.session.user = { name };
      res.cookie('token', token, { httpOnly: true });

      return res.json({ message: "User added", token });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign({ name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    req.session.user = { name };
    res.cookie('token', token, { httpOnly: true });

    return res.json({ message: 'User logged in', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  });
};
