const config = require('../config');
const jsonRepo = require('./historyRepository');
let pgRepo = null;

function getRepository() {
  if (config.DB_URL) {
    if (!pgRepo) {
      try {
        pgRepo = require('./historyRepositoryPostgres');
      } catch (err) {
        console.warn('PostgreSQL repository unavailable, falling back to JSON:', err.message);
        return jsonRepo;
      }
    }
    return pgRepo;
  }
  return jsonRepo;
}

module.exports = {
  getRepository,
  getAll: (...args) => getRepository().getAll(...args),
  getById: (...args) => getRepository().getById(...args),
  add: (...args) => getRepository().add(...args),
  deleteById: (...args) => getRepository().deleteById(...args),
  clear: (...args) => getRepository().clear(...args),
  updateGeneratedCode: (...args) => getRepository().updateGeneratedCode(...args)
};
