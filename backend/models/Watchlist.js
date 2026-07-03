const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  coins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coin' }]
}, { timestamps: true });

module.exports = mongoose.model('Watchlist', WatchlistSchema);
