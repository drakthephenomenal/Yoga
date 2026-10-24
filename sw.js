var CACHE="pranayama-v7";
var ASSETS=["./","index.html","style.css","app.js","manifest.json","icon-192.png","icon-512.png"];

self.addEventListener("install",function(e){
 e.waitUntil(
  caches.open(CACHE).then(function(c){
   return Promise.all(ASSETS.map(function(a){return c.add(new Request(a,{cache:"reload"}))}));
  }).then(function(){return self.skipWaiting()})
 );
});

self.addEventListener("activate",function(e){
 e.waitUntil(
  caches.keys().then(function(keys){
   return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()})
 );
});

/* network-first: always try fresh files, fall back to cache when offline */
self.addEventListener("fetch",function(e){
 if(e.request.method!=="GET")return;
 if(new URL(e.request.url).origin!==location.origin)return;
 e.respondWith(
  fetch(new Request(e.request.url,{cache:"no-cache"})).then(function(res){
   var copy=res.clone();
   caches.open(CACHE).then(function(c){c.put(e.request,copy)});
   return res;
  }).catch(function(){
   return caches.match(e.request).then(function(hit){return hit||caches.match("index.html")});
  })
 );
});
