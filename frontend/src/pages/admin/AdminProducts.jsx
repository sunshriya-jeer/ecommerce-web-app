import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/api';
import { Plus, Edit, Trash2, Search, AlertCircle, CheckCircle } from 'lucide-react';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    let ignore = false;
    const loadProducts = async () => {
      try {
        const res = await productService.getAll();
        if (ignore) return;
        const items = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setProducts(items);
      } catch (err) {
        if (ignore) return;
        console.error('Failed to load products for admin:', err);
        setError('Could not retrieve products.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      ignore = true;
    };
  }, []);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${name}"? This action cannot be reversed.`
    );
    if (!confirmed) return;

    try {
      const res = await productService.delete(id);
      if (res.success) {
        setSuccessMsg(`"${name}" was successfully removed.`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Delete product error:', err);
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container admin-products-page section-padding">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Inventory & Product Catalog</h1>
          <p className="page-subheading">
            Manage product offerings, pricing, stock thresholds, and listings.
          </p>
        </div>

        <Link to="/admin/products/new" className="btn btn-primary">
          <Plus size={18} /> Add New Product
        </Link>
      </div>

      {successMsg && (
        <div className="success-alert" style={{ marginBottom: '20px' }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="error-alert" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="admin-toolbar card">
        <div className="admin-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-stats">
          <span>Total: <strong>{products.length}</strong> items</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading inventory items...</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="table-product-thumb"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80';
                        }}
                      />
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>
                      <span className="category-pill">{p.category}</span>
                    </td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>
                      <span
                        className={`stock-indicator ${
                          p.stock <= 0
                            ? 'stock-zero'
                            : p.stock < 10
                            ? 'stock-warning'
                            : 'stock-ok'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/admin/products/edit/${p.id}`}
                          className="btn-icon btn-edit"
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="btn-icon btn-delete"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
