const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = process.env.DATA_FILE ||
  path.join(__dirname, 'data', 'characters.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function sendJSON(res, status, obj) {
  const json = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json)
  });
  res.end(json);
}

function notFound(res) {
  res.writeHead(404);
  res.end();
}

function parseBody(req, cb) {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      cb(null, data);
    } catch (err) {
      cb(err);
    }
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/characters') {
    let characters = readData();
    const name = url.searchParams.get('name');
    if (name) {
      const lc = name.toLowerCase();
      characters = characters.filter(c =>
        String(c.name || '').toLowerCase().includes(lc)
      );
    }
    sendJSON(res, 200, characters);
    return;
  }

  const matchId = url.pathname.match(/^\/characters\/(\d+)$/);
  if (req.method === 'GET' && matchId) {
    const id = Number(matchId[1]);
    const characters = readData();
    const character = characters.find(c => c.id === id);
    if (character) {
      sendJSON(res, 200, character);
    } else {
      notFound(res);
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/characters') {
    parseBody(req, (err, data) => {
      if (err) {
        sendJSON(res, 400, { error: 'Invalid JSON' });
        return;
      }
      const characters = readData();
      const id = characters.length > 0 ? characters[characters.length - 1].id + 1 : 1;
      const character = Object.assign({ id }, data);
      characters.push(character);
      writeData(characters);
      sendJSON(res, 201, character);
    });
    return;
  }

  if (req.method === 'PUT' && matchId) {
    parseBody(req, (err, data) => {
      if (err) {
        sendJSON(res, 400, { error: 'Invalid JSON' });
        return;
      }
      const id = Number(matchId[1]);
      const characters = readData();
      const idx = characters.findIndex(c => c.id === id);
      if (idx === -1) {
        notFound(res);
        return;
      }
      const updated = Object.assign({}, characters[idx], data, { id });
      characters[idx] = updated;
      writeData(characters);
      sendJSON(res, 200, updated);
    });
    return;
  }

  if (req.method === 'DELETE' && matchId) {
    const id = Number(matchId[1]);
    const characters = readData();
    const idx = characters.findIndex(c => c.id === id);
    if (idx === -1) {
      notFound(res);
      return;
    }
    const removed = characters.splice(idx, 1)[0];
    writeData(characters);
    sendJSON(res, 200, removed);
    return;
  }

  notFound(res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Character service listening on port ${PORT}`);
});
