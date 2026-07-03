import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [coins, setCoins] = useState([]);
  const [overview, setOverview] = useState({ gainers: [], losers: [], trending: [] });
  const [loading, setLoading] = useState(true);

  const fetchMarketData = async () => {
    try {
      const [coinsRes, overviewRes] = await Promise.all([
        api.get('/market/coins'),
        api.get('/market/overview')
      ]);
      setCoins(coinsRes.data);
      setOverview(overviewRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching market data', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Refresh every 60 seconds
    const interval = setInterval(() => {
      fetchMarketData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MarketContext.Provider value={{ coins, overview, loading, refreshMarket: fetchMarketData }}>
      {children}
    </MarketContext.Provider>
  );
};
