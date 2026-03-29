import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/auth';

// Hook personnalise encapsulant toute la logique metier du tableau de bord
export function useDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- Etat des donnees ---
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // --- Etat de l'interface ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [createError, setCreateError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSourceId, setEditSourceId] = useState(null);

  // --- Etat du tri ---
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  // --- Etat du formulaire de creation / edition ---
  const [newProduit, setNewProduit] = useState({
    id: '',
    name: '',
    category: '',
    price: '',
    stock: '',
  });

  // Charge la liste des categories disponibles
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

  // Charge les produits en appliquant les filtres actifs
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

  // Deconnecte l'utilisateur et redirige vers la page de connexion
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Met a jour un champ du formulaire produit
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduit((prev) => ({ ...prev, [name]: value }));
  };

  // Reinitialise le formulaire et quitte le mode edition
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

  // Affiche ou masque le formulaire de creation
  const handleOpenCreateForm = () => {
    if (showCreateForm && !isEditMode) {
      setShowCreateForm(false);
      resetProductForm();
      return;
    }

    resetProductForm();
    setShowCreateForm(true);
  };

  // Prefille le formulaire avec les donnees du produit a modifier
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

  // Enregistre le produit (creation ou modification selon le mode actif)
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

  // Bascule le tri sur le champ selectionne, ou inverse l'ordre si deja actif
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

  // Supprime un produit apres confirmation de l'utilisateur
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

  return {
    // Donnees en lecture
    user,
    categories,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
    showCreateForm,
    setShowCreateForm,
    saving,
    deletingId,
    createError,
    isEditMode,
    sortBy,
    sortOrder,
    newProduit,
    sortedProduits,
    // Gestionnaires d'evenements
    handleLogout,
    handleCreateInputChange,
    resetProductForm,
    handleOpenCreateForm,
    handleEditProduct,
    handleSaveProduct,
    handleSort,
    handleDeleteProduct,
  };
}
