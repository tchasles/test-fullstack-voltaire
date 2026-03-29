const express = require('express');
const router = express.Router();
const Produit = require('../models/Produit');

function parseProduitId(value) {
  if (!/^\d+$/.test(String(value))) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

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

// GET /produit/:id — retourne un produit specifique via son id numerique
router.get('/:id', async (req, res) => {
  try {
    const produitId = parseProduitId(req.params.id);
    if (produitId === null) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id',
      });
    }

    const produit = await Produit.findOne({ id: produitId });
    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: produit,
    });
  } catch (error) {
    console.error('Error fetching produit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
  }
});

// POST /produit — cree un nouveau produit
router.post('/', async (req, res) => {
  try {
    const { id, name, category, price, stock, created_at } = req.body;

    if (
      id === undefined ||
      !name ||
      !category ||
      price === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'id, name, category, price and stock are required',
      });
    }

    const produit = await Produit.create({
      id,
      name,
      category,
      price,
      stock,
      ...(created_at ? { created_at } : {}),
    });

    res.status(201).json({
      success: true,
      data: produit,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Product id already exists',
      });
    }

    console.error('Error creating produit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
    });
  }
});

// PUT /produit/:id — met a jour un produit existant via son id numerique
router.put('/:id', async (req, res) => {
  try {
    const produitId = parseProduitId(req.params.id);
    if (produitId === null) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id',
      });
    }

    const allowedFields = ['id', 'name', 'category', 'price', 'stock', 'created_at'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
      });
    }

    const produit = await Produit.findOneAndUpdate({ id: produitId }, updates, {
      new: true,
      runValidators: true,
    });

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: produit,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Product id already exists',
      });
    }

    console.error('Error updating produit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
    });
  }
});

// DELETE /produit/:id — supprime un produit existant via son id numerique
router.delete('/:id', async (req, res) => {
  try {
    const produitId = parseProduitId(req.params.id);
    if (produitId === null) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id',
      });
    }

    const produit = await Produit.findOneAndDelete({ id: produitId });
    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: produit,
    });
  } catch (error) {
    console.error('Error deleting produit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
    });
  }
});

module.exports = router;
