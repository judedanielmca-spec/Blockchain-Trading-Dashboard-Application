const express = require('express');
const router = express.Router();
const { tradeCoin, getTransactions } = require('../controllers/tradeController');
const { protect } = require('../middleware/auth');

router.post('/', protect, tradeCoin);
router.get('/transactions', protect, getTransactions);

module.exports = router;
