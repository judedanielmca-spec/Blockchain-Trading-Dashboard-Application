import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';
import styles from './Portfolio.module.css';

const COLORS = ['#00E5FF', '#7C4DFF', '#00E676', '#FF9100', '#F50057', '#FFD740', '#18FFFF', '#E040FB'];

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get('/portfolio');
        setPortfolio(res.data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchPortfolio();
  }, []);

  if (loading || !portfolio) {
    return (
      <div className={styles.portfolioPage}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Your Portfolio</h1>
          <p className="text-secondary">Loading your assets...</p>
        </div>
        <div className={styles.loadingGrid}>
          <div className={`glass-panel ${styles.skeletonCard}`}>
            <div className="shimmer-loading" style={{width: '100%', height: '200px', borderRadius: '12px'}} />
          </div>
          <div className={`glass-panel ${styles.skeletonCard}`}>
            {[1,2,3,4].map(i => (
              <div key={i} className="shimmer-loading" style={{width: '100%', height: '20px', marginBottom: '16px'}} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pieData = portfolio.holdings.map(h => ({
    name: h.coin.symbol.toUpperCase(),
    value: h.currentValue
  }));

  if (user?.walletBalance > 0) {
    pieData.push({ name: 'USD Cash', value: user.walletBalance });
  }

  const formatCurrency = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = pieData.reduce((sum, d) => sum + d.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className={styles.customTooltip}>
          <div className={styles.tooltipLabel}>{data.name}</div>
          <div className={styles.tooltipValue}>${formatCurrency(data.value)}</div>
          <div className={styles.tooltipPct}>{percentage}% of portfolio</div>
        </div>
      );
    }
    return null;
  };

  const statsItems = [
    { label: 'Total Portfolio Value', value: `$${formatCurrency(portfolio.totalPortfolioValue + (user?.walletBalance || 0))}`, highlight: true },
    { label: 'Available Cash', value: `$${formatCurrency(user?.walletBalance || 0)}` },
    { label: 'Total Invested', value: `$${formatCurrency(portfolio.totalInvested)}` },
    { 
      label: 'Total Profit / Loss', 
      value: `${portfolio.totalProfitLoss >= 0 ? '+' : ''}$${formatCurrency(portfolio.totalProfitLoss)}`,
      subValue: `${portfolio.totalProfitLossPercentage.toFixed(2)}%`,
      isPositive: portfolio.totalProfitLoss >= 0 
    },
  ];

  return (
    <div className={styles.portfolioPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Your Portfolio</h1>
          <p className="text-secondary">Analyze your assets and performance</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/trade')} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Briefcase size={18} /> New Trade
        </button>
      </div>

      <div className={styles.topGrid}>
        {/* Allocation Chart */}
        <div className={`${styles.allocationCard} glass-panel`}>
          <h3 className={styles.sectionTitle}>Asset Allocation</h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className={styles.legend}>
            {pieData.map((entry, index) => (
              <div key={entry.name} className={styles.legendItem}>
                <span className={styles.legendDot} style={{background: COLORS[index % COLORS.length]}} />
                <span className={styles.legendLabel}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className={`${styles.statsCard} glass-panel`}>
          <h3 className={styles.sectionTitle}>Performance Summary</h3>
          <div className={styles.statList}>
            {statsItems.map((item, idx) => (
              <div key={idx} className={styles.statItem}>
                <span className={styles.statLabel}>{item.label}</span>
                <div className={styles.statRight}>
                  <span className={`${styles.statValue} ${item.isPositive !== undefined ? (item.isPositive ? 'text-success' : 'text-loss') : ''} ${item.highlight ? styles.statHighlight : ''}`}>
                    {item.value}
                  </span>
                  {item.subValue && (
                    <span className={`${styles.statSub} ${item.isPositive ? 'text-success' : 'text-loss'}`}>
                      {item.isPositive ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
                      {item.subValue}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className={`${styles.holdingsContainer} glass-panel`}>
        <h3 className={styles.sectionTitle}>Your Holdings</h3>
        <table className={styles.holdingsTable}>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Balance</th>
              <th>Avg Buy Price</th>
              <th>Current Price</th>
              <th>Total Value</th>
              <th>Profit / Loss</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.holdings.length === 0 && (
              <tr>
                <td colSpan="6">
                  <div className={styles.emptyState}>
                    <Briefcase size={32} className="text-muted" />
                    <p>No assets yet. Start trading to build your portfolio!</p>
                    <button className="btn-primary" style={{padding: '10px 20px'}} onClick={() => navigate('/trade')}>
                      Make Your First Trade
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {portfolio.holdings.map((h) => (
              <tr key={h.id} className={styles.tableRow} onClick={() => navigate(`/trade?coin=${h.coin.id}`)} style={{cursor: 'pointer'}}>
                <td>
                  <div className={styles.assetCell}>
                    <div className={styles.assetIcon}>{h.coin.symbol[0].toUpperCase()}</div>
                    <div>
                      <div className={styles.assetName}>{h.coin.name}</div>
                      <div className={styles.assetSymbol}>{h.coin.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td className="font-mono">{h.quantity}</td>
                <td className="font-mono">${formatCurrency(h.averageBuyPrice)}</td>
                <td className="font-mono">${formatCurrency(h.coin.current_price)}</td>
                <td className={`font-mono ${styles.cellBold}`}>${formatCurrency(h.currentValue)}</td>
                <td>
                  <div className={`${styles.plCell} ${h.profitLoss >= 0 ? styles.plPositive : styles.plNegative}`}>
                    <span>{h.profitLoss >= 0 ? '+' : ''}${formatCurrency(h.profitLoss)}</span>
                    <span className={styles.plPct}>
                      {h.profitLoss >= 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                      {Math.abs(h.profitLossPercentage).toFixed(2)}%
                    </span>
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

export default Portfolio;
