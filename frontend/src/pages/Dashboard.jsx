import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/auth';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/produit/categories');
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error('Echec du chargement des categories :', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch produits with filters
  useEffect(() => {
    const fetchProduits = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCategory) params.append('category', selectedCategory);

        const response = await api.get(`/produit?${params.toString()}`);
        if (response.data.success) {
          setProduits(response.data.data);
        }
      } catch (err) {
        console.error('Echec du chargement des produits :', err);
        setError('Impossible de charger les produits');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many requests
    const timer = setTimeout(fetchProduits, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Tableau de bord des produits</h1>
          <p>Bienvenue, {user?.username} ! 👋</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Se deconnecter
        </button>
      </header>

      <main className="dashboard-main">
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher par nom de produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="">Toutes les categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {(search || selectedCategory) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
              }}
              className="clear-btn"
            >
              Effacer les filtres
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Chargement des produits...</div>
        ) : (
          <div className="products-container">
            {produits.length === 0 ? (
              <p className="no-results">Aucun produit trouve.</p>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Categorie</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Cree le</th>
                  </tr>
                </thead>
                <tbody>
                  {produits.map((produit) => (
                    <tr key={produit._id} className="product-row">
                      <td>{produit.id}</td>
                      <td className="product-name">{produit.name}</td>
                      <td className="product-category">{produit.category}</td>
                      <td className="product-price">{produit.price.toFixed(2)}€</td>
                      <td className={`product-stock ${produit.stock === 0 ? 'out-of-stock' : ''}`}>
                        {produit.stock}
                      </td>
                      <td className="product-date">
                        {new Date(produit.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="results-count">
              Affichage de {produits.length} produit{produits.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
