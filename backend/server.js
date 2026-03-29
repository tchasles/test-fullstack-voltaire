require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const produitRoutes = require('./routes/produit');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/voltaire';

// Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/produit', produitRoutes);

// Point de sante
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Se connecte a MongoDB puis demarre le serveur
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
