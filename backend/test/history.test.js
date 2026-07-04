const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');
const path = require('path');

const TEST_HISTORY_PATH = path.join(__dirname, '../data/history.json');

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

before(() => {
  fs.writeJsonSync(TEST_HISTORY_PATH, [
    { id: 'test1', url: 'https://example.com', title: 'Example', createdAt: '2026-01-01T00:00:00.000Z', spec: '# Spec\n\nContent here' },
    { id: 'test2', url: 'https://youtube.com', title: 'YouTube', createdAt: '2026-01-02T00:00:00.000Z', spec: '# YouTube\n\nVideo platform' }
  ]);
});

after(() => {
  fs.writeJsonSync(TEST_HISTORY_PATH, []);
});

describe('History Controller', () => {
  it('getHistoryList returns all items with preview', () => {
    const { req, res } = mockReqRes();
    getHistoryList(req, res);
    assert.strictEqual(res._status, 200);
    assert.strictEqual(res._json.length, 2);
    assert.ok(res._json[0].specPreview.endsWith('...'));
  });

  it('getHistoryItem returns item by id', () => {
    const { req, res } = mockReqRes();
    req.params.id = 'test1';
    getHistoryItem(req, res);
    assert.strictEqual(res._status, 200);
    assert.strictEqual(res._json.id, 'test1');
    assert.strictEqual(res._json.title, 'Example');
  });

  it('getHistoryItem returns 404 for unknown id', () => {
    const { req, res } = mockReqRes();
    req.params.id = 'nonexistent';
    getHistoryItem(req, res);
    assert.strictEqual(res._status, 404);
    assert.ok(res._json.error.includes('not found'));
  });

  it('getHistoryItem returns 400 for invalid id', () => {
    const { req, res } = mockReqRes();
    req.params.id = 'a'.repeat(30);
    getHistoryItem(req, res);
    assert.strictEqual(res._status, 400);
  });

  it('deleteHistoryItem removes item', () => {
    const { req, res } = mockReqRes();
    req.params.id = 'test1';
    deleteHistoryItem(req, res);
    assert.strictEqual(res._status, 200);

    const data = fs.readJsonSync(TEST_HISTORY_PATH);
    assert.strictEqual(data.length, 1);
    assert.strictEqual(data[0].id, 'test2');
  });

  it('clearHistory removes all items', () => {
    const { req, res } = mockReqRes();
    clearHistory(req, res);
    assert.strictEqual(res._status, 200);

    const data = fs.readJsonSync(TEST_HISTORY_PATH);
    assert.strictEqual(data.length, 0);
  });
});
