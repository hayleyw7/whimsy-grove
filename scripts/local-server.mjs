// Loopback-only development server. Production requires HTTPS and a registered origin.
import {createServer} from 'node:http';
import {randomBytes} from 'node:crypto';
import {readFile,realpath} from 'node:fs/promises';
import {createLocalStorage} from './local-storage.mjs';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {OAuth2Client} from 'google-auth-library';
import worker from '../worker/index.js';
import {welcomePage,publicPreviewPaths} from './welcome-page.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const origin='http://localhost:8000';
const clientId='137675300280-iev0a4d4t2trld0d93du2mth9t8380gk.apps.googleusercontent.com';
const auth=new OAuth2Client(clientId), sessions=new Map(), attempts=new Map();
const {DB,BUCKET}=await createLocalStorage(root,resolve(root,'.local-data'));
const token=()=>randomBytes(32).toString('base64url');
const cookie=(name,value,age)=>`${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}`;
const cookies=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim().split('=')));
const json=(body,status=200)=>Response.json(body,{status});
const redirect=path=>new Response(null,{status:302,headers:{location:path}});
async function body(req){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>1_000_000)throw Error('Request too large');chunks.push(chunk);}return Buffer.concat(chunks);}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
async function asset(request){
  let pathname;try{pathname=decodeURIComponent(new URL(request.url).pathname);}catch{return new Response('Bad path',{status:400});}
  const base=resolve(root,'public');const path=resolve(base,'.'+(pathname==='/'?'/index.html':pathname));
  if(!path.startsWith(base+sep))return new Response('Not found',{status:404});
  try{
    const actual=await realpath(path);if(!actual.startsWith(base+sep))return new Response('Not found',{status:404});
    let bytes=await readFile(actual);
    if(extname(path)==='.html')bytes=Buffer.from(bytes.toString().replaceAll('ChatGPT','Google').replace('</body>','<form method="post" action="/auth/logout" style="position:fixed;right:12px;bottom:12px;z-index:30"><button type="submit">Sign out of Google session</button></form></body>'));
    return new Response(bytes,{headers:{'content-type':types[extname(path)]||'application/octet-stream'}});
  }catch(error){if(['ENOENT','EISDIR'].includes(error.code))return new Response('Not found',{status:404});throw error;}
}
function loginPage(nonce){return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in · Whimsy Grove</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#171827;color:#faf7ff;font:18px system-ui}main{max-width:400px;padding:32px}h1{font-size:32px}p{line-height:1.5}#status{color:#ffd4c8}</style><main><h1>Whimsy Grove</h1><p>Sign in with Google to open your grove.</p><div id="g_id_onload" data-client_id="${clientId}" data-callback="finishGoogleSignIn" data-nonce="${nonce}" data-auto_prompt="false"></div><div class="g_id_signin" data-type="standard" data-size="large" data-theme="outline" data-text="signin_with"></div><p id="status" role="status"></p><p><small>Your creations in this local copy are saved on this Mac.</small></p></main><script>async function finishGoogleSignIn(result){const status=document.querySelector('#status');status.textContent='Signing in…';try{const response=await fetch('/auth/google',{method:'POST',headers:{'Content-Type':'application/json','X-Grove-Request':'1'},body:JSON.stringify({credential:result.credential,nonce:'${nonce}'})});if(!response.ok)throw Error();location.replace('/editor');}catch{status.textContent='Sign-in could not be verified. Refresh and try again.';}}</script><script src="https://accounts.google.com/gsi/client" async></script></html>`,{headers:{'content-type':'text/html; charset=utf-8'}});}
async function handle(req){
  if(req.headers.host!=='localhost:8000')return new Response('Open http://localhost:8000',{status:403});
  const url=new URL(req.url,origin), jar=cookies(req);
  if(!['GET','HEAD'].includes(req.method)&&req.headers.origin!==origin)return json({error:'Invalid origin'},403);
  const session=sessions.get(jar.grove_session);
  const user=session&&session.expires>Date.now()?session.user:null;
  if(url.pathname==='/auth/logout'&&req.method==='POST'){
    sessions.delete(jar.grove_session);const response=redirect('/');response.headers.set('set-cookie',cookie('grove_session','',0));return response;
  }
  if(url.pathname==='/signin-with-chatgpt')return redirect('/auth/google');
  if(url.pathname==='/auth/google'&&req.method==='GET'){
    if(user)return redirect('/editor');
    const id=token(),nonce=token();attempts.set(id,{nonce,expires:Date.now()+600_000});
    const response=loginPage(nonce);response.headers.set('set-cookie',cookie('grove_login',id,600));return response;
  }
  if(url.pathname==='/auth/google'&&req.method==='POST'){
    if(req.headers['x-grove-request']!=='1'||!req.headers['content-type']?.startsWith('application/json'))return json({error:'Invalid request'},403);
    const attempt=attempts.get(jar.grove_login),input=JSON.parse((await body(req)).toString());
    if(!attempt||attempt.expires<Date.now()||input.nonce!==attempt.nonce||typeof input.credential!=='string')return json({error:'Sign-in expired'},401);
    attempts.delete(jar.grove_login);
    try{
      const ticket=await auth.verifyIdToken({idToken:input.credential,audience:clientId});const payload=ticket.getPayload();
      if(!payload?.sub||payload.nonce!==attempt.nonce||!payload.exp||payload.exp*1000<=Date.now())throw Error('Invalid identity');
      sessions.delete(jar.grove_session);const id=token();sessions.set(id,{user:'google:'+payload.sub,expires:Date.now()+12*60*60*1000});
      const response=json({signedIn:true});response.headers.append('set-cookie',cookie('grove_session',id,43200));response.headers.append('set-cookie',cookie('grove_login','',0));return response;
    }catch{return json({error:'Sign-in could not be verified'},401);}
  }
  if(['GET','HEAD'].includes(req.method)){
    if(url.pathname==='/')return welcomePage(Boolean(user));
    if(publicPreviewPaths.has(url.pathname))return asset(new Request(url));
  }
  if(!user)return url.pathname.startsWith('/api/')?json({error:'Sign in with Google to continue'},401):redirect('/auth/google');
  if(!['GET','HEAD','POST','PUT','PATCH','DELETE'].includes(req.method))return new Response('Method not allowed',{status:405});
  // Never trust a caller's account headers: inject only the verified session identity.
  const headers=new Headers({'oai-authenticated-user-id':user});
  for(const name of ['content-type','origin','x-grove-request'])if(req.headers[name])headers.set(name,req.headers[name]);
  if(url.pathname==='/editor')url.pathname='/index.html';
  const request=new Request(url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:await body(req)});
  return worker.fetch(request,{DB,BUCKET,ASSETS:{fetch:asset}},{});
}
setInterval(()=>{for(const map of [sessions,attempts])for(const [key,value]of map)if(value.expires<=Date.now())map.delete(key);},60_000).unref();
createServer(async(req,res)=>{
  try{
    const response=await handle(req);
    response.headers.set('cache-control','private, no-store');response.headers.set('x-content-type-options','nosniff');response.headers.set('referrer-policy','strict-origin-when-cross-origin');response.headers.set('cross-origin-opener-policy','same-origin-allow-popups');
    const headers=Object.fromEntries(response.headers);const setCookie=response.headers.getSetCookie();if(setCookie.length)headers['set-cookie']=setCookie;
    res.writeHead(response.status,headers);res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(500,{'content-type':'text/plain','cache-control':'no-store'});res.end('The request could not be completed.');}
}).listen(8000,'127.0.0.1',()=>console.log('Whimsy Grove: http://localhost:8000 (Google sign-in required for editor)'));
