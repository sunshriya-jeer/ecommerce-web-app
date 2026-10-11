import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { full_name, email, password, confirmPassword } = formData;

    if (!full_name || !email || !password || !confirmPassword) {
      setError('Please complete all registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(full_name, email, password, confirmPassword);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || err.message || 'An error occurred while creating your account.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper section-padding">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <UserPlus size={24} />
          </div>
          <h2>Create Account</h2>
          <p>Join ApexStore to track orders and save your delivery details.</p>
        </div>

        {error && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-alert">
            <CheckCircle size={18} />
            <span>Account registered successfully! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="full_name"
              placeholder="e.g. Alex Johnson"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="btn btn-primary btn-block btn-lg"
          >
            {loading ? <span className="spinner-sm"></span> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
