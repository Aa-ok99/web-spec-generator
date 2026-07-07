const express = require('express');
const {
  getHistoryList,
  getHistoryItem,
  deleteHistoryItem,
  clearHistory
} = require('../controllers/historyController');
const router = express.Router();

router.get('/', getHistoryList);
router.get('/:id', getHistoryItem);
router.delete('/:id', deleteHistoryItem);
router.delete('/', clearHistory);

module.exports = router;
