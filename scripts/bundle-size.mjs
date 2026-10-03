// Prints raw and gzip size of every JS/CSS chunk emitted by `next build`, largest first.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = '.next/static';
const files = [];
const walk = (directory) => {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(js|css)$/.test(entry)) files.push(path);
  }
};
walk(root);

const rows = files
  .map((path) => {
    const content = readFileSync(path);
    return { path, raw: content.length, gzip: gzipSync(content).length };
  })
  .sort((first, second) => second.gzip - first.gzip);

const kilobytes = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
for (const row of rows.slice(0, 8)) console.log(kilobytes(row.gzip).padStart(10), kilobytes(row.raw).padStart(10), row.path);
console.log('TOTAL gzip', kilobytes(rows.reduce((total, row) => total + row.gzip, 0)));
