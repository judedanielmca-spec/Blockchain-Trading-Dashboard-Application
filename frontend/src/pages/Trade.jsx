import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MarketContext } from '../contexts/MarketContext';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { ArrowUpRight, ArrowDownRight, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './Trade.module.css';

const Trade = () => {
  const [searchParams] = useSearchParams();
  const defaultCoinId = searchParams.get('coin');
  const navigate = useNavigate();

  const { coins } = useContext(MarketContext);
  const { user, setUser } = useContext(AuthContext);

  const [selectedCoinId, setSelectedCoinId] = useState(defaultCoinId || 'bitcoin');
  const [tradeType, setTradeType] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedCoin = coins.find(c => c.id === selectedCoinId) || coins[0];

  // Quick amount presets
  const handleQuickAmount = (percentage) => {
    if (!selectedCoin || !user) return;
    if (tradeType === 'BUY') {
      const maxQty = (user.walletBalance * percentage) / selectedCoin.current_price;
      setQuantity(maxQty.toFixed(6));
    }
  };

  const handleTrade = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/trade', {
        coinId: selectedCoinId,
        type: tradeType,
        quantity: Number(quantity)
      });
      
      setSuccess(res.data.message);
      setUser({ ...user, walletBalance: res.data.newBalance });
      setQuantity('');
    } catch (err) {
      setError(err.response?.data?.message || 'Trade failed');
    }
    setLoading(false);
  };

  if (!selectedCoin) return <div className="loading">Loading...</div>;

  const totalAmount = (Number(quantity) || 0) * selectedCoin.current_price;
  const formatCurrency = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className={styles.tradePage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Trade Asset</h1>
          <p className="text-secondary">Simulate buying and selling cryptocurrency</p>
        </div>
      </div>

      <div className={styles.tradeLayout}>
        {/* Left Side: Info */}
        <div className={`${styles.infoCard} glass-panel`}>
          <div className={styles.coinHeader}>
            <div className={styles.coinIcon}>{selectedCoin.symbol[0].toUpperCase()}</div>
            <div>
              <h3 className={styles.coinName}>{selectedCoin.name}</h3>
              <span className="text-muted">{selectedCoin.symbol.toUpperCase()}</span>
            </div>
          </div>
          
          <div className={styles.priceInfo}>
            <div className={`${styles.currentPrice} font-mono`}>
              ${formatCurrency(selectedCoin.current_price)}
            </div>
            <span className={`${styles.priceChange} ${selectedCoin.price_change_percentage_24h >= 0 ? styles.priceUp : styles.priceDown}`}>
              {selectedCoin.price_change_percentage_24h >= 0 ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
              {Math.abs(selectedCoin.price_change_percentage_24h).toFixed(2)}%
              <span className={styles.priceChangeLabel}>24h</span>
            </span>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Market Cap</div>
              <div className={`${styles.statValue} font-mono`}>${(selectedCoin.market_cap / 1e9).toFixed(2)}B</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Volume (24h)</div>
              <div className={`${styles.statValue} font-mono`}>${(selectedCoin.total_volume / 1e6).toFixed(2)}M</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>All Time High</div>
              <div className={`${styles.statValue} font-mono`}>${selectedCoin.ath?.toLocaleString() || '—'}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Your Balance</div>
              <div className={`${styles.statValue} font-mono`}>${formatCurrency(user?.walletBalance || 0)}</div>
            </div>
          </div>
        </div>

        {/* Right Side: Trade Form */}
        <div className={`${styles.tradeFormCard} glass-panel`}>
          {/* Buy/Sell Tabs */}
          <div className={styles.tradeTabs}>
            <div className={styles.tabSlider} style={{transform: tradeType === 'SELL' ? 'translateX(100%)' : 'translateX(0)'}} />
            <button 
              className={`${styles.tab} ${tradeType === 'BUY' ? styles.tabActiveBuy : ''}`}
              onClick={() => setTradeType('BUY')}
            >
              Buy
            </button>
            <button 
              className={`${styles.tab} ${tradeType === 'SELL' ? styles.tabActiveSell : ''}`}
              onClick={() => setTradeType('SELL')}
            >
              Sell
            </button>
          </div>

          <form onSubmit={handleTrade} className={styles.form}>
            {/* Messages */}
            {error && (
              <div className={styles.errorMsg}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            {success && (
              <div className={styles.successMsg}>
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            {/* Select Asset */}
            <div className={styles.inputGroup}>
              <label>Select Asset</label>
              <select value={selectedCoinId} onChange={(e) => setSelectedCoinId(e.target.value)} className={styles.select}>
                {coins.map(coin => (
                  <option key={coin.id} value={coin.id}>{coin.name} ({coin.symbol.toUpperCase()})</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className={styles.inputGroup}>
              <label>Amount (in {selectedCoin.symbol.toUpperCase()})</label>
              <input 
                type="number" 
                step="0.000001"
                min="0.000001"
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                placeholder="0.00"
                required 
              />
            </div>

            {/* Quick Amount Buttons */}
            {tradeType === 'BUY' && (
              <div className={styles.quickAmounts}>
                {[0.25, 0.5, 0.75, 1].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    className={styles.quickBtn}
                    onClick={() => handleQuickAmount(pct)}
                  >
                    {pct === 1 ? 'Max' : `${pct * 100}%`}
                  </button>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Price per {selectedCoin.symbol.toUpperCase()}</span>
                <span className="font-mono">${formatCurrency(selectedCoin.current_price)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Total Value</span>
                <span className={`font-mono ${styles.summaryTotal}`}>${formatCurrency(totalAmount)}</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryRow}>
                <span>Available Balance</span>
                <span className="font-mono">${formatCurrency(user?.walletBalance || 0)}</span>
              </div>
              {tradeType === 'BUY' && totalAmount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Remaining After Trade</span>
                  <span className={`font-mono ${(user?.walletBalance || 0) - totalAmount < 0 ? 'text-loss' : ''}`}>
                    ${formatCurrency(Math.max(0, (user?.walletBalance || 0) - totalAmount))}
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className={`${styles.submitBtn} ${tradeType === 'BUY' ? styles.submitBuy : styles.submitSell}`}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                `${tradeType === 'BUY' ? 'Buy' : 'Sell'} ${selectedCoin.name}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Trade;
