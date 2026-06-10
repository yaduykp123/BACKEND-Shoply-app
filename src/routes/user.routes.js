// routes/user.routes.js
const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// PROFILE
router.get("/profile", protect, ctrl.getProfile);
router.patch("/update-profile", protect, ctrl.updateProfile);
router.patch("/update-avatar", protect, upload.single("profileImage"), ctrl.updateAvatar);
router.patch("/update-password", protect, ctrl.updatePassword);

// CART
router.post("/cart/add", protect, ctrl.addToCart);
router.patch("/cart/increase/:id", protect, ctrl.increaseQty);
router.patch("/cart/decrease/:id", protect, ctrl.decreaseQty);
router.delete("/cart/remove/:id", protect, ctrl.removeFromCart);

// WISHLIST
router.post("/wishlist/add", protect, ctrl.addToWishlist);
router.delete("/wishlist/remove/:id", protect, ctrl.removeFromWishlist);

// ORDER
router.post("/order", protect, ctrl.placeOrder);
router.delete("/order/:id", protect, ctrl.cancelOrder);

module.exports = router;