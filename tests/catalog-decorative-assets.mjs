import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'public/garden.js'), 'utf8');

const catalogStart = source.indexOf('const catalog=[');
const catalogEnd = source.indexOf('];', catalogStart);
assert.ok(catalogStart >= 0 && catalogEnd > catalogStart, 'catalog source should be present');
const catalogSource = source.slice(catalogStart, catalogEnd);
const ids = [...catalogSource.matchAll(/\{id:'([^']+)'/g)].map(match => match[1]);
const visibleCount = (catalogSource.match(/\{id:'[^']+'[^}]*\}/g) ?? [])
  .filter(entry => !/hidden:true/.test(entry)).length;

for (const id of ['spellbook', 'fireflies']) {
  assert.equal(ids.filter(candidate => candidate === id).length, 1, `${id} should have one catalog entry`);
  assert.ok(fs.existsSync(path.join(root, `public/assets/${id}.png`)), `${id}.png should exist`);
  assert.match(catalogSource, new RegExp(`id:'${id}'[^}]*sheet:'${id}'`), `${id} should use its own source`);
}

assert.equal(ids.length, 201, 'raw catalog should contain 201 entries');
assert.equal(visibleCount, 200, 'visible catalog should contain 200 entries');

console.log('decorative catalog asset assertions passed');
