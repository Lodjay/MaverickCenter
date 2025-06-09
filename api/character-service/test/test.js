const assert = require('assert');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'tmp');
const dataFile = path.join(dataDir, 'characters.json');
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(dataFile, '[]');

const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, '..'),
  env: Object.assign({}, process.env, { DATA_FILE: dataFile })
});

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function request(method, urlPath, body) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: urlPath,
    method,
    headers: {}
  };
  let data = null;
  if (body) {
    data = JSON.stringify(body);
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = Buffer.byteLength(data);
  }
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let chunks = '';
      res.on('data', d => (chunks += d));
      res.on('end', () => {
        const result = { status: res.statusCode };
        if (chunks) {
          result.body = JSON.parse(chunks);
        }
        resolve(result);
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  await wait(500);
  try {
    let res = await request('POST', '/characters', { name: 'Test' });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.id, 1);

    res = await request('GET', '/characters');
    assert.strictEqual(res.body.length, 1);

    res = await request('GET', '/characters?name=Test');
    assert.strictEqual(res.body.length, 1);

    res = await request('PUT', '/characters/1', { name: 'Updated' });
    assert.strictEqual(res.body.name, 'Updated');

    res = await request('DELETE', '/characters/1');
    assert.strictEqual(res.body.id, 1);

    res = await request('GET', '/characters');
    assert.strictEqual(res.body.length, 0);

    console.log('All tests passed');
  } catch (err) {
    console.error('Test failed', err);
    process.exitCode = 1;
  } finally {
    server.kill();
  }
})();
