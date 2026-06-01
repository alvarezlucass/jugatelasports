import fs from 'fs';
import path from 'path';

const assetsDir = 'f:/PredictionGames/Predicciones/dist/assets';
const files = fs.readdirSync(assetsDir);
const jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));

if (!jsFile) {
  console.log('No index js file found.');
  process.exit(1);
}

const filePath = path.join(assetsDir, jsFile);
console.log('Reading file:', filePath);
const content = fs.readFileSync(filePath, 'utf-8');

const regex = /[^a-zA-Z0-9_$]stats\b/g;
let match;
console.log('Matches:');
while ((match = regex.exec(content)) !== null) {
  const index = match.index;
  const start = Math.max(0, index - 80);
  const end = Math.min(content.length, index + 80);
  console.log(`- Index ${index}: ...${content.substring(start, end).replace(/\n/g, ' ')}...`);
}
