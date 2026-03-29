import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// vi.hoisted garantit que les variables sont creees avant le hissage de vi.mock
const { mockNavigate, mockLogout, mockUser, mockApi } = vi.hoisted(() => {
  const mockNavigate = vi.fn();
  const mockLogout = vi.fn();
  const mockUser = { id: '1', username: 'alice' };
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  return { mockNavigate, mockLogout, mockUser, mockApi };
});

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, logout: mockLogout }),
}));

vi.mock('../services/auth', () => ({
  api: mockApi,
}));

import { useDashboard } from './useDashboard';

beforeEach(() => {
  vi.clearAllMocks();
  mockApi.get.mockImplementation((url) => {
    if (url.includes('categories')) {
      return Promise.resolve({ data: { success: true, data: ['Alimentaire', 'Electronique'] } });
    }
    return Promise.resolve({ data: { success: true, data: [] } });
  });
});

// ---------------------------------------------------------------------------
// Etat initial
// ---------------------------------------------------------------------------
describe('useDashboard — etat initial', () => {
  it('expose les valeurs par defaut correctes', async () => {
    const { result } = renderHook(() => useDashboard());

    expect(result.current.search).toBe('');
    expect(result.current.selectedCategory).toBe('');
    expect(result.current.showCreateForm).toBe(false);
    expect(result.current.saving).toBe(false);
    expect(result.current.deletingId).toBeNull();
    expect(result.current.createError).toBe('');
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.sortBy).toBeNull();
    expect(result.current.sortOrder).toBe('asc');
    expect(result.current.newProduit).toEqual({
      id: '', name: '', category: '', price: '', stock: '',
    });
  });
});

// ---------------------------------------------------------------------------
// handleLogout
// ---------------------------------------------------------------------------
describe('handleLogout', () => {
  it('appelle logout() et redirige vers /login', async () => {
    const { result } = renderHook(() => useDashboard());

    act(() => {
      result.current.handleLogout();
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

// ---------------------------------------------------------------------------
// handleSort
// ---------------------------------------------------------------------------
describe('handleSort', () => {
  it('definit sortBy et remet sortOrder a asc sur un nouveau champ', async () => {
    const { result } = renderHook(() => useDashboard());

    act(() => {
      result.current.handleSort('price');
    });

    expect(result.current.sortBy).toBe('price');
    expect(result.current.sortOrder).toBe('asc');
  });

  it('inverse l\'ordre si le meme champ est retri', async () => {
    const { result } = renderHook(() => useDashboard());

    act(() => result.current.handleSort('price'));
    act(() => result.current.handleSort('price'));

    expect(result.current.sortBy).toBe('price');
    expect(result.current.sortOrder).toBe('desc');
  });

  it('repasse a asc si on retrie pour la troisieme fois', async () => {
    const { result } = renderHook(() => useDashboard());

    act(() => result.current.handleSort('name'));
    act(() => result.current.handleSort('name'));
    act(() => result.current.handleSort('name'));

    expect(result.current.sortOrder).toBe('asc');
  });
});

// ---------------------------------------------------------------------------
// handleCreateInputChange
// ---------------------------------------------------------------------------
describe('handleCreateInputChange', () => {
  it('met a jour le champ correspondant dans newProduit', async () => {
    const { result } = renderHook(() => useDashboard());

    act(() => {
      result.current.handleCreateInputChange({
        target: { name: 'name', value: 'Beurre' },
      });
    });

    expect(result.current.newProduit.name).toBe('Beurre');

    act(() => {
      result.current.handleCreateInputChange({
        target: { name: 'price', value: '2.50' },
      });
    });

    expect(result.current.newProduit.price).toBe('2.50');
    expect(result.current.newProduit.name).toBe('Beurre'); // les autres champs sont intacts
  });
});

// ---------------------------------------------------------------------------
// resetProductForm
// ---------------------------------------------------------------------------
describe('resetProductForm', () => {
  it('remet le formulaire a zero et quitte le mode edition', async () => {
    const { result } = renderHook(() => useDashboard());

    // Simule un etat edition actif
    act(() => {
      result.current.handleCreateInputChange({ target: { name: 'name', value: 'Lait' } });
    });

    act(() => {
      result.current.resetProductForm();
    });

    expect(result.current.newProduit).toEqual({
      id: '', name: '', category: '', price: '', stock: '',
    });
    expect(result.current.createError).toBe('');
    expect(result.current.isEditMode).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// handleOpenCreateForm
// ---------------------------------------------------------------------------
describe('handleOpenCreateForm', () => {
  it('ouvre le formulaire si il est ferme', async () => {
    const { result } = renderHook(() => useDashboard());

    act(() => {
      result.current.handleOpenCreateForm();
    });

    expect(result.current.showCreateForm).toBe(true);
  });

  it('ferme le formulaire si il est ouvert en mode creation', async () => {
    const { result } = renderHook(() => useDashboard());

    act(() => result.current.handleOpenCreateForm());
    act(() => result.current.handleOpenCreateForm());

    expect(result.current.showCreateForm).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// handleEditProduct
// ---------------------------------------------------------------------------
describe('handleEditProduct', () => {
  it('prefille le formulaire et passe en mode edition', async () => {
    const { result } = renderHook(() => useDashboard());
    const produit = { id: 7, name: 'Lait', category: 'Alimentaire', price: 1.2, stock: 30 };

    act(() => {
      result.current.handleEditProduct(produit);
    });

    expect(result.current.isEditMode).toBe(true);
    expect(result.current.showCreateForm).toBe(true);
    expect(result.current.newProduit).toEqual({
      id: '7',
      name: 'Lait',
      category: 'Alimentaire',
      price: '1.2',
      stock: '30',
    });
  });
});

// ---------------------------------------------------------------------------
// handleSaveProduct — creation
// ---------------------------------------------------------------------------
describe('handleSaveProduct — creation', () => {
  it('appelle POST /produit et ferme le formulaire en cas de succes', async () => {
    mockApi.post.mockResolvedValue({ data: { success: true } });
    const { result } = renderHook(() => useDashboard());

    act(() => result.current.handleOpenCreateForm());
    act(() => {
      result.current.handleCreateInputChange({ target: { name: 'id', value: '10' } });
      result.current.handleCreateInputChange({ target: { name: 'name', value: 'Beurre' } });
      result.current.handleCreateInputChange({ target: { name: 'category', value: 'Alimentaire' } });
      result.current.handleCreateInputChange({ target: { name: 'price', value: '2.5' } });
      result.current.handleCreateInputChange({ target: { name: 'stock', value: '100' } });
    });

    await act(async () => {
      await result.current.handleSaveProduct({ preventDefault: vi.fn() });
    });

    expect(mockApi.post).toHaveBeenCalledWith('/produit', {
      id: 10, name: 'Beurre', category: 'Alimentaire', price: 2.5, stock: 100,
    });
    expect(result.current.showCreateForm).toBe(false);
    expect(result.current.createError).toBe('');
  });

  it('affiche une erreur si les champs sont invalides', async () => {
    const { result } = renderHook(() => useDashboard());

    act(() => result.current.handleOpenCreateForm());

    await act(async () => {
      await result.current.handleSaveProduct({ preventDefault: vi.fn() });
    });

    expect(result.current.createError).toBe(
      'Veuillez renseigner des valeurs valides pour tous les champs.'
    );
    expect(mockApi.post).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// handleDeleteProduct
// ---------------------------------------------------------------------------
describe('handleDeleteProduct', () => {
  it('appelle DELETE et rafraichit la liste si confirme', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockApi.delete.mockResolvedValue({});
    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleDeleteProduct(5, 'Lait');
    });

    expect(mockApi.delete).toHaveBeenCalledWith('/produit/5');
    expect(result.current.deletingId).toBeNull();
  });

  it('n\'appelle pas DELETE si l\'utilisateur annule', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { result } = renderHook(() => useDashboard());

    await act(async () => {
      await result.current.handleDeleteProduct(5, 'Lait');
    });

    expect(mockApi.delete).not.toHaveBeenCalled();
  });
});
