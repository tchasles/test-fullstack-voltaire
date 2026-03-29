const request = require('supertest');
const express = require('express');

// Mocks avant les imports de modules qui les utilisent
jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

const User = require('../../models/User');
const authRouter = require('../../routes/auth');

// Application Express minimale pour les tests
const app = express();
app.use(express.json());
app.use('/auth', authRouter);

// Reinitialise les mocks entre chaque test
afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /auth/register', () => {
  it('retourne 400 si des champs sont manquants', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'alice' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  it('retourne 409 si l\'utilisateur existe deja', async () => {
    User.findOne.mockResolvedValue({ _id: '1', username: 'alice' });

    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'alice', email: 'alice@example.com', password: 'secret' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Username or email already in use');
  });

  it('cree un utilisateur et retourne un jeton (201)', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: 'id-abc',
      username: 'alice',
      email: 'alice@example.com',
    });

    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'alice', email: 'alice@example.com', password: 'secret' });

    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.username).toBe('alice');
    expect(res.body.user.email).toBe('alice@example.com');
  });

  it('retourne 500 si une erreur serveur survient', async () => {
    User.findOne.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'alice', email: 'alice@example.com', password: 'secret' });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
});

describe('POST /auth/login', () => {
  it('retourne 400 si l\'email ou le mot de passe est absent', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  it('retourne 401 si l\'utilisateur est introuvable', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'inconnu@example.com', password: 'secret' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('retourne 401 si le mot de passe est incorrect', async () => {
    User.findOne.mockResolvedValue({
      _id: 'id-abc',
      username: 'alice',
      email: 'alice@example.com',
      comparePassword: jest.fn().mockResolvedValue(false),
    });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'mauvais' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('retourne un jeton si les identifiants sont corrects (200)', async () => {
    User.findOne.mockResolvedValue({
      _id: 'id-abc',
      username: 'alice',
      email: 'alice@example.com',
      comparePassword: jest.fn().mockResolvedValue(true),
    });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'secret' });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.username).toBe('alice');
  });

  it('retourne 500 si una erreur serveur survient', async () => {
    User.findOne.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'secret' });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
});
