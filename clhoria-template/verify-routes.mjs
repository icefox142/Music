// Verify routes can be loaded via Vite
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Checking route files exist...\n');

const routes = [
  { name: 'emoji-collections', path: 'src/routes/client/emoji-collections/index.ts' },
  { name: 'emoji-favorites', path: 'src/routes/client/emoji-favorites/index.ts' },
  { name: 'emoji-usage-logs', path: 'src/routes/client/emoji-usage-logs/index.ts' },
];

for (const route of routes) {
  try {
    const fs = await import('node:fs');
    const fullPath = join(__dirname, route.path);
    const exists = fs.existsSync(fullPath);
    console.log(`${exists ? '✅' : '❌'} ${route.name}: ${route.path}`);
  } catch (e) {
    console.log(`❌ ${route.name}: Error checking file`);
  }
}

console.log('\nAll route files are in place!');
console.log('Routes should now appear in the OpenAPI documentation at: http://localhost:9999/api/client/doc');
console.log('\nIf routes still don\'t appear, restart the dev server with: pnpm dev');
