const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, profileImage, gender, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (gender !== undefined) user.gender = gender;
    if (address !== undefined) user.address = address;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE PASSWORD
exports.updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  ADD TO CART
exports.addToCart = async (req, res) => {
  const { product } = req.body;
  const user = await User.findById(req.user.id);

  const productId = product._id || product.id;
  const item = user.cart.find(i => i.id === productId);

  if (item) {
    item.quantity += 1;
  } else {

    user.cart.push({
      id: productId,
      brand: product.brand,
      model: product.model,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }


  await user.save();
  res.json(user.cart);
};

//  INCREASE
exports.increaseQty = async (req, res) => {
  const user = await User.findById(req.user.id);

  const item = user.cart.find(i => i.id === req.params.id);
  if (item) {
    item.quantity += 1;
  }

  await user.save();
  res.json(user.cart);
};

//  DECREASE
exports.decreaseQty = async (req, res) => {
  const user = await User.findById(req.user.id);

  const item = user.cart.find(i => i.id === req.params.id);
  if (item && item.quantity > 1) {
    item.quantity -= 1;
  }

  await user.save();
  res.json(user.cart);
};


//  REMOVE
exports.removeFromCart = async (req, res) => {
  const user = await User.findById(req.user.id);

  user.cart = user.cart.filter(item => item.id !== req.params.id);

  await user.save();
  res.json(user.cart);
};

//  WISHLIST ADD
exports.addToWishlist = async (req, res) => {
  const { product } = req.body;

  const productId = product._id || product.id;

  if (!productId) {
    return res.status(400).json({ message: "Product data missing" });
  }

  const user = await User.findById(req.user.id);

  const exists = user.wishlist.find(i => (i.id === productId || i._id?.toString() === productId));

  if (!exists) {
    user.wishlist.push({ ...product, id: productId });
  }

  await user.save();

  res.json(user.wishlist);
};

//  WISHLIST REMOVE
exports.removeFromWishlist = async (req, res) => {
  const user = await User.findById(req.user.id);

  const id = req.params.id;

  user.wishlist = user.wishlist.filter(
    (item) => (item.id !== id && item._id?.toString() !== id)
  );

  await user.save();

  res.json(user.wishlist);
};


// PLACE ORDER
exports.placeOrder = async (req, res) => {
  const { items, total } = req.body;
  const user = await User.findById(req.user.id);

  const orderItems = items && items.length > 0 ? items : user.cart;
  const orderTotal = total || orderItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const order = {
    id: Date.now(),
    items: orderItems,
    total: orderTotal,
    date: new Date(),
  };

  user.orders.push(order);
  
  // Clear cart or remove purchased items
  if (!items || items.length === 0) {
    user.cart = [];
  } else {
    // If specific items were purchased, remove them from the cart
    const purchasedIds = items.map(item => item.id);
    user.cart = user.cart.filter(cartItem => !purchasedIds.includes(cartItem.id));
  }

  await user.save();

  res.json({ message: "Order placed", orders: user.orders });
};

// UPDATE AVATAR (Cloudinary)
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update the profileImage field with the Cloudinary URL
    user.profileImage = req.file.path;
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CANCEL ORDER
exports.cancelOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare as strings to handle both ObjectId and Date.now() numbers
    const targetId = String(req.params.id);
    
    user.orders = user.orders.filter(order => 
      String(order.id) !== targetId && String(order._id) !== targetId
    );

    await user.save();
    res.json({ message: "Order cancelled", orders: user.orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};