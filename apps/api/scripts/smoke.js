const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const apiDir = path.resolve(__dirname, '..');

const child = spawn('node', ['dist/main.js'], { cwd: apiDir, stdio: 'inherit' });

let killed = false;
const cleanup = () => {
  if (!killed) {
    killed = true;
    child.kill('SIGTERM');
  }
};

const timeout = setTimeout(() => {
  console.error('Smoke test timed out waiting for /health');
  cleanup();
  process.exit(1);
}, 10000);

const checkHealth = () => {
  http.get('http://localhost:3001/health', (res) => {
    clearTimeout(timeout);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Health: ${res.statusCode} ${data}`);
      cleanup();
      process.exit(res.statusCode === 200 ? 0 : 1);
    });
  }).on('error', () => {
    setTimeout(checkHealth, 500);
  });
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

setTimeout(checkHealth, 2000);
