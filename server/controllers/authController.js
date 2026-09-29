import bcrypt from 'bcryptjs';
import { generateToken } from '../config/jwt.js';
import { store } from '../services/store.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password, avatar, bio } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
    }

    if (username.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long.' });
    }

    if (store.getUserByEmail(email)) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    if (store.getUserByUsername(username)) {
      return res.status(400).json({ success: false, message: 'Username is already taken.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = store.createUser({
      username,
      email,
      passwordHash,
      avatar,
      bio,
    });

    const token = generateToken({ userId: newUser._id, username: newUser.username });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: 'Email/username and password are required.' });
    }

    const user = store.getUserByEmail(emailOrUsername) || store.getUserByUsername(emailOrUsername);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    store.setUserStatus(user._id, 'online');
    const safeUser = store.getUserById(user._id);
    const token = generateToken({ userId: user._id, username: user.username });

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export const demoLogin = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const targetUserId = userId || 'user_soham';

    const user = store.getUserById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Demo user not found.' });
    }

    store.setUserStatus(targetUserId, 'online');
    const safeUser = store.getUserById(targetUserId);
    const token = generateToken({ userId: safeUser._id, username: safeUser.username });

    return res.json({
      success: true,
      message: `Switched demo identity to ${safeUser.username}.`,
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getDemoUsers = async (req, res) => {
  const users = store.getAllUsers().filter(u => ['user_soham', 'user_rahul', 'user_aman', 'user_priya'].includes(u._id));
  return res.json({ success: true, users });
};

export const getMe = async (req, res) => {
  const user = store.getUserById(req.user._id);
  return res.json({ success: true, user });
};

export const logout = async (req, res) => {
  if (req.user) {
    store.setUserStatus(req.user._id, 'offline');
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
};
