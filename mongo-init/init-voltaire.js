const fs = require('fs');
const path = require('path');

const dbName = process.env.MONGO_INITDB_DATABASE || 'voltaire';
const seedFilePath = path.join('/docker-entrypoint-initdb.d', 'seed.produit.json');
const database = db.getSiblingDB(dbName);
const produitCollection = database.getCollection('produit');

if (!fs.existsSync(seedFilePath)) {
  print(`Seed file not found: ${seedFilePath}`);
} else {
  const produits = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));

  if (!Array.isArray(produits)) {
    throw new Error('seed.produit.json must contain a JSON array');
  }

  if (produits.length === 0) {
    print('No produits found in seed.produit.json, skipping seed');
  } else {
    const normalizedProduits = produits.map((produit) => {
      if (
        produit.id === undefined ||
        !produit.name ||
        !produit.category ||
        produit.price === undefined ||
        produit.stock === undefined ||
        !produit.created_at
      ) {
        throw new Error(
          'Each produit must include id, name, category, price, stock, and created_at'
        );
      }

      return {
        id: Number(produit.id),
        name: String(produit.name).trim(),
        category: String(produit.category).trim(),
        price: Number(produit.price),
        stock: Number(produit.stock),
        created_at: new Date(produit.created_at),
      };
    });

    produitCollection.createIndex({ id: 1 }, { unique: true });
    produitCollection.insertMany(normalizedProduits, { ordered: true });
    print(`Seeded ${normalizedProduits.length} produit record(s) into ${dbName}.produit`);
  }
}
