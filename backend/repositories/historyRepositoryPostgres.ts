const { Pool } = require('pg');
const config = require('../config');

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: config.DB_URL,
      max: 10,
      idleTimeoutMillis: 30000
    });
  }
  return pool;
}

async function getAll() {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      'SELECT id, url, title, created_at, spec FROM spec_history ORDER BY created_at DESC'
    );
    return result.rows.map(r => ({
      id: r.id,
      url: r.url,
      title: r.title,
      createdAt: r.created_at,
      spec: r.spec
    }));
  } finally {
    client.release();
  }
}

async function getById(id) {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      'SELECT id, url, title, created_at, spec FROM spec_history WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return {
      id: r.id,
      url: r.url,
      title: r.title,
      createdAt: r.created_at,
      spec: r.spec
    };
  } finally {
    client.release();
  }
}

async function add(entry) {
  const client = await getPool().connect();
  try {
    await client.query(
      `INSERT INTO spec_history (id, url, title, spec) VALUES ($1, $2, $3, $4)`,
      [entry.id, entry.url, entry.title, entry.spec]
    );

    const countResult = await client.query('SELECT COUNT(*) FROM spec_history');
    const count = parseInt(countResult.rows[0].count);
    if (count > config.MAX_HISTORY_ITEMS) {
      await client.query(
        `DELETE FROM spec_history WHERE id IN (
          SELECT id FROM spec_history ORDER BY created_at ASC
          LIMIT $1
        )`,
        [count - config.MAX_HISTORY_ITEMS]
      );
    }

    return entry;
  } finally {
    client.release();
  }
}

async function deleteById(id) {
  const client = await getPool().connect();
  try {
    await client.query('DELETE FROM spec_history WHERE id = $1', [id]);
    return true;
  } finally {
    client.release();
  }
}

async function clear() {
  const client = await getPool().connect();
  try {
    await client.query('DELETE FROM spec_history');
    return true;
  } finally {
    client.release();
  }
}

module.exports = { getAll, getById, add, deleteById, clear };
