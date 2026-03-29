import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { translateAuthErrorMessage } from '../utils/authMessages';

export default function Register() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form.username, form.email, form.password);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      setError(translateAuthErrorMessage(apiMessage, "L'inscription a echoue"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Creer un compte</h2>

        {error && <p className="error">{error}</p>}

        <label>
          Nom d'utilisateur
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            minLength={3}
            autoComplete="username"
          />
        </label>

        <label>
          E-mail
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </label>

        <label>
          Mot de passe
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creation du compte...' : "S'inscrire"}
        </button>

        <p>
          Vous avez deja un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
