import fs from 'fs';
import https from 'https';
import path from 'path';

const query = `[out:json][timeout:120];
relation(421705);relation(421706);relation(2063304);
(._;>;);
out body;`;

const req = https.request('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.mkdirSync(path.join(process.cwd(), 'data', 'osm'), { recursive: true });
    fs.writeFileSync(path.join(process.cwd(), 'data', 'osm', 'raw.json'), data);
    console.log('done');
  });
});
req.write(query);
req.end();
