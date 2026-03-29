import { useDashboard } from '../hooks/useDashboard';

export default function Dashboard() {
  const {
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
    handleLogout,
    handleCreateInputChange,
    resetProductForm,
    handleOpenCreateForm,
    handleEditProduct,
    handleSaveProduct,
    handleSort,
    handleDeleteProduct,
  } = useDashboard();

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

            {sortedProduits.length === 0 ? (
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
              Affichage de {sortedProduits.length} produit{sortedProduits.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
