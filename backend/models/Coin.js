const mongoose = require('mongoose');

const CoinSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. bitcoin
  symbol: { type: String, required: true }, // e.g. btc
  name: { type: String, required: true },
  image: { type: String },
  current_price: { type: Number, required: true },
  market_cap: { type: Number },
  market_cap_rank: { type: Number },
  total_volume: { type: Number },
  high_24h: { type: Number },
  low_24h: { type: Number },
  price_change_24h: { type: Number },
  price_change_percentage_24h: { type: Number },
  circulating_supply: { type: Number },
  ath: { type: Number },
  atl: { type: Number },
  description: { type: String },
  last_updated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Coin', CoinSchema);
