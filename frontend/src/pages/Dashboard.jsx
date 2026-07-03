import React, { useContext, useEffect, useState } from 'react';
import { MarketContext } from '../contexts/MarketContext';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, DollarSign, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { coins, overview, loading } = useContext(MarketContext);
  const [portfolioStats, setPortfolioStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get('/portfolio');
        setPortfolioStats(res.data);
      } catch (err) {
        console.error('Failed to fetch portfolio stats', err);
      }
    };
    fetchPortfolio();
  }, []);

  if (loading || !portfolioStats) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingGrid}>
          {[1,2,3].map(i => (
            <div key={i} className={`${styles.skeletonCard} glass-panel`}>
              <div className="shimmer-loading" style={{width: '60%', height: '14px', marginBottom: '16px'}} />
              <div className="shimmer-loading" style={{width: '80%', height: '28px', marginBottom: '12px'}} />
              <div className="shimmer-loading" style={{width: '40%', height: '14px'}} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Generate mock chart data for portfolio performance
  const mockChartData = Array.from({ length: 14 }).map((_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.round((portfolioStats.totalPortfolioValue * (1 + (Math.random() * 0.1 - 0.05))) * 100) / 100
  }));

  const formatCurrency = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const kpis = [
    {
      label: 'Total Portfolio Value',
      value: portfolioStats.totalPortfolioValue + (user?.walletBalance || 0),
      sub: portfolioStats.totalProfitLoss,
      subLabel: 'All time return',
      icon: <Wallet size={20} />,
      color: 'var(--primary-electric-blue)',
      bg: 'rgba(0, 229, 255, 0.08)',
    },
    {
      label: 'Available Cash',
      value: user?.walletBalance || 0,
      subLabel: 'Ready to invest',
      icon: <DollarSign size={20} />,
      color: 'var(--success-emerald)',
      bg: 'rgba(0, 230, 118, 0.08)',
    },
    {
      label: 'Total Invested',
      value: portfolioStats.totalInvested,
      subPct: portfolioStats.totalProfitLossPercentage,
      subLabel: 'ROI',
      icon: <TrendingUp size={20} />,
      color: 'var(--accent-purple-start)',
      bg: 'rgba(124, 77, 255, 0.08)',
    },
  ];

  return (
    <div className={styles.dashboard}>
      
      {/* Welcome Header */}
      <div className={styles.welcomeHeader}>
        <div>
          <h1 className={styles.greeting}>
            {getGreeting()}, <span className="text-gradient-blue">{user?.name?.split(' ')[0] || 'Trader'}</span>
          </h1>
          <p className={styles.welcomeSub}>Here's what's happening with your portfolio today.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/trade')} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Zap size={18} /> Quick Trade
        </button>
      </div>

      {/* KPI Cards */}
      <div className={`${styles.kpiGrid} stagger-children`}>
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`${styles.kpiCard} glass-panel animate-fade-in-up`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <div className={styles.kpiIconWrapper} style={{ background: kpi.bg, color: kpi.color }}>
                {kpi.icon}
              </div>
            </div>
            <div className={`${styles.kpiValue} font-mono`}>${formatCurrency(kpi.value)}</div>
            <div className={styles.kpiSub}>
              {kpi.sub !== undefined && (
                <span className={kpi.sub >= 0 ? 'text-success' : 'text-loss'}>
                  {kpi.sub >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                  {kpi.sub >= 0 ? '+' : ''}${formatCurrency(Math.abs(kpi.sub))}
                </span>
              )}
              {kpi.subPct !== undefined && (
                <span className={kpi.subPct >= 0 ? 'text-success' : 'text-loss'}>
                  {kpi.subPct >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                  {Math.abs(kpi.subPct).toFixed(2)}%
                </span>
              )}
              <span className={styles.kpiSubLabel}>{kpi.subLabel}</span>
            </div>
            {/* Accent stripe */}
            <div className={styles.kpiStripe} style={{background: `linear-gradient(90deg, ${kpi.color}, transparent)`}} />
          </div>
        ))}
      </div>

      <div className={styles.mainGrid}>
        {/* Chart Section */}
        <div className={`${styles.chartSection} glass-panel`}>
          <div className={styles.chartHeader}>
            <h3 className={styles.sectionTitle}>Portfolio Performance</h3>
            <div className={styles.chartPeriods}>
              <button className={styles.periodActive}>7D</button>
              <button className={styles.period}>14D</button>
              <button className={styles.period}>30D</button>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-electric-blue)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--primary-electric-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-dim)', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-dim)', fontSize: 12}} 
                  width={60}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(19, 26, 42, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '10px',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    padding: '12px 16px',
                  }}
                  itemStyle={{ color: 'var(--primary-electric-blue)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px' }}
                  formatter={(value) => [`$${formatCurrency(value)}`, 'Value']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--primary-electric-blue)" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Movers */}
        <div className={styles.sideGrid}>
          <div className={`${styles.listCard} glass-panel`}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionDot} style={{background: 'var(--success-emerald)'}} />
              Top Gainers
            </h3>
            <div className={styles.coinList}>
              {overview.gainers.map(coin => (
                <div key={coin.id} className={styles.coinItem} onClick={() => navigate(`/trade?coin=${coin.id}`)} style={{cursor: 'pointer'}}>
                  <div className={styles.coinInfo}>
                    <div className={styles.coinIconSmall}>{coin.symbol[0].toUpperCase()}</div>
                    <div>
                      <span className={styles.coinSymbol}>{coin.symbol.toUpperCase()}</span>
                      <span className={styles.coinName}>{coin.name}</span>
                    </div>
                  </div>
                  <div className={styles.coinStats}>
                    <span className={`${styles.coinPrice} font-mono`}>${formatCurrency(coin.current_price)}</span>
                    <span className="text-success">+{coin.price_change_percentage_24h.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className={`${styles.listCard} glass-panel`}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionDot} style={{background: 'var(--loss-crimson)'}} />
              Top Losers
            </h3>
            <div className={styles.coinList}>
              {overview.losers.map(coin => (
                <div key={coin.id} className={styles.coinItem} onClick={() => navigate(`/trade?coin=${coin.id}`)} style={{cursor: 'pointer'}}>
                  <div className={styles.coinInfo}>
                    <div className={styles.coinIconSmall}>{coin.symbol[0].toUpperCase()}</div>
                    <div>
                      <span className={styles.coinSymbol}>{coin.symbol.toUpperCase()}</span>
                      <span className={styles.coinName}>{coin.name}</span>
                    </div>
                  </div>
                  <div className={styles.coinStats}>
                    <span className={`${styles.coinPrice} font-mono`}>${formatCurrency(coin.current_price)}</span>
                    <span className="text-loss">{coin.price_change_percentage_24h.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Table */}
      <div className={`${styles.marketTableContainer} glass-panel`}>
        <div className={styles.tableHeader}>
          <h3 className={styles.sectionTitle}>Market Overview</h3>
          <button className="btn-outline" style={{padding: '8px 16px', fontSize: '0.85rem'}} onClick={() => navigate('/market')}>
            View All
          </button>
        </div>
        <table className={styles.marketTable}>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Price</th>
              <th>24h Change</th>
              <th>Market Cap</th>
              <th>Volume (24h)</th>
            </tr>
          </thead>
          <tbody>
            {coins.slice(0, 5).map(coin => (
              <tr key={coin.id} className={styles.tableRow} onClick={() => navigate(`/trade?coin=${coin.id}`)} style={{cursor: 'pointer'}}>
                <td>
                  <div className={styles.assetCell}>
                    <div className={styles.assetIcon}>{coin.symbol[0].toUpperCase()}</div>
                    <div className={styles.assetNameInfo}>
                      <span className={styles.assetName}>{coin.name}</span>
                      <span className={styles.assetSymbol}>{coin.symbol.toUpperCase()}</span>
                    </div>
                  </div>
                </td>
                <td className={`${styles.cellBold} font-mono`}>${formatCurrency(coin.current_price)}</td>
                <td className={coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-loss'}>
                  <span className={styles.changeBadge}>
                    {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </span>
                </td>
                <td className="font-mono">${(coin.market_cap / 1e9).toFixed(2)}B</td>
                <td className="font-mono">${(coin.total_volume / 1e6).toFixed(2)}M</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Dashboard;
