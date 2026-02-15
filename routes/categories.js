const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Handle OPTIONS preflight for categories
router.options('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// GET /api/v1/categories
router.get('/', async (req, res) => {
  try {
    console.log('📋 GET /categories - Fetching categories from database');
    console.log('📊 Database name:', Category.db.name);
    console.log('📊 Collection name:', Category.collection.name);
    
    const categoryList = await Category.find().sort({ name: 1 }); // Sort by name
    console.log(`✅ Found ${categoryList.length} categories`);
    
    if (categoryList.length > 0) {
      console.log('Categories:', categoryList.map(c => ({ id: c._id, name: c.name })));
    } else {
      console.warn('⚠️ No categories found in database. Run: npm run seed:categories');
    }
    
    // Ensure we return an array even if empty, and use JSON format
    res.status(200).json(categoryList);
  } catch (err) {
    console.error('❌ Error fetching categories:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      details: 'Failed to fetch categories from database'
    });
  }
});

// POST /api/v1/categories
router.post('/', async (req, res) => {
  try {
    let category = new Category({
      name: req.body.name,
      image: req.body.image,
    });

    category = await category.save();

    if (!category) {
      return res.status(400).send('The category cannot be created!');
    }

    res.status(201).send(category);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'The category cannot be created!',
      details: err.message,
    });
  }
});

// DELETE /api/v1/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found!' });
    }

    res
      .status(200)
      .json({ success: true, message: 'The category is deleted!' });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/v1/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found' });
    }

    res.status(200).send(category);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        image: req.body.image,
      },
      { new: true }
    );

    if (!category) {
      return res
        .status(404)
        .send('The category cannot be updated (not found)');
    }

    res.send(category);
  } catch (err) {
    res
      .status(500)
      .send('The category cannot be updated: ' + err.message);
  }
});

module.exports = router;
