const historyService = require('../services/historyService');

async function getHistoryList(req, res) {
  try {
    const list = await historyService.getAll();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getHistoryItem(req, res) {
  try {
    const item = await historyService.getById(req.params.id);
    res.json(item);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
}

async function deleteHistoryItem(req, res) {
  try {
    await historyService.deleteById(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
}

async function clearHistory(req, res) {
  try {
    await historyService.clear();
    res.json({ success: true, message: 'All history cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getHistoryList,
  getHistoryItem,
  deleteHistoryItem,
  clearHistory
};
