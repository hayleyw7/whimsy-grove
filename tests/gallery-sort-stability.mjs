import fs from 'node:fs';import assert from 'node:assert/strict';
const source=fs.readFileSync('public/garden.js','utf8');
assert.ok(!source.includes("$('#albumSortButton').classList.add('is-loading')"));
assert.ok(source.includes("grid.setAttribute('aria-busy','true')"));
assert.ok(source.includes('if(kind!==collection)albumSort=albumHistorySorts[kind]'));
assert.ok(source.includes("collection==='album'||value!=='az'"));
assert.ok(source.includes('if(generation!==albumHistoryGeneration)return'));
console.log('PASS: stable gallery sort trigger, collection sort restoration, allowed options and stale-response guard retained');

assert(source.includes("$('#albumHistoryTitle').textContent='Groves';"));
assert(fs.readFileSync('public/index.html','utf8').includes('<h2 id="albumHistoryTitle">Groves</h2>'));
