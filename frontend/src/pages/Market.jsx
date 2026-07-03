import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketContext } from '../contexts/MarketContext';
import { Search, ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';
import api from '../services/api';
import styles from './Market.module.css';

const COIN_COLORS = {
  b: '#F7931A', // bitcoin
  e: '#627EEA', // ethereum
  t: '#26A17B', // tether
  s: '#3E73C4', // solana
  d: '#F0B90B', // doge
  r: '#0085C0', // ripple
  c: '#8DC63F', // cardano
  a: '#2775CA', // avalanche
  l: '#345D9D', // litecoin
  p: '#E6007A', // polkadot
};

const Market = () => {
  const { coins, loading } = useContext(MarketContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={styles.marketPage}>
        <div className={styles.header}>
          <div>
            <h1>Cryptocurrency Prices</h1>
            <p className="text-secondary">Loading market data...</p>
          </div>
        </div>
        <div className={`${styles.tableContainer} glass-panel`}>
          {[1,2,3,4,5].map(i => (
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

  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sorting
  let sortedCoins = [...filteredCoins];
  if (sortField) {
    sortedCoins.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleAddToWatchlist = async (e, coinId) => {
    e.stopPropagation();
    try {
      await api.post('/watchlist', { coinId });
    } catch (error) {
      console.error('Error adding to watchlist', error);
    }
  };

  const formatCurrency = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getCoinColor = (symbol) => {
    const firstChar = symbol[0].toLowerCase();
    return COIN_COLORS[firstChar] || 'var(--primary-electric-blue)';
  };

  return (
    <div className={styles.marketPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Cryptocurrency Prices</h1>
          <p className="text-secondary">Explore the market and find your next investment</p>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search coins..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="market-search"
            />
          </div>
        </div>
      </div>

      <div className={`${styles.tableContainer} glass-panel`}>
        <table className={styles.marketTable}>
          <thead>
            <tr>
              <th style={{width: '40px'}}>#</th>
              <th>Asset</th>
              <th className={styles.sortable} onClick={() => handleSort('current_price')}>
                Price {sortField === 'current_price' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th className={styles.sortable} onClick={() => handleSort('price_change_percentage_24h')}>
                24h Change {sortField === 'price_change_percentage_24h' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th className={styles.sortable} onClick={() => handleSort('market_cap')}>
                Market Cap {sortField === 'market_cap' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th>Volume (24h)</th>
              <th style={{width: '120px'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedCoins.map((coin, index) => (
              <tr key={coin.id} className={styles.tableRow} onClick={() => navigate(`/trade?coin=${coin.id}`)} style={{cursor: 'pointer'}}>
                <td className="text-muted">{index + 1}</td>
                <td>
                  <div className={styles.assetCell}>
                    <div className={styles.assetIcon} style={{background: `${getCoinColor(coin.symbol)}18`, color: getCoinColor(coin.symbol)}}>
                      {coin.symbol[0].toUpperCase()}
                    </div>
                    <div className={styles.assetNameInfo}>
                      <span className={styles.assetName}>{coin.name}</span>
                      <span className={styles.assetSymbol}>{coin.symbol.toUpperCase()}</span>
                    </div>
                  </div>
                </td>
                <td className={`${styles.cellBold} font-mono`}>${formatCurrency(coin.current_price)}</td>
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
                      className={styles.watchlistBtn}
                      onClick={(e) => handleAddToWatchlist(e, coin.id)}
                      title="Add to watchlist"
                    >
                      <Star size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Market;
