import fs from 'node:fs';import assert from 'node:assert/strict';
const html=fs.readFileSync('public/index.html','utf8');
assert.doesNotMatch(html,/albumBackupTip|album-transfer-note|backup-tip\.js|Use the Import \/ Export menu to export/);
assert.doesNotMatch(fs.readFileSync('public/style.css','utf8'),/\.album-transfer-note/);
const menu=html.match(/id="albumOptionsMenu"[\s\S]*?<\/div>/)[0];
for(const [id,label] of [['importAlbum','Import Album'],['exportAlbum','Export Album']]){
 const button=menu.match(new RegExp('<button id="'+id+'"[^>]*>(.*?)</button>'))?.[1]||'';
 assert.match(button,/<svg[^>]*class="ui-icon album-transfer-icon"[^>]*aria-hidden="true"/);
 assert(button.endsWith('<span>'+label+'</span>'));
}
assert.equal((menu.match(/role="menuitem"/g)||[]).length,2);
assert.match(html,/<button id="albumOptions"[^>]*aria-label="Import \/ Export" title="Import \/ Export"[^>]*><svg class="ui-icon"[^>]*aria-hidden="true"/);
console.log('PASS: transfer note and its layout/hooks removed; accessible arrow menu retains both transfer actions.');
