const Product = require('../models/Products');

// 🔹 CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // If a file was uploaded, use its Cloudinary path
    if (req.file) {
      productData.image = req.file.path;
    }

    const product = await Product.create(productData);
    const formatted = {
      ...product._doc,
      id: product._id.toString()
    };
    res.status(201).json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 GET ALL PRODUCTS (With Search, Brand & Pagination)
exports.getAllProducts = async (req, res) => {
  try {
    const { search, brand, page = 1, limit = 6 } = req.query;
    let filter = {};

    // 1. Search Logic
    if (search) {
      const words = search.trim().split(/\s+/);
      filter.$and = words.map(word => ({
        $or: [
          { brand: { $regex: word, $options: 'i' } },
          { model: { $regex: word, $options: 'i' } },
          { color : {$regex: word, $options: 'i'} },
          { battery: {$regex: word, $options: 'i'} }
        ]
      }));
    }

    // 2. Brand Logic
    if (brand) {
      if (brand.toLowerCase() === "others") {
        filter.brand = { $nin: ["Apple", "Google", "Samsung"] };
      } else {
        filter.brand = { $regex: `^${brand}$`, $options: 'i' };
      }
    }

    // 3. Price Logic (Budget Filtering)
    const { minPrice, maxPrice } = req.query;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gt = Number(minPrice);
      if (maxPrice && maxPrice !== "Infinity") filter.price.$lte = Number(maxPrice);
    }

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    const formatted = products.map((item) => ({
      ...item._doc,
      id: item._id.toString()
    }));

    res.json({
      products: formatted,
      hasMore: skip + formatted.length < total,
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    const formatted = {
      ...product._doc,
      id: product._id.toString()
    };

    res.json(formatted);
  } catch (err) {
    res.status(404).json({ message: "Product not found" });
  }
};

// 🔹 UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If a new file was uploaded, update the image field
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    const formatted = {
      ...updated._doc,
      id: updated._id.toString()
    };
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 PARTIAL UPDATE PRODUCT (PATCH)
exports.patchProduct = async (req, res) => {
  try {
    const patchData = { ...req.body };

    // If a new file was uploaded, update the image field
    if (req.file) {
      patchData.image = req.file.path;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: patchData },
      { new: true }
    );
    const formatted = {
      ...updated._doc,
      id: updated._id.toString()
    };
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};