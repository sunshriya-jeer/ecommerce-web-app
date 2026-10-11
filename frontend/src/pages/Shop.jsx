import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal, AlertCircle } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Clothing', 'Home', 'Books'];

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const rawCategory = searchParams.get('category')?.trim() || '';
  const currentCategory = (!rawCategory || rawCategory.toLowerCase() === 'all')
    ? 'All'
    : CATEGORIES.find((cat) => cat.toLowerCase() === rawCategory.toLowerCase()) || rawCategory;

  const currentSearch = searchParams.get('search')?.trim() || '';
  const currentSort = searchParams.get('sort')?.trim() || 'newest';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [prevSearch, setPrevSearch] = useState(currentSearch);

  // Synchronize searchInput when query string changes without cascading effect warning
  if (prevSearch !== currentSearch) {
    setPrevSearch(currentSearch);
    setSearchInput(currentSearch);
  }

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (currentCategory && currentCategory.toLowerCase() !== 'all') {
          params.category = currentCategory;
        }
        if (currentSearch) {
          params.search = currentSearch;
        }
        if (currentSort) {
          params.sort = currentSort;
        }

        const res = await productService.getAll(params);
        if (ignore) return;
        let items = [];
        if (Array.isArray(res)) {
          items = res;
        } else if (Array.isArray(res?.data)) {
          items = res.data;
        } else if (Array.isArray(res?.products)) {
          items = res.products;
        }
        setProducts(items);
      } catch (err) {
        if (ignore) return;
        console.error('Failed to load products:', err);
        setError(err.response?.data?.message || 'Failed to fetch catalog. Please check your backend connection.');
        setProducts([]);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [currentCategory, currentSearch, currentSort, reloadKey]);

  const handleCategorySelect = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category.toLowerCase() === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    const trimmed = searchInput.trim();
    if (trimmed) {
      newParams.set('search', trimmed);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', e.target.value);
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="container shop-page section-padding">
      <div className="shop-header">
        <h1 className="page-heading">Catalog & Products</h1>
        <p className="page-subheading">
          Browse our collection with real-time stock and dynamic filtering.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="shop-controls-bar">
        {/* Category Pills */}
        <div className="category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`pill-btn ${currentCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="controls-right">
          <form className="shop-search-box" onSubmit={handleSearchSubmit}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search in catalog..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchInput('');
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('search');
                  setSearchParams(newParams);
                }}
              >
                ×
              </button>
            )}
          </form>

          <div className="sort-dropdown-wrap">
            <SlidersHorizontal size={16} />
            <select value={currentSort} onChange={handleSortChange}>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active filters note */}
      {(currentCategory !== 'All' || currentSearch) && (
        <div className="active-filters-info">
          <span>
            Filtering by: {currentCategory !== 'All' && <strong>Category: {currentCategory}</strong>}{' '}
            {currentSearch && <strong>Keyword: "{currentSearch}"</strong>}
          </span>
          <button onClick={handleClearFilters} className="clear-all-btn">
            Clear all filters
          </button>
        </div>
      )}

      {/* Content States */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching available inventory...</p>
        </div>
      ) : error ? (
        <div className="error-alert">
          <AlertCircle size={24} />
          <div style={{ flex: 1 }}>
            <h4>Could not load products</h4>
            <p>{error}</p>
          </div>
          <button onClick={() => setReloadKey((k) => k + 1)} className="btn btn-outline-sm">
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <Filter size={48} className="empty-icon" />
          <h3>No products match your criteria</h3>
          <p>Try searching for a different keyword or resetting your category filter.</p>
          <button onClick={handleClearFilters} className="btn btn-primary">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
