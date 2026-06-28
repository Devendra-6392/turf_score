const https = require('https');
const zlib = require('zlib');

const url = "https://storage.googleapis.com/eas-workflows-production/logs/977cef8f-c2b8-432a-a0b5-8d22b352e0b5/740d3457-e92e-41c1-8b25-f609ec88b16e/2026-06-25T01%3A49%3A24Z-94a1ef19-80d5-4323-b515-a959f0b0ce9b.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260626%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260626T010758Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=51a7ef32b88e9c6afb18d95982ce88b71bed50cb22838d074452b5c44b12639c8c65dcd91fe8f9a5fee3d58636c811c0b14788833c03db0abcf4e5991b0c1c2d6c35d6d6b4028d0e0bb03b13954a5c25f94c094a3a6b3b7985041955b3d8c5989a7368d59f68e8649ea252565df444898511dcd3f11f1a0dc052233010b6015a2bbd9f60260183ac7347e267c06aea68bb05a39c82d24d79846ee16dab8b3744acdde4d1b4b75e093c63d2d0b11071af7959c97eb340375714a1cb73ecc9a4f201a6e9fdd60f0aa7f0547235a7433b0ce8c2b6d208356725243c76a15f7a7581312e0dfba7e0c367ed14e069e356e527e8ccd689214b4e0c557438579803f180";

https.get(url, (res) => {
  let chunks = [];
  res.on('data', (chunk) => { chunks.push(chunk); });
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    zlib.unzip(buffer, (err, decoded) => {
      if (err) {
        const text = buffer.toString();
        processText(text);
        return;
      }
      processText(decoded.toString());
    });
  });
}).on('error', (err) => {
  console.log('Error fetching log:', err.message);
});

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
