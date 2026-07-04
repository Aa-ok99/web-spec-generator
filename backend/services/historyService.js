const historyRepository = require('../repositories/historyRepository');

async function getAll() {
  const history = await historyRepository.getAll();
  return history.map(item => ({
    id: item.id,
    url: item.url,
    title: item.title,
    createdAt: item.createdAt,
    specPreview: (item.spec || '').slice(0, 150) + '...'
  }));
}

async function getById(id) {
  if (!id || typeof id !== 'string' || id.length > 20) {
    throw Object.assign(new Error('Invalid ID'), { statusCode: 400 });
  }
  const item = await historyRepository.getById(id);
  if (!item) {
    throw Object.assign(new Error('History item not found'), { statusCode: 404 });
  }
  return item;
}

async function deleteById(id) {
  if (!id || typeof id !== 'string' || id.length > 20) {
    throw Object.assign(new Error('Invalid ID'), { statusCode: 400 });
  }
  const item = await historyRepository.getById(id);
  if (!item) {
    throw Object.assign(new Error('History item not found'), { statusCode: 404 });
  }
  await historyRepository.deleteById(id);
}

async function clear() {
  await historyRepository.clear();
}

async function save(entry) {
  return await historyRepository.add(entry);
}

module.exports = { getAll, getById, deleteById, clear, save };
