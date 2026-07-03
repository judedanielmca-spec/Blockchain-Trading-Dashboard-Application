import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import styles from './Transactions.module.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/trade/transactions');
        setTransactions(res.data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className={styles.transactionsPage}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Transaction History</h1>
          <p className="text-secondary">Loading...</p>
        </div>
        <div className={`${styles.tableContainer} glass-panel`}>
          {[1,2,3,4].map(i => (
            <div key={i} className={styles.skeletonRow}>
              <div className="shimmer-loading" style={{width: '100px', height: '14px'}} />
              <div className="shimmer-loading" style={{width: '60px', height: '24px', borderRadius: '12px'}} />
              <div className="shimmer-loading" style={{width: '100px', height: '14px'}} />
              <div className="shimmer-loading" style={{width: '80px', height: '14px'}} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filtered = filter === 'ALL' ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div className={styles.transactionsPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Transaction History</h1>
          <p className="text-secondary">View your past trades</p>
        </div>
        <div className={styles.filterTabs}>
          {['ALL', 'BUY', 'SELL'].map(f => (
            <button
              key={f}
              className={`${styles.filterTab} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? 'All' : f === 'BUY' ? 'Buys' : 'Sells'}
            </button>
          ))}
        </div>
      </div>

      <div className={`${styles.tableContainer} glass-panel`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Asset</th>
              <th>Amount</th>
              <th>Price</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6">
                  <div className={styles.emptyState}>
                    <History size={32} className="text-muted" />
                    <p>No transactions found</p>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((t) => (
              <tr key={t._id} className={styles.tableRow}>
                <td className={styles.dateCell}>{formatDate(t.createdAt)}</td>
                <td>
                  <span className={`${styles.badge} ${t.type === 'BUY' ? styles.badgeBuy : styles.badgeSell}`}>
                    {t.type === 'BUY' ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
                    {t.type}
                  </span>
                </td>
                <td>
                  <div className={styles.assetCell}>
                    <div className={styles.assetIcon}>{t.coin.symbol[0].toUpperCase()}</div>
                    <div>
                      <div className={styles.assetName}>{t.coin.name}</div>
                      <div className={styles.assetSymbol}>{t.coin.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td className={`font-mono ${styles.cellBold}`}>{t.quantity}</td>
                <td className="font-mono">${formatCurrency(t.pricePerCoin)}</td>
                <td className={`font-mono ${styles.cellBold}`}>${formatCurrency(t.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
