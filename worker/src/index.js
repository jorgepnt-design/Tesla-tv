/**
 * Tesla TV secure-ish single-provider HTTP bridge.
 * Set IPTV_ORIGIN as a Cloudflare Worker secret, e.g. http://provider.example:8080
 * Never deploy as an unrestricted public proxy.
 */
const cors={
 'Access-Control-Allow-Origin':'https://jorgepnt-design.github.io',
 'Access-Control-Allow-Methods':'GET,HEAD,OPTIONS',
 'Access-Control-Allow-Headers':'Content-Type,Range',
 'Access-Control-Expose-Headers':'Content-Length,Content-Range,Accept-Ranges',
 'Vary':'Origin'
};
function respond(message,status=400){return new Response(message,{status,headers:{...cors,'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}})}
function relayUrl(url,base){return new URL('/proxy?url='+encodeURIComponent(url),base).href}
function rewritePlaylist(text,source,base,upstream){
 const baseURL=new URL(source);
 const fix=url=>{
  try{const u=new URL(url,baseURL);if(u.origin!==upstream.origin)return url;return relayUrl(u.href,base)}catch{return url}
 };
 return text.split(/\r?\n/).map(line=>{
  if(!line.trim())return line;
  if(line.startsWith('#'))return line.replace(/URI="([^"]+)"/gi,(_,uri)=>'URI="'+fix(uri)+'"');
  return fix(line.trim());
 }).join('\n');
}
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin');
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(origin && origin!=='https://jorgepnt-design.github.io')return respond('Origin forbidden',403);
  if(!['GET','HEAD'].includes(request.method))return respond('Method not allowed',405);
  const req=new URL(request.url);
  if(req.pathname==='/health')return respond('Tesla TV proxy ready',200);
  if(req.pathname!=='/proxy')return respond('Not found',404);
  if(!env.IPTV_ORIGIN)return respond('IPTV_ORIGIN secret is not configured',503);
  let allowed,target;
  try{
   allowed=new URL(env.IPTV_ORIGIN);
   if(!['http:','https:'].includes(allowed.protocol)||allowed.username||allowed.password||allowed.pathname!=='/')throw Error();
   target=new URL(req.searchParams.get('url'));
   if(target.origin!==allowed.origin||!['http:','https:'].includes(target.protocol)||target.username||target.password)throw Error();
  }catch{return respond('Invalid or unapproved upstream URL',403)}
  try{
   const headers=new Headers();
   const range=request.headers.get('Range');if(range)headers.set('Range',range);
   const upstream=await fetch(target.href,{method:request.method,headers,redirect:'manual'});
   if(upstream.status>=300&&upstream.status<400){
    const location=upstream.headers.get('Location');
    if(!location)return respond('Upstream redirect missing location',502);
    const next=new URL(location,target);
    if(next.origin!==allowed.origin)return respond('Upstream redirects to different origin',502);
    return Response.redirect(relayUrl(next.href,req.origin),302);
   }
   const mime=upstream.headers.get('Content-Type')||'';
   const isManifest=target.pathname.toLowerCase().endsWith('.m3u8')||target.pathname.toLowerCase().endsWith('.m3u')||(/mpegurl|audio\/x-mpegurl/i.test(mime))||target.pathname.endsWith('/get.php');
   const outHeaders=new Headers(cors);
   outHeaders.set('Cache-Control','no-store');
   if(isManifest){
     const text=await upstream.text();
     outHeaders.set('Content-Type','application/vnd.apple.mpegurl; charset=utf-8');
     return new Response(rewritePlaylist(text,target.href,req.origin,allowed),{status:upstream.status,headers:outHeaders});
   }
   for(const name of ['Content-Type','Content-Length','Content-Range','Accept-Ranges']){const val=upstream.headers.get(name);if(val)outHeaders.set(name,val)}
   return new Response(upstream.body,{status:upstream.status,headers:outHeaders});
  }catch{return respond('Could not reach IPTV upstream',502)}
 }
};
