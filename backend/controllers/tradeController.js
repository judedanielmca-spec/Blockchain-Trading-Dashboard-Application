const Transaction = require('../models/Transaction');
const PortfolioItem = require('../models/PortfolioItem');
const User = require('../models/User');
const Coin = require('../models/Coin');
const Notification = require('../models/Notification');

const tradeCoin = async (req, res) => {
  try {
    const { coinId, type, quantity } = req.body;
    const user = await User.findById(req.user.id);
    const coin = await Coin.findOne({ id: coinId });

    if (!coin) return res.status(404).json({ message: 'Coin not found' });
    if (quantity <= 0) return res.status(400).json({ message: 'Quantity must be > 0' });

    const totalAmount = coin.current_price * quantity;

    if (type === 'BUY') {
      if (user.walletBalance < totalAmount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      user.walletBalance -= totalAmount;
      await user.save();

      let portfolioItem = await PortfolioItem.findOne({ user: user._id, coin: coin._id });
      if (portfolioItem) {
        const totalValue = (portfolioItem.quantity * portfolioItem.averageBuyPrice) + totalAmount;
        portfolioItem.quantity += quantity;
        portfolioItem.averageBuyPrice = totalValue / portfolioItem.quantity;
      } else {
        portfolioItem = new PortfolioItem({
          user: user._id,
          coin: coin._id,
          quantity,
          averageBuyPrice: coin.current_price
        });
      }
      await portfolioItem.save();

    } else if (type === 'SELL') {
      let portfolioItem = await PortfolioItem.findOne({ user: user._id, coin: coin._id });
      if (!portfolioItem || portfolioItem.quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient coin holdings' });
      }

      user.walletBalance += totalAmount;
      await user.save();

      portfolioItem.quantity -= quantity;
      if (portfolioItem.quantity === 0) {
        await PortfolioItem.deleteOne({ _id: portfolioItem._id });
      } else {
        await portfolioItem.save();
      }
    } else {
      return res.status(400).json({ message: 'Invalid trade type' });
    }

    const transaction = await Transaction.create({
      user: user._id,
      coin: coin._id,
      type,
      quantity,
      pricePerCoin: coin.current_price,
      totalAmount
    });

    await Notification.create({
      user: user._id,
      message: `Successfully ${type === 'BUY' ? 'bought' : 'sold'} ${quantity} ${coin.symbol.toUpperCase()} at $${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Total: $${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
      type: 'SUCCESS'
    });

    res.status(201).json({ message: `Successfully ${type === 'BUY' ? 'bought' : 'sold'} ${quantity} ${coin.symbol.toUpperCase()}`, transaction, newBalance: user.walletBalance });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).populate('coin').sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { tradeCoin, getTransactions };
