import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/api';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Accessories', 'Clothing', 'Home', 'Books', 'Other'];

export const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    image_url: '',
    stock: '',
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getById(id);
        if (res.success && res.data) {
          const p = res.data;
          setFormData({
            name: p.name,
            description: p.description || '',
            price: p.price,
            category: p.category,
            image_url: p.image_url || '',
            stock: p.stock,
          });
        }
      } catch (err) {
        console.error('Failed to load product for editing:', err);
        setError('Failed to fetch existing product details.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { name, price, stock, category } = formData;

    if (!name.trim()) {
      setError('Product title cannot be empty.');
      return;
    }

    if (!price || isNaN(price) || Number(price) < 0) {
      setError('Please provide a valid non-negative price.');
      return;
    }

    if (stock === '' || isNaN(stock) || Number(stock) < 0) {
      setError('Please enter a valid non-negative stock count.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        description: formData.description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        image_url: formData.image_url.trim(),
        stock: parseInt(stock, 10),
      };

      const res = await productService.update(id, payload);

      if (res.success) {
        navigate('/admin/products');
      } else {
        setError(res.message || 'Failed to update product.');
      }
    } catch (err) {
      console.error('Update product error:', err);
      setError(err.response?.data?.message || 'Error occurred while updating product.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container section-padding loading-container">
        <div className="spinner"></div>
        <p>Loading product data for editing...</p>
      </div>
    );
  }

  return (
    <div className="container admin-form-page section-padding">
      <Link to="/admin/products" className="back-link">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className="card form-container-card">
        <h1 className="form-card-title">Edit Product Information</h1>
        <p className="form-card-sub">Updating product ID: <code>{id}</code></p>

        {error && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-product-form">
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Price ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Stock Count *</label>
              <input
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
            />
            {formData.image_url && (
              <div className="image-preview-box">
                <img src={formData.image_url} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions-bar">
            <Link to="/admin/products" className="btn btn-outline">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Save size={18} /> {loading ? 'Saving Changes...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
