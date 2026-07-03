import React, { useState, useContext } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import styles from './Auth.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Wait for initial auth check to finish before rendering
  if (authLoading) return null;
  // Already logged in — redirect to dashboard
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} glass-panel`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}></div>
          <h2>Nexus<span className="text-gradient">Trade</span></h2>
        </div>
        <h3>Welcome Back</h3>
        <p className={styles.subtitle}>Sign in to your account to continue trading</p>
        
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} id="login-form" autoComplete="off">
          <div className={styles.inputGroup}>
            <label htmlFor="login-email">Email Address</label>
            <input 
              id="login-email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
              autoComplete="off"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="login-password">Password</label>
            <input 
              id="login-password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              required 
              autoComplete="new-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            style={{width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
            disabled={loading}
            id="login-submit"
          >
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className={styles.switchAuth}>
          Don't have an account? <Link to="/register" className="text-gradient">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
