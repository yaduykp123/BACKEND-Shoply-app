const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/payment.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/create-order", protect, ctrl.createOrder);
router.post("/verify-payment", protect, ctrl.verifyPayment);

module.exports = router;
