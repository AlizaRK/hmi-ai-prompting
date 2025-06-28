import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';


const LoginPage = ({ onLoginComplete }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const userData = await apiService.login(formData);
        onLoginComplete(userData);
        navigate('/chat');
    } catch (error) {
        setError('Login failed');
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  };

  const formStyle = {
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  };

  const titleStyle = {
    textAlign: 'center',
    marginBottom: '10px',
    color: '#333',
    fontSize: '2rem',
    fontWeight: 'bold'
  };

  const subtitleStyle = {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px'
  };

  const formGroupStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease'
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '20px',
    transition: 'background-color 0.3s ease'
  };

  const errorStyle = {
    background: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    borderLeft: '4px solid #c33'
  };

  const footerStyle = {
    textAlign: 'center'
  };

  const linkStyle = {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600'
  };

  const backLinkStyle = {
    color: '#999',
    textDecoration: 'none',
    fontSize: '0.9rem'
  };

  return (
    <div style={containerStyle}>
      <div style={formStyle}>
        <h2 style={titleStyle}>Welcome Back</h2>
        <p style={subtitleStyle}>Sign in to your account</p>
        
        <form onSubmit={handleSubmit}>
          {error && <div style={errorStyle}>{error}</div>}
          
          <div style={formGroupStyle}>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
          </div>

          <button 
            type="submit" 
            style={buttonStyle}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5a6fd8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}
          >
            Sign In
          </button>
        </form>

        <div style={footerStyle}>
          <p style={{ marginBottom: '15px', color: '#666' }}>
            Don't have an account?{' '}
            <Link to="/register" style={linkStyle}>
              Sign up here
            </Link>
          </p>
          <Link to="/" style={backLinkStyle}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;