const express = require('express');
const router = express.Router();
const { getAllCoins, getCoinById, getTopGainersAndLosers, getHistoricalData } = require('../controllers/marketController');

router.get('/coins', getAllCoins);
router.get('/overview', getTopGainersAndLosers);
router.get('/coins/:id', getCoinById);
router.get('/coins/:id/history', getHistoricalData);

module.exports = router;
