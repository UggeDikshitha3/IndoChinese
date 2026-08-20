const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const targetUrl = 'https://indochinese-restaurant.onrender.com';
const logFile = path.join(__dirname, 'edge_debug.log');

console.log('Capturing Edge logs for:', targetUrl);

try {
  const cmd = `"${browserPath}" --headless --disable-gpu --enable-logging=stderr --v=1 --dump-dom "${targetUrl}"`;
  const dom = execSync(cmd, { timeout: 15000, encoding: 'utf-8' });
  console.log('--- DUMPED DOM ---');
  console.log(dom.substring(0, 1500));
} catch (err) {
  console.error('Execution Error / Stderr:', err.stderr || err.message);
}
