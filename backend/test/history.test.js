const path = require('path');
process.env.HISTORY_PATH = path.join(__dirname, '../data/test-history.json');

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');

const TEST_HISTORY_PATH = process.env.HISTORY_PATH;

const {
  getHistoryList,
  getHistoryItem,
  deleteHistoryItem,
  clearHistory
} = require('../controllers/historyController');

function mockReqRes() {
  const req = { params: {} };
  const res = {
    _status: 200,
    _json: null,
    status(code) { this._status = code; return this; },
    json(data) { this._json = data; return this; }
  };
  return { req, res };
}

before(async () => {
  await fs.writeJson(TEST_HISTORY_PATH, [
    { id: 'test1', url: 'https://example.com', title: 'Example', createdAt: '2026-01-01T00:00:00.000Z', spec: '# Spec\n\nContent here' },
    { id: 'test2', url: 'https://youtube.com', title: 'YouTube', createdAt: '2026-01-02T00:00:00.000Z', spec: '# YouTube\n\nVideo platform' }
  ]);
});

after(async () => {
  await fs.unlink(TEST_HISTORY_PATH).catch(() => {});
});

describe('History Controller', () => {
  it('getHistoryList returns all items with preview', async () => {
    const { req, res } = mockReqRes();
    await getHistoryList(req, res);
    assert.strictEqual(res._status, 200);
    assert.strictEqual(res._json.length, 2);
    assert.ok(res._json[0].specPreview.endsWith('...'));
  });

  it('getHistoryItem returns item by id', async () => {
    const { req, res } = mockReqRes();
    req.params.id = 'test1';
    await getHistoryItem(req, res);
    assert.strictEqual(res._status, 200);
    assert.strictEqual(res._json.id, 'test1');
    assert.strictEqual(res._json.title, 'Example');
  });

  it('getHistoryItem returns 404 for unknown id', async () => {
    const { req, res } = mockReqRes();
    req.params.id = 'nonexistent';
    await getHistoryItem(req, res);
    assert.strictEqual(res._status, 404);
    assert.ok(res._json.error.includes('not found'));
  });

  it('getHistoryItem returns 400 for invalid id', async () => {
    const { req, res } = mockReqRes();
    req.params.id = 'a'.repeat(30);
    await getHistoryItem(req, res);
    assert.strictEqual(res._status, 400);
  });

  it('deleteHistoryItem removes item', async () => {
    const { req, res } = mockReqRes();
    req.params.id = 'test1';
    await deleteHistoryItem(req, res);
    assert.strictEqual(res._status, 200);

    const data = await fs.readJson(TEST_HISTORY_PATH);
    assert.strictEqual(data.length, 1);
    assert.strictEqual(data[0].id, 'test2');
  });

  it('clearHistory removes all items', async () => {
    const { req, res } = mockReqRes();
    await clearHistory(req, res);
    assert.strictEqual(res._status, 200);

    const data = await fs.readJson(TEST_HISTORY_PATH);
    assert.strictEqual(data.length, 0);
  });
});
