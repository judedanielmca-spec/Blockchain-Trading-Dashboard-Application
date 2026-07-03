import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, PieChart, ArrowLeftRight, History, Star, LogOut } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Market', path: '/market', icon: <TrendingUp size={20} /> },
    { name: 'Portfolio', path: '/portfolio', icon: <PieChart size={20} /> },
    { name: 'Trade', path: '/trade', icon: <ArrowLeftRight size={20} /> },
    { name: 'Transactions', path: '/transactions', icon: <History size={20} /> },
    { name: 'Watchlist', path: '/watchlist', icon: <Star size={20} /> },
  ];

  return (
    <aside className={`${styles.sidebar} glass-panel`}>
      {/* Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#bolt-grad)" />
            <defs>
              <linearGradient id="bolt-grad" x1="3" y1="2" x2="21" y2="22">
                <stop stopColor="#00E5FF" />
                <stop offset="1" stopColor="#7C4DFF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className={styles.logoText}>Nexus<span className="text-gradient">Trade</span></h1>
      </div>
      
      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.name}</span>
            {item.path === location.pathname && (
              <span className={styles.activeIndicator} />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section at bottom */}
      <div className={styles.bottomSection}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'User'}</span>
            <span className={styles.userEmail}>Trader</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={logout} title="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
