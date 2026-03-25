const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/auth');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// GET /api/me — returns the currently authenticated user's info
router.get('/me', apiLimiter, authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
    },
  });
});

module.exports = router;
