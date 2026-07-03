const Watchlist = require('../models/Watchlist');
const Coin = require('../models/Coin');
const Notification = require('../models/Notification');

const getWatchlist = async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne({ user: req.user.id }).populate('coins');
    if (!watchlist) {
      watchlist = await Watchlist.create({ user: req.user.id, coins: [] });
    }
    res.json(watchlist.coins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToWatchlist = async (req, res) => {
  try {
    const { coinId } = req.body;
    const coin = await Coin.findOne({ id: coinId });
    if (!coin) return res.status(404).json({ message: 'Coin not found' });

    let watchlist = await Watchlist.findOne({ user: req.user.id });
    if (!watchlist) {
      watchlist = await Watchlist.create({ user: req.user.id, coins: [] });
    }

    if (!watchlist.coins.includes(coin._id)) {
      watchlist.coins.push(coin._id);
      await watchlist.save();
      
      await Notification.create({
        user: req.user.id,
        message: `Added ${coin.name} (${coin.symbol.toUpperCase()}) to your watchlist`,
        type: 'INFO'
      });
    }
    
    await watchlist.populate('coins');
    res.json(watchlist.coins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const { coinId } = req.params;
    const coin = await Coin.findOne({ id: coinId });
    if (!coin) return res.status(404).json({ message: 'Coin not found' });

    let watchlist = await Watchlist.findOne({ user: req.user.id });
    if (watchlist) {
      const wasInWatchlist = watchlist.coins.some(c => c.toString() === coin._id.toString());
      watchlist.coins = watchlist.coins.filter(c => c.toString() !== coin._id.toString());
      await watchlist.save();
      
      if (wasInWatchlist) {
        await Notification.create({
          user: req.user.id,
          message: `Removed ${coin.name} (${coin.symbol.toUpperCase()}) from your watchlist`,
          type: 'INFO'
        });
      }
    }
    
    if (watchlist) {
      await watchlist.populate('coins');
      res.json(watchlist.coins);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
