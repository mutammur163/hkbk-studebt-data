const fs = require('fs');
const path = require('path');

// Target the dist directory
const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the redirect wrapper script to dist/app.js
// This forwards the execution to dist/src/app.js with proper relative paths intact.
fs.writeFileSync(
  path.join(distDir, 'app.js'),
  "require('./src/app.js');\n"
);

console.log('✅ Successfully created fallback dist/app.js redirect wrapper!');
