const PortfolioItem = require('../models/PortfolioItem');
const User = require('../models/User');

const getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const items = await PortfolioItem.find({ user: req.user.id }).populate('coin');

    let totalPortfolioValue = 0;
    let totalInvested = 0;
    
    const holdings = items.map(item => {
      const currentValue = item.quantity * item.coin.current_price;
      const investedValue = item.quantity * item.averageBuyPrice;
      const profitLoss = currentValue - investedValue;
      const profitLossPercentage = (profitLoss / investedValue) * 100;

      totalPortfolioValue += currentValue;
      totalInvested += investedValue;

      return {
        id: item._id,
        coin: item.coin,
        quantity: item.quantity,
        averageBuyPrice: item.averageBuyPrice,
        currentValue,
        profitLoss,
        profitLossPercentage
      };
    });

    const totalProfitLoss = totalPortfolioValue - totalInvested;
    const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    res.json({
      walletBalance: user.walletBalance,
      totalPortfolioValue,
      totalInvested,
      totalProfitLoss,
      totalProfitLossPercentage,
      holdings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPortfolio };
