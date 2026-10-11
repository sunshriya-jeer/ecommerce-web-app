import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/api';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Accessories', 'Clothing', 'Home', 'Books', 'Other'];

export const AdminAddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    image_url: '',
    stock: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError('Product title is required.');
      return;
    }

    if (!price || isNaN(price) || Number(price) < 0) {
      setError('Please provide a valid non-negative price.');
      return;
    }

    if (!stock || isNaN(stock) || Number(stock) < 0) {
      setError('Please enter a valid stock quantity.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        description: formData.description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        image_url:
          formData.image_url.trim() ||
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        stock: parseInt(stock, 10),
      };

      const res = await productService.create(payload);

      if (res.success) {
        navigate('/admin/products');
      } else {
        setError(res.message || 'Failed to create product.');
      }
    } catch (err) {
      console.error('Create product error:', err);
      setError(err.response?.data?.message || 'Error occurred while saving product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container admin-form-page section-padding">
      <Link to="/admin/products" className="back-link">
        <ArrowLeft size={16} /> Back to Products List
      </Link>

      <div className="card form-container-card">
        <h1 className="form-card-title">Add New Product to Store</h1>
        <p className="form-card-sub">
          Fill in product details to make it available to all customers in the shop.
        </p>

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
              placeholder="e.g. Ergonomic Keyboard"
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
                placeholder="49.99"
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
                placeholder="50"
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
            <label>Image URL (Unsplash or direct image link)</label>
            <input
              type="url"
              name="image_url"
              placeholder="https://images.unsplash.com/..."
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
              placeholder="Describe materials, key features, specifications, and warranty..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions-bar">
            <Link to="/admin/products" className="btn btn-outline">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Save size={18} /> {loading ? 'Saving Product...' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
