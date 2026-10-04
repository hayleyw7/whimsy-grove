import { GIFEncoder, quantize, applyPalette } from './vendor/gifenc.esm.js';

export async function encodeGif(drawFrame,{signal,onProgress=()=>{},canvasFactory=()=>document.createElement('canvas')}={}){
  const width=400,height=360,frames=24,canvas=canvasFactory();canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d',{willReadFrequently:true}),gif=GIFEncoder(),abort=()=>{if(signal?.aborted)throw new DOMException('Cancelled','AbortError');};
  let palette;
  try{
    for(let frame=0;frame<frames;frame++){
      await new Promise(resolve=>setTimeout(resolve,0));abort();context.setTransform(width/1200,0,0,height/1080,0,0);drawFrame(context,frame/frames*3000);
      const rgba=context.getImageData(0,0,width,height).data;if(!palette)palette=quantize(rgba,256);const indexed=applyPalette(rgba,palette);
      gif.writeFrame(indexed,width,height,{palette:frame===0?palette:undefined,delay:120,repeat:0});
      if(gif.bytesView().byteLength>8*1024*1024)throw Error('This GIF is too large for a comfortable download. Try PNG instead.');onProgress((frame+1)/frames);
    }
    abort();gif.finish();return new Blob([gif.bytesView()],{type:'image/gif'});
  }finally{canvas.width=1;canvas.height=1;}
}
