import fs from 'fs';
import path from 'path';

const inventoryPath = path.resolve('docs/FEATURE_INVENTORY.md');

if (!fs.existsSync(inventoryPath)) {
  console.error('Error: docs/FEATURE_INVENTORY.md not found!');
  process.exit(1);
}

const content = fs.readFileSync(inventoryPath, 'utf8');
if (!content.includes('# Feature Inventory') || content.trim().length < 50) {
  console.error('Error: docs/FEATURE_INVENTORY.md appears incomplete or invalid.');
  process.exit(1);
}

console.log('Feature integrity check passed! docs/FEATURE_INVENTORY.md is in order.');
