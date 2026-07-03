const Coin = require('../models/Coin');
const HistoricalPrice = require('../models/HistoricalPrice');

const initialCoins = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 65000, market_cap: 1200000000000, volume: 30000000000, circulating_supply: 19500000, ath: 73000, atl: 67, price_change_percentage_24h: 2.5 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3500, market_cap: 400000000000, volume: 15000000000, circulating_supply: 120000000, ath: 4800, atl: 0.4, price_change_percentage_24h: 1.2 },
  { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 150, market_cap: 65000000000, volume: 3000000000, circulating_supply: 450000000, ath: 260, atl: 0.5, price_change_percentage_24h: -5.4 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.45, market_cap: 16000000000, volume: 400000000, circulating_supply: 35000000000, ath: 3.1, atl: 0.01, price_change_percentage_24h: 0.5 },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.55, market_cap: 30000000000, volume: 1000000000, circulating_supply: 55000000000, ath: 3.84, atl: 0.002, price_change_percentage_24h: -1.2 },
  { id: 'polkadot', symbol: 'dot', name: 'Polkadot', current_price: 6.5, market_cap: 9000000000, volume: 200000000, circulating_supply: 1400000000, ath: 55, atl: 2.7, price_change_percentage_24h: 3.8 },
  { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 18, market_cap: 10000000000, volume: 350000000, circulating_supply: 580000000, ath: 52, atl: 0.14, price_change_percentage_24h: 10.2 },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.12, market_cap: 17000000000, volume: 1200000000, circulating_supply: 144000000000, ath: 0.73, atl: 0.00008, price_change_percentage_24h: -0.5 },
];

const updateMockMarketData = async (isInit = false) => {
  try {
    for (let coinData of initialCoins) {
      let coin = await Coin.findOne({ id: coinData.id });
      if (!coin) {
        coin = new Coin(coinData);
        await coin.save();
      } else {
        if (!isInit) {
          // Add some randomness between -2% and +2%
          const volatility = (Math.random() * 4 - 2) / 100;
          coin.current_price = coin.current_price * (1 + volatility);
          
          // Update 24h percentage slightly
          const changeDelta = (Math.random() * 1 - 0.5);
          coin.price_change_percentage_24h += changeDelta;
          
          coin.last_updated = Date.now();
          await coin.save();
        }
      }

      // Save historical price for charts
      await HistoricalPrice.create({
        coin: coin._id,
        price: coin.current_price,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
      });
    }
    if (!isInit) console.log('Mock market data updated');
  } catch (error) {
    console.error('Error updating market data:', error);
  }
};

module.exports = { updateMockMarketData };
