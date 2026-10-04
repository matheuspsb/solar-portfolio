import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const directory = '.next/static/chunks';
const totals = new Map();
for (const file of readdirSync(directory).filter((name) => name.endsWith('.js.map'))) {
  const map = JSON.parse(readFileSync(join(directory, file), 'utf8'));
  map.sources.forEach((source, index) => {
    const content = map.sourcesContent?.[index] ?? '';
    const match = source.match(
      /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/,
    );
    const owner = match ? match[1] : 'app code';
    totals.set(owner, (totals.get(owner) ?? 0) + content.length);
  });
}
const rows = [...totals.entries()].sort((first, second) => second[1] - first[1]).slice(0, 14);
for (const [owner, bytes] of rows)
  console.log(`${(bytes / 1024).toFixed(0).padStart(6)} KB source  ${owner}`);
