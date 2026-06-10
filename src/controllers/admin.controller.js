const User = require("../models/User");
const Product = require("../models/Products");

// 🔹 GET DASHBOARD STATS
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({role:"user"});
//     const totalUser = await User.aggregate([{$match:{role:"user"}}, {$count:"TotalUsers"}])
// const totalUsers = totalUser[0]?.TotalUsers || 0;
    console.log(totalUsers);


    const totalProducts = await Product.countDocuments();

   
    
    // Calculate total orders and total revenue across all users

     const Totals = await User.aggregate([{$unwind:"$orders"},{$group:{_id:null,"totalREvenue":{$sum:"$orders.total"},"totalORders":{$sum:1}}}])
       const TotalorderS = Totals[0]?.totalORders || 0
       const totalREvenue = Totals[0]?.totalREvenue || 0
           


    res.json({
      users: totalUsers,
      products: totalProducts,
      orders: TotalorderS,
      revenue: totalREvenue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 TOGGLE USER BLOCK STATUS
exports.toggleBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlock = !user.isBlock;
    await user.save();

    res.json({ message: `User ${user.isBlock ? 'blocked' : 'unblocked'}`, isBlock: user.isBlock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const users = await User.find({ "orders.0": { $exists: true } }, "email orders");
    
    const allOrders = users.flatMap(user => 
      user.orders.map(order => ({
        ...order.toObject(),
        userEmail: user.email,
        userId: user._id
      }))
    );

    // Sort by date descending
    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(allOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
