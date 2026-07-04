const fs = require('fs-extra');
const config = require('../config');

async function getAll() {
  try {
    return await fs.readJson(config.HISTORY_PATH);
  } catch {
    return [];
  }
}

async function getById(id) {
  const history = await getAll();
  return history.find(h => h.id === id) || null;
}

async function add(entry) {
  const history = await getAll();
  history.unshift(entry);
  if (history.length > config.MAX_HISTORY_ITEMS) {
    history.pop();
  }
  await fs.writeJson(config.HISTORY_PATH, history, { spaces: 2 });
  return entry;
}

async function deleteById(id) {
  let history = await getAll();
  history = history.filter(h => h.id !== id);
  await fs.writeJson(config.HISTORY_PATH, history, { spaces: 2 });
  return true;
}

async function clear() {
  await fs.writeJson(config.HISTORY_PATH, []);
  return true;
}

module.exports = { getAll, getById, add, deleteById, clear };
