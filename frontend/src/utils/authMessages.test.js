import { describe, it, expect } from 'vitest';
import { translateAuthErrorMessage } from './authMessages';

describe('translateAuthErrorMessage', () => {
  it('traduit un message connu en francais', () => {
    expect(translateAuthErrorMessage('Invalid credentials', 'par defaut')).toBe(
      'Identifiants invalides.'
    );
  });

  it('traduit le message de trop de requetes', () => {
    expect(
      translateAuthErrorMessage('Too many requests, please try again later.', 'par defaut')
    ).toBe('Trop de tentatives. Veuillez reessayer plus tard.');
  });

  it('traduit le message de champs manquants', () => {
    expect(translateAuthErrorMessage('All fields are required', 'par defaut')).toBe(
      'Tous les champs sont obligatoires.'
    );
  });

  it('traduit le message d\'utilisateur deja existant', () => {
    expect(translateAuthErrorMessage('Username or email already in use', 'par defaut')).toBe(
      "Le nom d'utilisateur ou l'e-mail est deja utilise."
    );
  });

  it('traduit le message d\'erreur serveur', () => {
    expect(translateAuthErrorMessage('Server error', 'par defaut')).toBe('Erreur serveur.');
  });

  it('traduit le message identifiants email/mdp requis', () => {
    expect(translateAuthErrorMessage('Email and password are required', 'par defaut')).toBe(
      "L'e-mail et le mot de passe sont obligatoires."
    );
  });

  it('retourne le fallback si le message est inconnu', () => {
    expect(translateAuthErrorMessage('Erreur inconnue', 'Message par defaut')).toBe(
      'Message par defaut'
    );
  });

  it('retourne le fallback si le message est null', () => {
    expect(translateAuthErrorMessage(null, 'Fallback')).toBe('Fallback');
  });

  it('retourne le fallback si le message est undefined', () => {
    expect(translateAuthErrorMessage(undefined, 'Fallback')).toBe('Fallback');
  });

  it('retourne le fallback si le message est une chaine vide', () => {
    expect(translateAuthErrorMessage('', 'Fallback')).toBe('Fallback');
  });
});
