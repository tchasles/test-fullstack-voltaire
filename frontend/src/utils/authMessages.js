const AUTH_ERROR_MESSAGES = {
  'Too many requests, please try again later.': 'Trop de tentatives. Veuillez reessayer plus tard.',
  'All fields are required': 'Tous les champs sont obligatoires.',
  'Username or email already in use': "Le nom d'utilisateur ou l'e-mail est deja utilise.",
  'Server error': 'Erreur serveur.',
  'Email and password are required': "L'e-mail et le mot de passe sont obligatoires.",
  'Invalid credentials': 'Identifiants invalides.',
};

export function translateAuthErrorMessage(message, fallback) {
  if (!message) return fallback;
  return AUTH_ERROR_MESSAGES[message] || fallback;
}
