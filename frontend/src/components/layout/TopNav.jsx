import React, { useContext } from 'react';
import { Search, Bell } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './TopNav.module.css';

const TopNav = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className={`${styles.topnav} glass-panel`}>
      {/* Search Bar */}
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search markets, coins, or portfolios..." 
          className={styles.searchInput}
          id="global-search"
        />
        <kbd className={styles.searchKbd}>⌘K</kbd>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {/* Balance Display */}
        <div className={styles.balanceChip}>
          <div className={styles.balanceDot} />
          <span className={styles.balanceLabel}>Balance</span>
          <span className={`${styles.balanceAmount} font-mono`}>
            ${user?.walletBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        
        {/* Notifications */}
        <button className={styles.iconBtn} id="notifications-btn" title="Notifications">
          <Bell size={20} />
          <span className={styles.notifBadge} />
        </button>

        {/* Avatar */}
        <div className={styles.avatarContainer}>
          <div className={styles.avatarRing}>
            <div className={styles.avatar}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
