const fs = require('fs');
const zlib = require('zlib');

const buffer = fs.readFileSync('build_log_raw.bin');

function processText(data) {
    const lines = data.split('\n');
    let errorFound = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('FAILURE:') || lines[i].includes('What went wrong:') || lines[i].includes('Exception') || lines[i].includes('Task :app:')) {
        console.log(`Line ${i}: ${lines[i]}`);
        errorFound = true;
      }
    }
    if (!errorFound) {
      console.log('No obvious error lines found. Printing last 50 lines:');
      console.log(lines.slice(-50).join('\n'));
    }
}

try {
  const decoded = zlib.unzipSync(buffer);
  processText(decoded.toString());
} catch (e) {
  processText(buffer.toString());
}
