const express = require('express');
const router = express.Router();
const User = require('../models/User');
// GET user
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

// UPDATE user (cart, wishlist, etc.)
router.patch('/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(user);
});

module.exports = router;