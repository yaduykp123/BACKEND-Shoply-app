
const mongoose = require("mongoose");


const cartItemSchema = new mongoose.Schema({
  id: String,
  brand: String,
  model: String,
  price: Number,
  image: String,
  quantity: {
    type: Number,
    default: 1,
  },
});

const wishlistSchema = new mongoose.Schema({
  id: String,
  brand: String,
  model: String,
  price: Number,
  image: String,
  inStock: Boolean,
  storage: String,
  ram: String,
  color: String,
});


const orderSchema = new mongoose.Schema({
  id: Number,
  items: [cartItemSchema],
  total: Number,
  date: Date,
  status: {
    type: String,
    default: "Order placed",
  },
});


const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" },
    isBlock: { type: Boolean, default: false },

    refreshToken: String,

    address: Object,
    profileImage: { type: String, default: "" },
    gender: { type: String, default: "" },

    //  Updated...
    cart: [cartItemSchema],

    wishlist: [wishlistSchema],
    orders: [orderSchema],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);