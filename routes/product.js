const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category'); // ⬅️ to validate category

// Middleware to log POST requests for debugging
router.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/') {
    console.log('📥 POST /products - Headers:', {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'Bearer [TOKEN]' : 'No token'
    });
  }
  next();
});

// GET /api/v1/products
router.get('/', async (req, res) => {
  try {
    let filter = {};

    // support multiple categories: ?categories=cat1,cat2
    if (req.query.categories) {
      const categoryNames = req.query.categories.split(',');
      // Find categories by name (case-insensitive)
      const categories = await Category.find({
        name: { $in: categoryNames.map(name => new RegExp(`^${name}$`, 'i')) }
      });
      
      if (categories.length > 0) {
        const categoryIds = categories.map(cat => cat._id);
        filter = { category: { $in: categoryIds } };
      } else {
        // If no categories found, return empty array
        return res.status(200).send([]);
      }
    }

    const productList = await Product.find(filter).populate('category', 'name');

    res.status(200).send(productList);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/products/count
router.get('/count', async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    // 0 is valid, so no if(!productCount) check
    res.status(200).json({ productCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/products/latest
// Get latest products sorted by creation date
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const excludeId = req.query.exclude; // Optional: exclude a specific product ID

    let query = {};
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    // If excluding a product, fetch limit + 1 to ensure we have enough after exclusion
    // Otherwise just fetch the limit
    const fetchLimit = excludeId ? limit + 1 : limit;

    const latestProducts = await Product.find(query)
      .sort({ createdAt: -1 }) // Sort by createdAt descending (newest first)
      .limit(fetchLimit)
      .populate('category', 'name');

    // If we excluded a product and got more than limit, trim to limit
    const result = latestProducts.slice(0, limit);

    res.status(200).json(result);
  } catch (err) {
    console.error('❌ Error fetching latest products:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      details: 'Failed to fetch latest products'
    });
  }
});

// GET /api/v1/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    res.status(200).send(product);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/products
router.post('/', async (req, res) => {
  try {
    // Log the incoming request body for debugging
    console.log('📦 POST /products - Request body:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    if (req.body.price === undefined || req.body.price === null || isNaN(req.body.price)) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }

    if (!req.body.category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    // Find category by ID (ObjectId)
    // The frontend now sends category._id, so we should only look up by ID
    let category = null;
    
    if (req.body.category) {
      // Try to find by ID first (this is what we expect from the frontend)
      category = await Category.findById(req.body.category);
      
      // If not found by ID and it looks like a valid ObjectId format, log an error
      if (!category && /^[0-9a-fA-F]{24}$/.test(req.body.category)) {
        console.error('❌ Category ID not found in database:', req.body.category);
        return res.status(400).json({
          success: false,
          message: 'Category ID not found in database.'
        });
      }
      
      // Fallback: if it's not a valid ObjectId format, try to find by name (for backward compatibility)
      if (!category && !/^[0-9a-fA-F]{24}$/.test(req.body.category)) {
        console.warn('⚠️ Category value is not a valid ObjectId, trying to find by name:', req.body.category);
        category = await Category.findOne({
          name: new RegExp(`^${req.body.category}$`, 'i')
        });
      }
    }
    
    if (!category) {
      console.error('❌ Category not found:', req.body.category);
      return res
        .status(400)
        .json({ success: false, message: 'Invalid category. Category not found in database.' });
    }

    // Ensure description has a value (required by schema)
    const description = req.body.description && req.body.description.trim() 
      ? req.body.description.trim() 
      : 'No description provided';

    const productData = {
      name: req.body.name.trim(),
      image: req.body.image ? req.body.image.trim() : '',
      images: Array.isArray(req.body.images) ? req.body.images.filter(img => img && img.trim()) : [],
      stock: req.body.stock !== undefined && req.body.stock !== null ? Number(req.body.stock) : 0,
      price: Number(req.body.price),
      category: category._id,
      description: description,
    };

    console.log('📦 Creating product with data:', JSON.stringify(productData, null, 2));

    const product = new Product(productData);

    const createdProduct = await product.save();
    console.log('✅ Product created successfully:', createdProduct._id);
    res.status(201).json(createdProduct);
  } catch (err) {
    // Log the full error for debugging
    console.error('❌ Error creating product:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors || {}).map(e => e.message).join(', ');
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors || err.message,
        fullError: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      console.error('Duplicate key error:', err.keyValue);
      return res.status(400).json({
        success: false,
        error: 'Duplicate entry',
        details: 'A product with this information already exists'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Failed to save product to database',
      details: err.message,
      errorName: err.name,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
});

// PUT /api/v1/products/:id
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      image: req.body.image,
      images: Array.isArray(req.body.images) ? req.body.images : req.body.images ? [req.body.images] : [],
      stock: req.body.stock,
      price: req.body.price,
      description: req.body.description,
    };

    // if category is sent, validate it
    if (req.body.category) {
      // Try to find by ID first (this is what we expect from the frontend)
      let category = await Category.findById(req.body.category);
      
      // If not found by ID and it looks like a valid ObjectId format, return error
      if (!category && /^[0-9a-fA-F]{24}$/.test(req.body.category)) {
        console.error('❌ Category ID not found in database:', req.body.category);
        return res.status(400).json({
          success: false,
          message: 'Category ID not found in database.'
        });
      }
      
      // Fallback: if it's not a valid ObjectId format, try to find by name (for backward compatibility)
      if (!category && !/^[0-9a-fA-F]{24}$/.test(req.body.category)) {
        console.warn('⚠️ Category value is not a valid ObjectId, trying to find by name:', req.body.category);
        category = await Category.findOne({
          name: new RegExp(`^${req.body.category}$`, 'i')
        });
      }
      
      if (!category) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid category. Category not found in database.' });
      }
      updateData.category = category._id;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'The product cannot be updated' });
    }

    res.status(200).send(product);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: 'The product cannot be updated: ' + err.message });
  }
});

// DELETE /api/v1/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found!' });
    }

    res
      .status(200)
      .json({ success: true, message: 'The product is deleted!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
