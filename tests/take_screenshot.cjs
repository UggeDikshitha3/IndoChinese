const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const possibleBrowsers = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\diksh\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\diksh\\AppData\\Local\\Microsoft\\Edge\\Application\\msedge.exe'
];

let browserPath = null;
for (const p of possibleBrowsers) {
  if (fs.existsSync(p)) {
    browserPath = p;
    break;
  }
}

console.log('Found Browser:', browserPath);

if (browserPath) {
  const artifactDir = 'C:\\Users\\diksh\\.gemini\\antigravity-ide\\brain\\7ed5c88b-7ef9-489f-b675-f9f837b7c0af';
  const outPath = path.join(artifactDir, 'render_live_screenshot.png');
  const targetUrl = 'https://indochinese-restaurant.onrender.com';

  console.log(`Taking screenshot of ${targetUrl} -> ${outPath}...`);
  try {
    const cmd = `"${browserPath}" --headless --disable-gpu --window-size=1280,1024 --screenshot="${outPath}" "${targetUrl}"`;
    execSync(cmd, { stdio: 'inherit', timeout: 30000 });
    console.log('Screenshot successfully saved to:', outPath);
  } catch (err) {
    console.error('Screenshot error:', err.message);
  }
} else {
  console.log('No headless browser binary found in standard paths.');
}
