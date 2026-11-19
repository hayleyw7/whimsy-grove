import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('public/export-gif.js','utf8').replace(/^import .*;\n/,'').replace('export async function','async function');
for(const [durationMs,count] of [[3000,24],[6000,50],[9000,75],[12000,100],[36000,300]]){
 const frames=[],times=[],canvas={getContext:()=>({setTransform(){},getImageData:()=>({data:new Uint8Array(4)})})};
 const scope={Blob,DOMException,Uint8Array,setTimeout:fn=>fn(),GIFEncoder:()=>({writeFrame:(_i,_w,_h,opts)=>frames.push(opts),bytesView:()=>new Uint8Array(1),finish(){}}),quantize:()=>[],applyPalette:()=>[],canvasFactory:()=>canvas,drawFrame:(_ctx,time)=>times.push(time),durationMs};
 vm.createContext(scope);await vm.runInContext(source+';encodeGif(drawFrame,{durationMs,canvasFactory})',scope);
 assert.equal(frames.length,count);assert.equal(times[0],0);assert(times.at(-1)<durationMs);assert.equal(canvas.width,1);
 if(durationMs>=9000)assert.equal(frames.reduce((sum,f)=>sum+f.delay,0),durationMs,'Breeze export includes its full nine-second loop');
}
console.log('PASS: GIF encoder supports full Breeze9s and Wind6s loops while retaining standard3s output.');
