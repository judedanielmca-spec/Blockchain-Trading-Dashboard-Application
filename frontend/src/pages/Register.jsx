import React, { useState, useContext } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import styles from './Auth.module.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, register, loading: authLoading } = useContext(AuthContext);
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
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <h3>Create Account</h3>
        <p className={styles.subtitle}>Start your trading journey today</p>
        
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} id="register-form">
          <div className={styles.inputGroup}>
            <label htmlFor="register-name">Full Name</label>
            <input 
              id="register-name"
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="John Doe"
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="register-email">Email Address</label>
            <input 
              id="register-email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="register-password">Password</label>
            <input 
              id="register-password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Create a strong password"
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            style={{width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
            disabled={loading}
            id="register-submit"
          >
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchAuth}>
          Already have an account? <Link to="/login" className="text-gradient">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
