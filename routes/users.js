const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const secret = process.env.SECRET;

// GET all users (protected by JWT + admin check in auth middleware)
router.get('/', async (req, res) => {
  try {
    const userList = await User.find().select('-passwordHash');
    res.status(200).json(userList);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// REGISTER user (public route – whitelisted in jwt)
router.post('/', async (req, res) => {
  try {
    const { username, email, password, city } = req.body;

    // prevent duplicate emails
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'User with this email already exists' });
    }

    const user = new User({
      username,
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      city,
      isAdmin: false, // ⬅️ ignore req.body.isAdmin for security
    });

    const createdUser = await user.save();

    // send back safe fields only
    res.status(201).json({
      id: createdUser._id,
      username: createdUser.username,
      email: createdUser.email,
      city: createdUser.city,
      isAdmin: createdUser.isAdmin,
      createdAt: createdUser.createdAt,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to save user to database',
      details: err.message,
    });
  }
});

// GET single user (admin only via middleware)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// LOGIN user (public route – whitelisted in jwt)
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+passwordHash');

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.passwordHash);
    if (!passwordIsValid) {
      return res.status(400).json({ success: false, message: 'Password is wrong!' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: '2d' }
    );

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
