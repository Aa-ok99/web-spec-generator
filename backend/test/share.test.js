const path = require('path');
process.env.HISTORY_PATH = path.join(__dirname, '../data/test-share.json');

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');

const TEST_HISTORY_PATH = process.env.HISTORY_PATH;

const {
  getShareData,
  getShareView
} = require('../controllers/shareController');

function mockReqRes() {
  const req = { params: {} };
  const res = {
    _status: 200,
    _json: null,
    _send: null,
    status(code) { this._status = code; return this; },
    json(data) { this._json = data; return this; },
    send(data) { this._send = data; return this; }
  };
  return { req, res };
}

before(async () => {
  await fs.writeJson(TEST_HISTORY_PATH, [
    { id: 'abc123', url: 'https://example.com', title: 'Test Site', createdAt: '2026-06-01T00:00:00.000Z', spec: '# Test Spec\n\nHello world' }
  ]);
});

after(async () => {
  await fs.unlink(TEST_HISTORY_PATH).catch(() => {});
});

describe('Share Controller', () => {
  it('getShareData returns item data', async () => {
    const { req, res } = mockReqRes();
    req.params.id = 'abc123';
    await getShareData(req, res);
    assert.strictEqual(res._status, 200);
    assert.strictEqual(res._json.id, 'abc123');
    assert.strictEqual(res._json.title, 'Test Site');
  });

  it('getShareData returns 404 for missing id', async () => {
    const { req, res } = mockReqRes();
    req.params.id = 'missing';
    await getShareData(req, res);
    assert.strictEqual(res._status, 404);
  });

  it('getShareData returns 400 for invalid id length', async () => {
    const { req, res } = mockReqRes();
    req.params.id = 'x'.repeat(25);
    await getShareData(req, res);
    assert.strictEqual(res._status, 400);
  });

  it('getShareView returns HTML', () => {
    const { req, res } = mockReqRes();
    req.params.id = 'abc123';
    getShareView(req, res);
    assert.strictEqual(res._status, 200);
    assert.ok(res._send.includes('<!DOCTYPE html>'));
    assert.ok(res._send.includes('abc123'));
  });
});
