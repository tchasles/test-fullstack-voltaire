import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { translateAuthErrorMessage } from '../utils/authMessages';

export default function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      setError(translateAuthErrorMessage(apiMessage, 'La connexion a echoue'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Connexion</h2>

        {error && <p className="error">{error}</p>}

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
            autoComplete="current-password"
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Connexion en cours...' : 'Se connecter'}
        </button>

        <p>
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </form>
    </div>
  );
}
