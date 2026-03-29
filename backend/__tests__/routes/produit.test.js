const request = require('supertest');
const express = require('express');

// Mocks avant les imports de modules qui les utilisent
jest.mock('../../models/Produit', () => ({
  distinct: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

const Produit = require('../../models/Produit');
const produitRouter = require('../../routes/produit');

// Application Express minimale pour les tests
const app = express();
app.use(express.json());
app.use('/produit', produitRouter);

afterEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /produit/categories
// ---------------------------------------------------------------------------
describe('GET /produit/categories', () => {
  it('retourne la liste des categories triees', async () => {
    Produit.distinct.mockResolvedValue(['Vetements', 'Alimentaire', 'Electronique']);

    const res = await request(app).get('/produit/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(['Alimentaire', 'Electronique', 'Vetements']);
  });

  it('retourne 500 en cas d\'erreur base de donnees', async () => {
    Produit.distinct.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/produit/categories');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GET /produit
// ---------------------------------------------------------------------------
describe('GET /produit', () => {
  it('retourne tous les produits sans filtre', async () => {
    const produits = [{ id: 1, name: 'Beurre', category: 'Alimentaire', price: 2.5, stock: 10 }];
    Produit.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(produits) });

    const res = await request(app).get('/produit');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.count).toBe(1);
  });

  it('applique un filtre de recherche par nom', async () => {
    Produit.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    await request(app).get('/produit?search=beurre');

    const query = Produit.find.mock.calls[0][0];
    expect(query.name).toEqual({ $regex: 'beurre', $options: 'i' });
  });

  it('applique un filtre par categorie', async () => {
    Produit.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    await request(app).get('/produit?category=Alimentaire');

    const query = Produit.find.mock.calls[0][0];
    expect(query.category).toBe('Alimentaire');
  });

  it('retourne 500 en cas d\'erreur', async () => {
    Produit.find.mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('DB error')) });

    const res = await request(app).get('/produit');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GET /produit/:id
// ---------------------------------------------------------------------------
describe('GET /produit/:id', () => {
  it('retourne le produit correspondant a l\'id', async () => {
    const produit = { id: 5, name: 'Beurre', category: 'Alimentaire', price: 2.5, stock: 10 };
    Produit.findOne.mockResolvedValue(produit);

    const res = await request(app).get('/produit/5');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Beurre');
  });

  it('retourne 400 si l\'id n\'est pas numerique', async () => {
    const res = await request(app).get('/produit/abc');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid product id');
  });

  it('retourne 404 si le produit est introuvable', async () => {
    Produit.findOne.mockResolvedValue(null);

    const res = await request(app).get('/produit/999');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Product not found');
  });
});

// ---------------------------------------------------------------------------
// POST /produit
// ---------------------------------------------------------------------------
describe('POST /produit', () => {
  const payload = { id: 10, name: 'Lait', category: 'Alimentaire', price: 1.2, stock: 50 };

  it('cree un produit et retourne 201', async () => {
    Produit.create.mockResolvedValue(payload);

    const res = await request(app).post('/produit').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Lait');
  });

  it('retourne 400 si des champs obligatoires sont absents', async () => {
    const res = await request(app).post('/produit').send({ id: 10, name: 'Lait' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('retourne 409 si l\'id existe deja', async () => {
    const error = new Error('Duplicate');
    error.code = 11000;
    Produit.create.mockRejectedValue(error);

    const res = await request(app).post('/produit').send(payload);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Product id already exists');
  });
});

// ---------------------------------------------------------------------------
// PUT /produit/:id
// ---------------------------------------------------------------------------
describe('PUT /produit/:id', () => {
  it('met a jour le produit et retourne les nouvelles valeurs', async () => {
    const updated = { id: 5, name: 'Lait demi-ecreme', category: 'Alimentaire', price: 1.5, stock: 30 };
    Produit.findOneAndUpdate.mockResolvedValue(updated);

    const res = await request(app)
      .put('/produit/5')
      .send({ name: 'Lait demi-ecreme', price: 1.5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Lait demi-ecreme');
  });

  it('retourne 400 si l\'id est non numerique', async () => {
    const res = await request(app).put('/produit/abc').send({ name: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid product id');
  });

  it('retourne 400 si aucun champ valide n\'est fourni', async () => {
    const res = await request(app).put('/produit/5').send({ champsInconnu: 'valeur' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('No valid fields provided for update');
  });

  it('retourne 404 si le produit est introuvable', async () => {
    Produit.findOneAndUpdate.mockResolvedValue(null);

    const res = await request(app).put('/produit/999').send({ name: 'test' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Product not found');
  });

  it('retourne 409 en cas de conflit d\'id', async () => {
    const error = new Error('Duplicate');
    error.code = 11000;
    Produit.findOneAndUpdate.mockRejectedValue(error);

    const res = await request(app).put('/produit/5').send({ id: 10 });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Product id already exists');
  });
});

// ---------------------------------------------------------------------------
// DELETE /produit/:id
// ---------------------------------------------------------------------------
describe('DELETE /produit/:id', () => {
  it('supprime le produit et retourne un message de confirmation', async () => {
    const produit = { id: 5, name: 'Lait' };
    Produit.findOneAndDelete.mockResolvedValue(produit);

    const res = await request(app).delete('/produit/5');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Product deleted successfully');
  });

  it('retourne 400 si l\'id est non numerique', async () => {
    const res = await request(app).delete('/produit/xyz');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid product id');
  });

  it('retourne 404 si le produit n\'existe pas', async () => {
    Produit.findOneAndDelete.mockResolvedValue(null);

    const res = await request(app).delete('/produit/999');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Product not found');
  });

  it('retourne 500 en cas d\'erreur', async () => {
    Produit.findOneAndDelete.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/produit/5');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
