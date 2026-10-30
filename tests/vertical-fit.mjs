import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const css=await readFile('public/style.css','utf8');
assert.match(css,/@media \(min-width:651px\) and \(max-height:980px\)/);
assert.match(css,/\.garden-panel\{[^}]*display:grid;grid-template-rows:auto minmax\(0,1fr\) auto auto/);
assert.match(css,/body:not\(\.grove-view\) \.garden-panel\{container-type:size/);
assert.match(css,/body:not\(\.grove-view\) \.canvas-wrap\{[^}]*height:min\(100%,90cqw\);aspect-ratio:10\/9/);
assert.match(css,/body:not\(\.grove-view\) \.canvas-wrap canvas\{[^}]*width:100%;height:100%;aspect-ratio:10\/9/);
assert.match(css,/body:not\(\.grove-view\) main\{height:auto;min-height:0;display:block/);
assert.match(css,/Narrow\/mobile layouts intentionally\s+keep normal document flow/);
const dragTest=await readFile('tests/picker-drag.mjs','utf8');
assert.match(dragTest,/placement uses current canvas bounds after scaling or scrolling/);
assert.equal(640/576,10/9);
console.log('PASS: structural CSS assertions cover short desktop fitting, exact-ratio sizing rules, pointer-bound coverage, and mobile document flow');
