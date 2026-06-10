const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/admin.controller");

// All admin routes are protected by both protect and adminOnly middlewares
router.use(protect);
router.use(adminOnly);

router.get("/stats", ctrl.getStats);
router.get("/users", ctrl.getAllUsers);
router.get("/users/:id", ctrl.getUserById);
router.patch("/users/:id/toggle-block", ctrl.toggleBlock);
router.get("/orders", ctrl.getAllOrders);

module.exports = router;
