const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// ================= IMAGE NORMALIZATION =================

// تحويل أي رابط صورة إلى مسار نسبي مثل: uploads/file.jpg
const normalizeImagePath = (input) => {
  if (!input || typeof input !== 'string') return '';

  let value = input.trim();

  try {
    // إذا كان URL كامل نحذف الـ origin ونحتفظ بالـ pathname فقط
    const url = new URL(value);
    value = url.pathname;
  } catch (_) {
    // ليس URL كامل → نكمل عادي
  }

  // نحذف أي / في البداية
  value = value.replace(/^\/+/, '');

  return value;
};

const normalizeImagesArray = (images) =>
  Array.isArray(images)
    ? images
        .filter(Boolean)
        .map(normalizeImagePath)
        .filter(Boolean)
    : [];

// ================= GET ALL PRODUCTS =================

router.get('/', async (req, res) => {
  try {
    let filter = {};

    if (req.query.categories) {
      const categoryNames = req.query.categories.split(',');

      const categories = await Category.find({
        name: { $in: categoryNames.map(name => new RegExp(`^${name}$`, 'i')) }
      });

      if (categories.length > 0) {
        filter = { category: { $in: categories.map(c => c._id) } };
      } else {
        return res.status(200).send([]);
      }
    }

    const productList = await Product.find(filter).populate('category', 'name');
    res.status(200).send(productList);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= COUNT =================

router.get('/count', async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    res.status(200).json({ productCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= LATEST =================

router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const excludeId = req.query.exclude;

    let query = {};
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const latestProducts = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category', 'name');

    res.status(200).json(latestProducts);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= GET BY ID =================

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).send(product);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= CREATE PRODUCT =================

router.post('/', async (req, res) => {
  try {
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    if (req.body.price === undefined || isNaN(req.body.price)) {
      return res.status(400).json({ success: false, message: 'Valid price is required' });
    }

    if (!req.body.category) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    const product = new Product({
      name: req.body.name.trim(),
      image: normalizeImagePath(req.body.image),
      images: normalizeImagesArray(req.body.images),
      stock: req.body.stock ? Number(req.body.stock) : 0,
      price: Number(req.body.price),
      category: category._id,
      description: req.body.description || 'No description provided',
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      details: err.message,
    });
  }
});

// ================= UPDATE PRODUCT =================

router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      image: normalizeImagePath(req.body.image),
      images: normalizeImagesArray(req.body.images),
      stock: req.body.stock,
      price: req.body.price,
      description: req.body.description,
    };

    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      updateData.category = category._id;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).send(product);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      details: err.message,
    });
  }
});

// ================= DELETE PRODUCT =================

router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
