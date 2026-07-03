const mongoose = require('mongoose');

const PortfolioItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coin: { type: mongoose.Schema.Types.ObjectId, ref: 'Coin', required: true },
  quantity: { type: Number, required: true, default: 0 },
  averageBuyPrice: { type: Number, required: true, default: 0 },
}, { timestamps: true });

// Compound index to quickly find a user's holdings
PortfolioItemSchema.index({ user: 1, coin: 1 }, { unique: true });

module.exports = mongoose.model('PortfolioItem', PortfolioItemSchema);
