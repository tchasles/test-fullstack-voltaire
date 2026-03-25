const express = require('express');
const router = express.Router();
const Produit = require('../models/Produit');

// GET /produit/categories — get all unique categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Produit.distinct('category');
    res.json({
      success: true,
      data: categories.sort(),
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
});

// GET /produit — fetch all products with optional search by name or category
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    // Filter by category if provided
    if (category && category !== '') {
      query.category = category;
    }

    // Filter by name (partial match) if search term provided
    if (search && search !== '') {
      query.name = { $regex: search, $options: 'i' }; // case-insensitive regex
    }

    const produits = await Produit.find(query).sort({ id: 1 });

    res.json({
      success: true,
      data: produits,
      count: produits.length,
    });
  } catch (error) {
    console.error('Error fetching produits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
});

module.exports = router;
