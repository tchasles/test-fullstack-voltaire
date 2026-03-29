const jwt = require('jsonwebtoken');
const { authenticate, signToken } = require('../../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

describe('signToken', () => {
  it('retourne un jeton JWT decodable avec la charge utile correcte', () => {
    const payload = { id: 'abc123', username: 'alice' };
    const token = signToken(payload);

    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.id).toBe('abc123');
    expect(decoded.username).toBe('alice');
  });

  it('inclut une date d\'expiration dans le jeton', () => {
    const token = signToken({ id: '1' });
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.exp).toBeDefined();
  });
});

describe('authenticate middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('retourne 401 si aucun en-tete Authorization n\'est present', () => {
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('retourne 401 si le schema n\'est pas Bearer', () => {
    req.headers.authorization = 'Basic dXNlcjpwYXNz';
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('retourne 401 si le jeton est invalide', () => {
    req.headers.authorization = 'Bearer jeton.invalide.ici';
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('retourne 401 si le jeton est signe avec un mauvais secret', () => {
    const mauvaisToken = jwt.sign({ id: '1' }, 'mauvais-secret');
    req.headers.authorization = `Bearer ${mauvaisToken}`;
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
  });

  it('appelle next() et attache req.user si le jeton est valide', () => {
    const payload = { id: 'id123', username: 'bob' };
    const token = signToken(payload);
    req.headers.authorization = `Bearer ${token}`;

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject(payload);
    expect(res.status).not.toHaveBeenCalled();
  });
});
