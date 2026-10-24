var P={
 av:{name:"Anulom Vilom",alt:true,lv:[[4,0,4,0],[4,0,6,0],[4,0,8,0],[5,0,10,0],[6,0,12,0]]},
 ck:{name:"Kumbhak",alt:false,lv:[[4,2,4,2],[4,4,8,4],[4,8,8,4],[4,12,8,6],[4,16,8,8]]}
};
var S={mode:"av",lv:{av:0,ck:0},done:{},rounds:5,sound:true,auto:false,right:false};
try{var sv=JSON.parse(localStorage.getItem("pranayama")||"null");if(sv)S=Object.assign(S,sv)}catch(e){}
S.lv=Object.assign({av:0,ck:0},S.lv);if(!P[S.mode])S.mode="av";
function save(){try{localStorage.setItem("pranayama",JSON.stringify(S))}catch(e){}}
var $=function(i){return document.getElementById(i)},ac=null,run,G=null,cv,cx,COL={};
function g(a,b){return b?g(b,a%b):a}
function cur(){return P[S.mode].lv[S.lv[S.mode]]}
function phases(){return cur().map(function(d,t){return{t:t,d:d}}).filter(function(p){return p.d>0})}
function isLeft(b){return (b%2==0)!==!!S.right}
function reset(){run={on:false,started:false,i:0,el:0,breath:0,last:0};$("go").textContent="Start"}
function geom(){
 var ph=phases(),tot=0,start=[];
 ph.forEach(function(p){start.push(tot);tot+=p.d});
 G={ph:ph,start:start,B:tot};
}
function colors(){
 var s=getComputedStyle(document.documentElement),v=function(n){return s.getPropertyValue(n).trim()};
 COL={L:v("--L"),R:v("--R"),acc:v("--acc"),mut:v("--mut"),bg:v("--card"),ink:v("--ink")};
}
function sizeCanvas(){
 var r=cv.getBoundingClientRect(),d=window.devicePixelRatio||1;
 cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);
 cx.setTransform(d,0,0,d,0,0);cv.cw=r.width;cv.ch=r.height;colors();
}
function ui(){
 var alt=P[S.mode].alt;
 $("modes").innerHTML=Object.keys(P).map(function(k){return '<button class="'+(k==S.mode?"on":"")+'" data-m="'+k+'">'+P[k].name+'</button>'}).join("");
 $("lvs").innerHTML=P[S.mode].lv.map(function(_,i){return '<button class="'+(i==S.lv[S.mode]?"on":"")+'" data-l="'+i+'">'+(i+1)+'</button>'}).join("");
 $("rds").innerHTML=[5,10,15].map(function(n){return '<button class="'+(n==S.rounds?"on":"")+'" data-r="'+n+'">'+n+'</button>'}).join("");
 var v=cur(),d=v.reduce(g),nm=["Inhale","Hold","Exhale","Hold empty"];
 $("ratio").textContent=v.map(function(x){return x/d}).filter(function(x){return x>0}).join(" : ");
 $("det").textContent=v.map(function(x,i){return x?nm[i]+" "+x+"s":""}).filter(Boolean).join(" · ");
 var n=Math.min(3,S.done[S.mode+S.lv[S.mode]]||0);
 $("dots").textContent="●".repeat(n)+"○".repeat(3-n);
 $("auto").checked=S.auto;$("snd").checked=S.sound;$("rt").checked=!!S.right;
 $("rt").parentNode.style.display=alt?"":"none";
 geom();
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
/* Continuous scrolling graph: up = inhale, flat = hold, down = exhale.
   Line colour = nostril in use. Faint = ahead, bright = done. */
function plot(T){
 var W=cv.cw,H=cv.ch,B=G.B,alt=P[S.mode].alt,n=S.rounds*(alt?2:1),Tend=n*B,
 win=Math.min(60,Math.max(14,B*2)),pps=W/win,px=W*0.3,HI=28,LO=H-42,
 T0=T-px/pps,T1=T+(W-px)/pps,b0=Math.max(0,Math.floor(T0/B)),b1=Math.min(n-1,Math.floor(T1/B)),segs=[],yNow=LO,cNow=COL.acc;
 for(var b=b0;b<=b1;b++)G.ph.forEach(function(p,i){
  var ts=b*B+G.start[i],te=ts+p.d;
  if(te<T0||ts>T1)return;
  var l=isLeft(b),
  c=!alt?COL.acc:p.t==0?(l?COL.L:COL.R):p.t==2?(l?COL.R:COL.L):COL.mut,
  lab=p.t==0?(alt?"In "+(l?"L":"R"):"Inhale"):p.t==2?(alt?"Out "+(l?"R":"L"):"Exhale"):"Hold";
  segs.push({ts:ts,te:te,d:p.d,y0:(p.t==0||p.t==3)?LO:HI,y1:(p.t==0||p.t==1)?HI:LO,c:c,lab:lab,x0:px+(ts-T)*pps,x1:px+(te-T)*pps});
 });
 plot.segs=segs;
 cx.clearRect(0,0,W,H);cx.lineCap="round";cx.lineJoin="round";
 cx.strokeStyle=COL.mut;cx.lineWidth=1;cx.globalAlpha=.3;cx.setLineDash([3,5]);
 [HI,LO].forEach(function(y){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke()});
 cx.setLineDash([]);cx.lineWidth=9;
 function seg(s){cx.beginPath();cx.moveTo(s.x0,s.y0);cx.lineTo(s.x1,s.y1);cx.strokeStyle=s.c;cx.stroke()}
 cx.globalAlpha=.28;segs.forEach(seg);
 cx.save();cx.beginPath();cx.rect(0,0,px,H);cx.clip();
 segs.forEach(function(s){
  cx.globalAlpha=.18;cx.fillStyle=s.c;cx.beginPath();cx.moveTo(s.x0,s.y0);cx.lineTo(s.x1,s.y1);cx.lineTo(s.x1,LO);cx.lineTo(s.x0,LO);cx.closePath();cx.fill();
  cx.globalAlpha=1;seg(s);
 });
 cx.restore();
 segs.forEach(function(s){
  if(T>=s.ts&&T<=s.te){yNow=s.y0+(s.y1-s.y0)*(T-s.ts)/(s.te-s.ts);cNow=s.c}
  if(s.x1-s.x0<28)return;
  var xm=(s.x0+s.x1)/2;
  cx.globalAlpha=s.x1<=px?1:.5;cx.fillStyle=s.c;cx.font="600 11px system-ui,sans-serif";cx.textAlign="center";
  cx.fillText(s.lab,xm,H-22);cx.font="10px system-ui,sans-serif";cx.fillText(s.d+"s",xm,H-9);
 });
 var xe=px+(Tend-T)*pps;
 if(xe>0&&xe<W){cx.globalAlpha=.5;cx.strokeStyle=COL.mut;cx.lineWidth=2;cx.beginPath();cx.moveTo(xe,HI-14);cx.lineTo(xe,LO+8);cx.stroke();cx.fillStyle=COL.mut;cx.font="10px system-ui,sans-serif";cx.textAlign="center";cx.fillText("end",xe,HI-18)}
 cx.globalAlpha=.5;cx.strokeStyle=COL.ink;cx.lineWidth=1;cx.setLineDash([2,4]);cx.beginPath();cx.moveTo(px,6);cx.lineTo(px,LO+10);cx.stroke();cx.setLineDash([]);
 cx.globalAlpha=1;cx.fillStyle=cNow;cx.strokeStyle=COL.bg;cx.lineWidth=3;cx.beginPath();cx.arc(px,yNow,9,0,6.2832);cx.fill();cx.stroke();
 cx.globalAlpha=1;
}
function setSeq(c){
 if(!P[S.mode].alt)return;
 var f=S.right?"R":"L",o=S.right?"L":"R",st=[[f,"in"],[o,"out"],[o,"in"],[f,"out"]],
 h=st.map(function(s,i){return '<span class="'+(i==c?"cur":"")+'">'+s[0]+" "+s[1]+'</span>'}).join(" → ");
 if(h!==setSeq.h){setSeq.h=h;$("seq").innerHTML=h}
}
function chips(){
 [[$("nL"),"Left"],[$("nR"),"Right"]].forEach(function(c){
  var cl=c[0].className;
  c[0].textContent=c[1]+(cl.indexOf(" in")>-1?" · IN":cl.indexOf(" out")>-1?" · OUT":"");
 });
}
function draw(){
 var L=$("nL"),R=$("nR"),alt=P[S.mode].alt;L.className=R.className="";
 L.parentNode.style.display=$("seq").style.display=alt?"":"none";
 if(!run.started){
  plot(0);setSeq(-1);chips();
  $("ph").textContent="Ready";$("cd").textContent="–";
  $("hint").textContent="Sit tall, relax your shoulders. Tap Start.";
  $("stat").textContent=S.rounds+" rounds · "+(alt?(S.right?"right":"left")+" nostril first":"inhale · hold · exhale · hold");return;
 }
 var ph=G.ph[run.i],left=isLeft(run.breath),h;
 plot(run.breath*G.B+G.start[run.i]+run.el);
 $("ph").textContent=["Inhale","Hold","Exhale","Hold empty"][ph.t];
 $("cd").textContent=Math.max(1,Math.ceil(ph.d-run.el));
 if(alt){
  h=["Inhale through the "+(left?"left":"right")+" nostril","Close both nostrils · hold","Exhale through the "+(left?"right":"left")+" nostril","Hold empty · both closed"][ph.t];
  if(ph.t==0)(left?L:R).className="on in";
  if(ph.t==2)(left?R:L).className="on out";
 } else {
  h=["Inhale","Hold","Exhale","Hold empty"][ph.t];
 }
 $("hint").textContent=h;
 chips();setSeq((run.breath%2)*2+(ph.t==2?1:0));
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
$("rt").onchange=function(){S.right=this.checked;reset();save();ui()};
cv=$("gr");cx=cv.getContext("2d");sizeCanvas();
window.addEventListener("resize",sizeCanvas);
try{matchMedia("(prefers-color-scheme: dark)").addEventListener("change",colors)}catch(e){}
reset();ui();requestAnimationFrame(tick);

if("serviceWorker" in navigator){
 window.addEventListener("load",function(){
  navigator.serviceWorker.register("sw.js").catch(function(e){console.log("SW registration failed",e)});
 });
}
