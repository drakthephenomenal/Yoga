var P={
 av:{name:"Anulom Vilom",alt:true,lv:[[4,0,4,0],[4,0,6,0],[4,0,8,0],[5,0,10,0],[6,0,12,0]]},
 ck:{name:"Kumbhak",alt:false,lv:[[4,2,4,2],[4,4,8,4],[4,8,8,4],[4,12,8,6],[4,16,8,8]]}
};
var S={mode:"av",lv:{av:0,ck:0},done:{},rounds:5,sound:true,auto:false};
try{var sv=JSON.parse(localStorage.getItem("pranayama")||"null");if(sv)S=Object.assign(S,sv)}catch(e){}
S.lv=Object.assign({av:0,ck:0},S.lv);if(!P[S.mode])S.mode="av";
function save(){try{localStorage.setItem("pranayama",JSON.stringify(S))}catch(e){}}
var $=function(i){return document.getElementById(i)},ac=null,run;
function g(a,b){return b?g(b,a%b):a}
function cur(){return P[S.mode].lv[S.lv[S.mode]]}
function phases(){return cur().map(function(d,t){return{t:t,d:d}}).filter(function(p){return p.d>0})}
function reset(){run={on:false,started:false,i:0,el:0,breath:0,last:0};$("go").textContent="Start"}
var G=null;
function geom(){
 var ph=phases(),all=tot_of(ph),tot=0,X0=14,W=332,HI=40,LO=160,pts=[[X0,LO]],start=[],lvl=LO;
 ph.forEach(function(p){start.push(tot);tot+=p.d;if(p.t==0)lvl=HI;else if(p.t==2)lvl=LO;pts.push([X0+W*tot/all,lvl])});
 G={ph:ph,tot:tot,pts:pts,start:start,X0:X0,W:W,HI:HI,LO:LO};
}
function tot_of(ph){return ph.reduce(function(a,p){return a+p.d},0)}
function buildGraph(){
 geom();
 var X0=G.X0,W=G.W,nm=["Inhale","Hold","Exhale","Hold"],
 d="M"+G.pts.map(function(p){return p[0]+","+p[1]}).join(" L"),
 area=d+" L"+(X0+W)+","+G.LO+" L"+X0+","+G.LO+" Z",
 s='<defs><clipPath id="cp"><rect id="cr" x="'+X0+'" y="0" width="0" height="210"/></clipPath></defs>'+
 '<line class="gl" x1="'+X0+'" x2="'+(X0+W)+'" y1="'+G.HI+'" y2="'+G.HI+'"/><line class="gl" x1="'+X0+'" x2="'+(X0+W)+'" y1="'+G.LO+'" y2="'+G.LO+'"/>';
 G.pts.forEach(function(p,i){if(i>0&&i<G.pts.length-1)s+='<line class="gl" x1="'+p[0]+'" x2="'+p[0]+'" y1="'+(G.HI-12)+'" y2="'+(G.LO+12)+'"/>'});
 s+='<path class="tgt" d="'+d+'"/><g clip-path="url(#cp)"><path class="fil" d="'+area+'"/><path class="lin" d="'+d+'"/></g><circle id="dot" class="dot" r="9" cx="'+X0+'" cy="'+G.LO+'"/>';
 G.ph.forEach(function(p,i){var x=(G.pts[i][0]+G.pts[i+1][0])/2;
  s+='<text x="'+x+'" y="190">'+nm[p.t]+'</text><text x="'+x+'" y="203">'+p.d+'s</text>'});
 $("gr").innerHTML=s;
}
function cursor(tt){
 var i=0;
 while(i<G.ph.length-1&&tt>=G.start[i]+G.ph[i].d)i++;
 var p=Math.min(1,Math.max(0,(tt-G.start[i])/G.ph[i].d)),a=G.pts[i],b=G.pts[i+1],
 x=a[0]+(b[0]-a[0])*p,y=a[1]+(b[1]-a[1])*p;
 $("cr").setAttribute("width",x-G.X0);
 $("dot").setAttribute("cx",x);$("dot").setAttribute("cy",y);
}
function ui(){
 $("modes").innerHTML=Object.keys(P).map(function(k){return '<button class="'+(k==S.mode?"on":"")+'" data-m="'+k+'">'+P[k].name+'</button>'}).join("");
 $("lvs").innerHTML=P[S.mode].lv.map(function(_,i){return '<button class="'+(i==S.lv[S.mode]?"on":"")+'" data-l="'+i+'">'+(i+1)+'</button>'}).join("");
 $("rds").innerHTML=[5,10,15].map(function(n){return '<button class="'+(n==S.rounds?"on":"")+'" data-r="'+n+'">'+n+'</button>'}).join("");
 var v=cur(),d=v.reduce(g),nm=["Inhale","Hold","Exhale","Hold empty"];
 $("ratio").textContent=v.map(function(x){return x/d}).filter(function(x){return x>0}).join(" : ");
 $("det").textContent=v.map(function(x,i){return x?nm[i]+" "+x+"s":""}).filter(Boolean).join(" · ");
 var n=Math.min(3,S.done[S.mode+S.lv[S.mode]]||0);
 $("dots").textContent="●".repeat(n)+"○".repeat(3-n);
 $("auto").checked=S.auto;$("snd").checked=S.sound;
 buildGraph();
}
function cue(t){
 try{navigator.vibrate&&navigator.vibrate(25)}catch(e){}
 if(!S.sound||!ac)return;
 try{var o=ac.createOscillator(),k=ac.createGain(),n=ac.currentTime;
  o.frequency.value=[528,660,396,330][t];
  k.gain.setValueAtTime(.0001,n);k.gain.exponentialRampToValueAtTime(.15,n+.03);k.gain.exponentialRampToValueAtTime(.0001,n+.5);
  o.connect(k);k.connect(ac.destination);o.start();o.stop(n+.55)}catch(e){}
}
function rounds(){return Math.floor(run.breath/(P[S.mode].alt?2:1))}
function finish(){
 var key=S.mode+S.lv[S.mode],max=P[S.mode].lv.length-1,m=$("msg");
 S.done[key]=(S.done[key]||0)+1;
 var txt="Session complete. Well done.";
 m.style.display="block";
 if(S.done[key]>=3&&S.lv[S.mode]<max){
  if(S.auto){S.lv[S.mode]++;txt+=" Moved up to level "+(S.lv[S.mode]+1)+".";m.textContent=txt}
  else{m.innerHTML=txt+' Ready for the next level? <button id="up">Level up</button>'}
 } else m.textContent=txt;
 save();reset();ui();
}
function tick(now){
 if(run.on){
  run.el+=(now-run.last)/1000;run.last=now;
  var ph=phases(),p=ph[run.i];
  while(run.el>=p.d){
   run.el-=p.d;run.i++;
   if(run.i>=ph.length){run.i=0;run.breath++;if(rounds()>=S.rounds){finish();draw();requestAnimationFrame(tick);return}}
   p=ph[run.i];cue(p.t);
  }
 }
 draw();requestAnimationFrame(tick);
}
function draw(){
 var L=$("nL"),R=$("nR");L.className=R.className="";
 L.parentNode.style.display=P[S.mode].alt?"":"none";
 if(!run.started){
  cursor(0);
  $("ph").textContent="Ready";$("cd").textContent="–";
  $("hint").textContent="Sit tall, relax your shoulders. Tap Start.";
  $("stat").textContent=S.rounds+" rounds · "+(P[S.mode].alt?"left ↔ right":"inhale · hold · exhale · hold");return;
 }
 var ph=G.ph[run.i],alt=P[S.mode].alt,left=run.breath%2==0,h;
 cursor(G.start[run.i]+run.el);
 $("ph").textContent=["Inhale","Hold","Exhale","Hold empty"][ph.t];
 $("cd").textContent=Math.max(1,Math.ceil(ph.d-run.el));
 if(alt){
  h=["Inhale through the "+(left?"left":"right")+" nostril","Close both nostrils · hold","Exhale through the "+(left?"right":"left")+" nostril","Hold empty · both closed"][ph.t];
  if(ph.t==0)(left?L:R).className="on";
  if(ph.t==2)(left?R:L).className="on";
 } else {
  h=["Inhale","Hold","Exhale","Hold empty"][ph.t];
  if(ph.t==0||ph.t==2)L.className=R.className="on";
 }
 $("hint").textContent=h;
 $("stat").textContent="Round "+Math.min(S.rounds,rounds()+1)+" of "+S.rounds;
}
document.addEventListener("click",function(e){
 var t=e.target;
 if(t.dataset.m){S.mode=t.dataset.m;reset();save();ui()}
 else if(t.dataset.l!==undefined){S.lv[S.mode]=+t.dataset.l;reset();$("msg").style.display="none";save();ui()}
 else if(t.dataset.r){S.rounds=+t.dataset.r;reset();save();ui()}
 else if(t.id=="up"){S.lv[S.mode]++;$("msg").style.display="none";reset();save();ui()}
});
$("go").onclick=function(){
 if(!run.started){
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume&&ac.resume()}catch(e){}
  $("msg").style.display="none";
  run.started=true;run.on=true;run.last=performance.now();cue(phases()[0].t);$("go").textContent="Pause";
 } else if(run.on){run.on=false;$("go").textContent="Resume"}
 else{run.on=true;run.last=performance.now();$("go").textContent="Pause"}
};
$("rs").onclick=function(){reset();draw()};
$("auto").onchange=function(){S.auto=this.checked;save()};
$("snd").onchange=function(){S.sound=this.checked;save()};
reset();ui();requestAnimationFrame(tick);

if("serviceWorker" in navigator){
 window.addEventListener("load",function(){
  navigator.serviceWorker.register("sw.js").catch(function(e){console.log("SW registration failed",e)});
 });
}
