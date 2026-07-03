import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { MarketContext } from '../../contexts/MarketContext';
import api from '../../services/api';
import styles from './TopNav.module.css';

const TopNav = () => {
  const { user } = useContext(AuthContext);
  const { coins } = useContext(MarketContext);
  const navigate = useNavigate();

  // Search state & refs
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Notification state & refs
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut Ctrl+K to search, Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
        setShowSearchDropdown(false);
        setShowNotifDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle notifications panel
  const toggleNotifications = async () => {
    const nextShow = !showNotifDropdown;
    setShowNotifDropdown(nextShow);
    if (nextShow) {
      // Mark all as read on backend
      try {
        await api.put('/notifications/read');
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error('Failed to mark notifications as read', err);
      }
    }
  };

  const handleSearchResultClick = (coinId) => {
    navigate(`/trade?coin=${coinId}`);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const filteredCoins = searchQuery
    ? coins.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const hasUnread = notifications.some(n => !n.read);

  const formatNotifDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) + ' ' + 
           date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatCurrency = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <header className={`${styles.topnav} glass-panel`}>
      {/* Search Bar */}
      <div className={styles.searchWrapper} ref={searchRef}>
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search markets, coins, or portfolios..." 
            className={styles.searchInput}
            id="global-search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
          />
          <kbd className={styles.searchKbd}>Ctrl K</kbd>
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchQuery && (
          <div className={styles.searchResultsDropdown}>
            {filteredCoins.length === 0 ? (
              <div style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                No assets found matching "{searchQuery}"
              </div>
            ) : (
              filteredCoins.map(coin => (
                <button
                  key={coin.id}
                  className={styles.searchResultItem}
                  onClick={() => handleSearchResultClick(coin.id)}
                >
                  <div className={styles.searchResultInfo}>
                    <div className={styles.searchResultIconSmall}>
                      {coin.symbol[0].toUpperCase()}
                    </div>
                    <div className={styles.searchResultText}>
                      <span className={styles.searchResultName}>{coin.name}</span>
                      <span className={styles.searchResultSymbol}>{coin.symbol.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className={styles.searchResultStats}>
                    <span className={styles.searchResultPrice}>${formatCurrency(coin.current_price)}</span>
                    <span className={`${styles.searchResultChange} ${coin.price_change_percentage_24h >= 0 ? styles.searchResultChangeUp : styles.searchResultChangeDown}`}>
                      {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
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
        <div className={styles.notificationWrapper} ref={notifRef}>
          <button 
            className={styles.iconBtn} 
            id="notifications-btn" 
            title="Notifications"
            onClick={toggleNotifications}
          >
            <Bell size={20} />
            {hasUnread && <span className={styles.notifBadge} />}
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <div className={styles.notificationDropdown}>
              <div className={styles.notificationHeader}>
                <h4>Notifications</h4>
                {hasUnread && (
                  <button className={styles.markAllReadBtn} onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className={styles.notificationList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotifications}>
                    <Bell size={24} className={styles.emptyNotificationsSvg} />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      className={`${styles.notificationItem} ${!notif.read ? styles.notificationItemUnread : ''}`}
                    >
                      <p className={styles.notificationMessage}>{notif.message}</p>
                      <div className={styles.notificationMeta}>
                        <span style={{
                          color: notif.type === 'SUCCESS' ? 'var(--success-emerald)' : 'var(--primary-electric-blue)',
                          fontWeight: 600
                        }}>{notif.type}</span>
                        <span>{formatNotifDate(notif.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
