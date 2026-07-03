import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Star, TrendingUp, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import styles from './Watchlist.module.css';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const res = await api.get('/watchlist');
      setWatchlist(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const removeFromWatchlist = async (e, coinId) => {
    e.stopPropagation();
    try {
      const res = await api.delete(`/watchlist/${coinId}`);
      setWatchlist(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const formatCurrency = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className={styles.watchlistPage}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Your Watchlist</h1>
          <p className="text-secondary">Loading...</p>
        </div>
        <div className={`${styles.tableContainer} glass-panel`}>
          {[1,2,3].map(i => (
            <div key={i} className={styles.skeletonRow}>
              <div className="shimmer-loading" style={{width: '38px', height: '38px', borderRadius: '50%'}} />
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '6px'}}>
                <div className="shimmer-loading" style={{width: '120px', height: '14px'}} />
                <div className="shimmer-loading" style={{width: '60px', height: '12px'}} />
              </div>
              <div className="shimmer-loading" style={{width: '80px', height: '14px'}} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.watchlistPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Your Watchlist</h1>
          <p className="text-secondary">Track your favorite assets</p>
        </div>
        <button className="btn-outline" onClick={() => navigate('/market')} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <TrendingUp size={18} /> Explore Market
        </button>
      </div>

      {watchlist.length === 0 ? (
        <div className={`${styles.emptyCard} glass-panel`}>
          <div className={styles.emptyIcon}>
            <Star size={40} />
          </div>
          <h3>No coins in your watchlist</h3>
          <p className="text-secondary">Start tracking coins by adding them from the market page.</p>
          <button className="btn-primary" onClick={() => navigate('/market')} style={{marginTop: '8px'}}>
            Browse Market
          </button>
        </div>
      ) : (
        <div className={`${styles.tableContainer} glass-panel`}>
          <table className={styles.watchlistTable}>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Price</th>
                <th>24h Change</th>
                <th>Market Cap</th>
                <th>Volume (24h)</th>
                <th style={{width: '140px'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((coin) => (
                <tr key={coin.id} className={styles.tableRow} onClick={() => navigate(`/trade?coin=${coin.id}`)} style={{cursor: 'pointer'}}>
                  <td>
                    <div className={styles.assetCell}>
                      <div className={styles.assetIcon}>{coin.symbol[0].toUpperCase()}</div>
                      <div>
                        <div className={styles.assetName}>{coin.name}</div>
                        <div className={styles.assetSymbol}>{coin.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`font-mono ${styles.cellBold}`}>${formatCurrency(coin.current_price)}</td>
                  <td>
                    <span className={`${styles.changeBadge} ${coin.price_change_percentage_24h >= 0 ? styles.changeBadgeUp : styles.changeBadgeDown}`}>
                      {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </span>
                  </td>
                  <td className="font-mono">${(coin.market_cap / 1e9).toFixed(2)}B</td>
                  <td className="font-mono">${(coin.total_volume / 1e6).toFixed(2)}M</td>
                  <td>
                    <div className={styles.actionCell}>
                      <button 
                        className={styles.tradeBtn}
                        onClick={(e) => { e.stopPropagation(); navigate(`/trade?coin=${coin.id}`); }}
                      >
                        Trade
                      </button>
                      <button 
                        className={styles.removeBtn}
                        onClick={(e) => removeFromWatchlist(e, coin.id)}
                        title="Remove from watchlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
