import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getToken, setToken, removeToken, authHeader, logout } from './auth';

// Simule localStorage avec vitest
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

const TOKEN_KEY = 'voltaire_token';

beforeEach(() => {
  localStorage.clear();
});

describe('setToken / getToken', () => {
  it('stocke et recupere un jeton', () => {
    setToken('mon-jeton-jwt');
    expect(getToken()).toBe('mon-jeton-jwt');
  });

  it('retourne null si aucun jeton n\'est stocke', () => {
    expect(getToken()).toBeNull();
  });
});

describe('removeToken', () => {
  it('supprime le jeton du stockage local', () => {
    setToken('mon-jeton-jwt');
    removeToken();
    expect(getToken()).toBeNull();
  });

  it('ne jette pas d\'erreur si aucun jeton n\'existe', () => {
    expect(() => removeToken()).not.toThrow();
  });
});

describe('authHeader', () => {
  it('retourne l\'en-tete Authorization si un jeton est present', () => {
    setToken('mon-jeton-jwt');
    expect(authHeader()).toEqual({ Authorization: 'Bearer mon-jeton-jwt' });
  });

  it('retourne un objet vide si aucun jeton n\'est stocke', () => {
    expect(authHeader()).toEqual({});
  });
});

describe('logout', () => {
  it('supprime le jeton et laisse getToken() a null', () => {
    setToken('mon-jeton-jwt');
    logout();
    expect(getToken()).toBeNull();
  });
});
