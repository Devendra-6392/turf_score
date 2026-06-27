const fs = require('fs');
const zlib = require('zlib');

const buffer = fs.readFileSync('build_log_raw.bin');
let text = '';
try {
  text = zlib.unzipSync(buffer).toString();
} catch (e) {
  text = buffer.toString();
}

const lines = text.split('\n');
fs.writeFileSync('error_tail.txt', lines.slice(-200).join('\n'));
