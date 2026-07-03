const Coin = require('../models/Coin');
const HistoricalPrice = require('../models/HistoricalPrice');

const getAllCoins = async (req, res) => {
  try {
    const { search, sortBy = 'market_cap', order = 'desc' } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { symbol: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const sortOption = {};
    sortOption[sortBy] = order === 'desc' ? -1 : 1;

    const coins = await Coin.find(query).sort(sortOption);
    res.json(coins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCoinById = async (req, res) => {
  try {
    const coin = await Coin.findOne({ id: req.params.id });
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }
    res.json(coin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopGainersAndLosers = async (req, res) => {
  try {
    const gainers = await Coin.find().sort({ price_change_percentage_24h: -1 }).limit(3);
    const losers = await Coin.find().sort({ price_change_percentage_24h: 1 }).limit(3);
    const trending = await Coin.find().sort({ total_volume: -1 }).limit(4);
    
    res.json({ gainers, losers, trending });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHistoricalData = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 1 } = req.query;
    
    const coin = await Coin.findOne({ id });
    if (!coin) return res.status(404).json({ message: 'Coin not found' });

    // Since we mock data and it updates every minute, a "day" of data might not be realistic if just started.
    // We will just return all available data for now, limited to a reasonable amount.
    const history = await HistoricalPrice.find({ coin: coin._id }).sort({ timestamp: 1 }).limit(100);
    
    const formatted = history.map(h => ({
      timestamp: h.timestamp,
      price: h.price
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllCoins, getCoinById, getTopGainersAndLosers, getHistoricalData };
