const express = require('express');
const router = express.Router();
const Produit = require('../models/Produit');

// GET /produit/categories — retourne toutes les categories uniques
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

// GET /produit — retourne les produits avec filtres optionnels (nom/categorie)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    // Filtre par categorie si elle est renseignee
    if (category && category !== '') {
      query.category = category;
    }

    // Filtre par nom (correspondance partielle) si un terme de recherche est present
    if (search && search !== '') {
      query.name = { $regex: search, $options: 'i' }; // regex insensible a la casse
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
