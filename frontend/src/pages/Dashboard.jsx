import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [createError, setCreateError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSourceId, setEditSourceId] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [newProduit, setNewProduit] = useState({
    id: '',
    name: '',
    category: '',
    price: '',
    stock: '',
  });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/produit/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Echec du chargement des categories :', err);
    }
  }, []);

  const fetchProduits = useCallback(async () => {
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
  }, [search, selectedCategory]);

  // Charge les categories au montage du composant
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Charge les produits selon les filtres actifs
  useEffect(() => {
    // Debounce de la recherche pour limiter le nombre de requetes
    const timer = setTimeout(fetchProduits, 300);
    return () => clearTimeout(timer);
  }, [fetchProduits]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduit((prev) => ({ ...prev, [name]: value }));
  };

  const resetProductForm = () => {
    setNewProduit({
      id: '',
      name: '',
      category: '',
      price: '',
      stock: '',
    });
    setCreateError('');
    setIsEditMode(false);
    setEditSourceId(null);
  };

  const handleOpenCreateForm = () => {
    if (showCreateForm && !isEditMode) {
      setShowCreateForm(false);
      resetProductForm();
      return;
    }

    resetProductForm();
    setShowCreateForm(true);
  };

  const handleEditProduct = (produit) => {
    setCreateError('');
    setIsEditMode(true);
    setEditSourceId(produit.id);
    setNewProduit({
      id: String(produit.id),
      name: produit.name,
      category: produit.category,
      price: String(produit.price),
      stock: String(produit.stock),
    });
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setCreateError('');
    setSaving(true);

    try {
      const payload = {
        id: Number(newProduit.id),
        name: newProduit.name.trim(),
        category: newProduit.category.trim(),
        price: Number(newProduit.price),
        stock: Number(newProduit.stock),
      };

      if (
        !Number.isInteger(payload.id) ||
        !payload.name ||
        !payload.category ||
        Number.isNaN(payload.price) ||
        Number.isNaN(payload.stock)
      ) {
        setCreateError('Veuillez renseigner des valeurs valides pour tous les champs.');
        return;
      }

      if (isEditMode && editSourceId !== null) {
        await api.put(`/produit/${editSourceId}`, payload);
      } else {
        await api.post('/produit', payload);
      }

      resetProductForm();
      setShowCreateForm(false);
      await Promise.all([fetchProduits(), fetchCategories()]);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (isEditMode ? 'Impossible de modifier le produit' : 'Impossible de creer le produit');
      setCreateError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Tri client des produits selon le champ et l'ordre selectionnes
  const sortedProduits = useMemo(() => {
    if (!sortBy) return produits;
    return [...produits].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (sortBy === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [produits, sortBy, sortOrder]);

  const handleDeleteProduct = async (id, name) => {
    const confirmed = window.confirm(
      `Supprimer le produit ${name} (ID ${id}) ? Cette action est irreversible.`
    );
    if (!confirmed) return;

    setError(null);
    setDeletingId(id);
    try {
      await api.delete(`/produit/${id}`);
      await Promise.all([fetchProduits(), fetchCategories()]);
    } catch (err) {
      const message = err.response?.data?.message || 'Impossible de supprimer le produit';
      setError(message);
    } finally {
      setDeletingId(null);
    }
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
            <div className="products-toolbar">
              <h2>Liste des produits</h2>
              <button
                type="button"
                className="add-product-btn"
                onClick={handleOpenCreateForm}
                aria-label="Ajouter un produit"
                title="Ajouter"
              >
                +
              </button>
            </div>

            {showCreateForm && (
              <form className="create-product-form" onSubmit={handleSaveProduct}>
                <input
                  type="number"
                  name="id"
                  placeholder="ID"
                  value={newProduit.id}
                  onChange={handleCreateInputChange}
                  min="1"
                  required
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Nom"
                  value={newProduit.name}
                  onChange={handleCreateInputChange}
                  required
                />
                <input
                  type="text"
                  name="category"
                  placeholder="Categorie"
                  value={newProduit.category}
                  onChange={handleCreateInputChange}
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Prix"
                  value={newProduit.price}
                  onChange={handleCreateInputChange}
                  min="0"
                  step="0.01"
                  required
                />
                <input
                  type="number"
                  name="stock"
                  placeholder="Stock"
                  value={newProduit.stock}
                  onChange={handleCreateInputChange}
                  min="0"
                  step="1"
                  required
                />
                <button type="submit" className="submit-create-btn" disabled={saving}>
                  {saving ? 'Enregistrement...' : isEditMode ? 'Enregistrer' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  className="cancel-create-btn"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetProductForm();
                  }}
                  disabled={saving}
                >
                  Annuler
                </button>
                {createError && <p className="create-error-message">{createError}</p>}
              </form>
            )}

            {produits.length === 0 ? (
              <p className="no-results">Aucun produit trouve.</p>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th
                      className={`sortable-th${sortBy === 'name' ? ' sorted' : ''}`}
                      onClick={() => handleSort('name')}
                    >
                      Nom {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                    </th>
                    <th>Categorie</th>
                    <th
                      className={`sortable-th${sortBy === 'price' ? ' sorted' : ''}`}
                      onClick={() => handleSort('price')}
                    >
                      Prix {sortBy === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                    </th>
                    <th
                      className={`sortable-th${sortBy === 'stock' ? ' sorted' : ''}`}
                      onClick={() => handleSort('stock')}
                    >
                      Stock {sortBy === 'stock' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                    </th>
                    <th
                      className={`sortable-th${sortBy === 'created_at' ? ' sorted' : ''}`}
                      onClick={() => handleSort('created_at')}
                    >
                      Cree le {sortBy === 'created_at' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProduits.map((produit) => (
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
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() => handleEditProduct(produit)}
                            aria-label={`Modifier ${produit.name}`}
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => handleDeleteProduct(produit.id, produit.name)}
                            disabled={deletingId === produit.id}
                            aria-label={`Supprimer ${produit.name}`}
                            title="Supprimer"
                          >
                            {deletingId === produit.id ? '...' : '🗑'}
                          </button>
                        </div>
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
