const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  brand: String,
  model: String,
  price: Number,
  storage: String,
  ram: String,
  color: String,
  battery: String,
  camera: String,
  image: String,
  inStock: Boolean
}, { timestamps: true });

module.exports = mongoose.model('Products', productSchema);