const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  patchProduct,
  deleteProduct
} = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin only routes
router.post('/', protect, adminOnly, upload.single('image'), createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.patch('/:id', protect, adminOnly, upload.single('image'), patchProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;