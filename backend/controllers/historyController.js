const fs = require('fs-extra');
const path = require('path');

const HISTORY_PATH = path.join(__dirname, '../data/history.json');

function getHistory() {
  try {
    return fs.readJsonSync(HISTORY_PATH);
  } catch {
    return [];
  }
}

function getHistoryList(req, res) {
  const history = getHistory();
  const list = history.map(item => ({
    id: item.id,
    url: item.url,
    title: item.title,
    createdAt: item.createdAt,
    specPreview: (item.spec || '').slice(0, 150) + '...'
  }));
  res.json(list);
}

function getHistoryItem(req, res) {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.length > 20) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  const history = getHistory();
  const item = history.find(h => h.id === id);
  if (!item) {
    return res.status(404).json({ error: 'History item not found' });
  }
  res.json(item);
}

function deleteHistoryItem(req, res) {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.length > 20) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  let history = getHistory();
  history = history.filter(h => h.id !== id);
  fs.writeJsonSync(HISTORY_PATH, history, { spaces: 2 });
  res.json({ success: true, message: 'Deleted' });
}

function clearHistory(req, res) {
  fs.writeJsonSync(HISTORY_PATH, []);
  res.json({ success: true, message: 'All history cleared' });
}

module.exports = {
  getHistoryList,
  getHistoryItem,
  deleteHistoryItem,
  clearHistory
};
