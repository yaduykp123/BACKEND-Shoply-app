const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");

// CREATE RAZORPAY ORDER
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    console.log("Initiating Razorpay Order for amount:", amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount. Must be greater than 0." });
    }

    // Initialize Razorpay inside the handler to ensure it uses the latest env vars
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_your_key_id') {
       console.error("Error: Razorpay keys are still placeholders or missing.");
       return res.status(500).json({ message: "Razorpay keys not configured correctly on server." });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);    

    console.log("Razorpay Order Created Successfully:", order.id);

    if (!order) {
      return res.status(500).json({ message: "Failed to create Razorpay order" });
    }

    res.json(order);
  } catch (err) {
    console.error("Razorpay Order Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// VERIFY PAYMENT AND PLACE ORDER
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      total,
    } = req.body;

    console.log("Verifying Payment for Order:", razorpay_order_id);

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString()) 
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    console.log("Is Signature Authentic:", isAuthentic);
    if (!isAuthentic) {
       console.log("Expected:", expectedSignature);
       console.log("Received:", razorpay_signature);
    }

    if (!isAuthentic) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Payment is authentic, now place the order in our DB
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

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
      status: "Paid",
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id
    };

    user.orders.push(order);
    
    // Clear cart or remove purchased items
    if (req.body.isCartPurchase) {
      user.cart = [];
    } else if (items && items.length > 0) {
      // If it was a single item purchase, remove that specific item from the cart if it exists
      const purchasedIds = items.map(item => item.id);
      user.cart = user.cart.filter(cartItem => !purchasedIds.includes(cartItem.id));
    }

    await user.save();

    res.json({ 
      message: "Payment verified and order placed successfully", 
      orders: user.orders,
      paymentId: razorpay_payment_id 
    });
  } catch (err) {
    console.error("Payment Verification Error:", err);
    res.status(500).json({ error: err.message });
  }
};
