require('dotenv').config();
const express = require('express');


const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { updateMockMarketData } = require('./jobs/marketDataScheduler');

// Routes
const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/market');
const portfolioRoutes = require('./routes/portfolio');
const tradeRoutes = require('./routes/trade');
const watchlistRoutes = require('./routes/watchlist');
const notificationRoutes = require('./routes/notification');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const { MongoMemoryServer } = require('mongodb-memory-server');

// Database connection
const connectDB = async () => {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('Connected to In-Memory MongoDB');
    updateMockMarketData(true);
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/notifications', notificationRoutes);

// Background job every minute
cron.schedule('* * * * *', () => {
  console.log('Running market data update job...');
  updateMockMarketData();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
