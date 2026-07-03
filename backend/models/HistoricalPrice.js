const mongoose = require('mongoose');

const HistoricalPriceSchema = new mongoose.Schema({
  coin: { type: mongoose.Schema.Types.ObjectId, ref: 'Coin', required: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  marketCap: { type: Number },
  volume: { type: Number }
});

HistoricalPriceSchema.index({ coin: 1, timestamp: 1 });

module.exports = mongoose.model('HistoricalPrice', HistoricalPriceSchema);
