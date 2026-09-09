const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const canvas=$('#game'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const W=640,H=360,TW=34,TH=17,YH=17,OX=322,OY=64;
const SKIN=['#f5c8a6','#d99a72','#bd7853','#89533a','#573126'];
const HAIR=['#2d241f','#53382a','#865431','#c2874e','#9c4b37','#d2b16b'];
const EYE=['#3f3027','#526447','#66777c','#375d78','#725845'];
const CLOTH=['#66865e','#a7644e','#3f4a55','#e2c897','#7a6178','#b5834e'];
const state={mode:'menu',appearance:{name:'Valentina',gender:'fem',skin:1,hair:0,eye:0,hairStyle:0,body:100,height:100,outfit:0,trait:'Sociable',aspiration:'Vida equilibrada'},needs:{energy:78,hunger:72,hygiene:82,fun:70,bladder:75},minutes:14*60+40,tv:false,player:{x:6.4,z:6.5,target:null,action:null,pose:'idle'},speed:1};
const keys=new Set();let hitZones=[],last=performance.now(),toastTimer=0;

function save(){try{localStorage.setItem('sims-tan-pixel',JSON.stringify(state))}catch{}}
function load(){try{const s=JSON.parse(localStorage.getItem('sims-tan-pixel')||'null');if(s){Object.assign(state,s);state.player=Object.assign({x:6.4,z:6.5,target:null,action:null,pose:'idle'},s.player||{});state.player.target=null;state.player.action=null;state.player.pose='idle'}}catch{}}
load();

function poly(points,fill,stroke='#49382e'){ctx.beginPath();ctx.moveTo(points[0].x|0,points[0].y|0);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x|0,points[i].y|0);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function iso(x,z,y=0){return{x:OX+(x-z)*TW/2,y:OY+(x+z)*TH/2-y*YH}}
function box3(x,z,w,d,h,top='#c99462',left='#9b6746',right='#7e513d',stroke='#49382e'){
 const a=iso(x,z,h),b=iso(x+w,z,h),c=iso(x+w,z+d,h),d0=iso(x,z+d,h),A=iso(x,z,0),B=iso(x+w,z,0),C=iso(x+w,z+d,0),D=iso(x,z+d,0);
 poly([d0,c,C,D],left,stroke);poly([b,c,C,B],right,stroke);poly([a,b,c,d0],top,stroke);
}
function pixelRect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x|0,y|0,w|0,h|0)}
function line(x1,y1,x2,y2,c){ctx.strokeStyle=c;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x1|0,y1|0);ctx.lineTo(x2|0,y2|0);ctx.stroke()}
function bounds(x,z,w,d,h=2){const pts=[];for(const xx of[x,x+w])for(const zz of[z,z+d])for(const yy of[0,h])pts.push(iso(xx,zz,yy));return{x:Math.min(...pts.map(p=>p.x))-5,y:Math.min(...pts.map(p=>p.y))-8,w:Math.max(...pts.map(p=>p.x))-Math.min(...pts.map(p=>p.x))+10,h:Math.max(...pts.map(p=>p.y))-Math.min(...pts.map(p=>p.y))+15}}

function bush(x,y,s=1){const dark='#335b3d',mid='#4f7d45',light='#72a653';for(const [dx,dy,c] of[[-8,1,dark],[-3,-5,mid],[3,-6,mid],[8,0,dark],[-4,3,light],[4,3,light],[0,-1,mid]])pixelRect(x+dx*s,y+dy*s,8*s,7*s,c)}
function flower(x,y,c){pixelRect(x,y,2,2,'#45653f');pixelRect(x-2,y-2,2,2,c);pixelRect(x+2,y-2,2,2,c);pixelRect(x,y-4,2,2,'#f0d58c')}
function drawCottage(){
 ctx.fillStyle='#91ad80';ctx.fillRect(0,0,W,H);pixelRect(0,265,W,95,'#6f8f62');
 for(let i=0;i<80;i++){const x=(i*83)%640,y=40+((i*47)%245);pixelRect(x,y,2,2,i%3?'#88a775':'#b7c78e')}
 // distant trees
 for(let x=18;x<640;x+=44){pixelRect(x,78,14,96,'#5d6849');bush(x+6,75,1.5);bush(x,100,1.2)}
 // earthen cottage base
 pixelRect(238,165,270,117,'#7b5138');pixelRect(226,176,294,10,'#4c3529');
 // green roof mound
 ctx.fillStyle='#426b43';ctx.beginPath();ctx.ellipse(370,170,173,78,0,Math.PI,Math.PI*2);ctx.fill();
 ctx.fillStyle='#639348';ctx.beginPath();ctx.ellipse(370,168,164,68,0,Math.PI,Math.PI*2);ctx.fill();
 for(let x=235;x<505;x+=13){pixelRect(x,139+((x*7)%24),7,5,'#7eac55');if(x%26===1)flower(x,136+((x*5)%22),x%52?'#e08c76':'#e8cf68')}
 // chimney
 pixelRect(452,88,34,81,'#554337');pixelRect(448,86,42,9,'#3f322b');pixelRect(458,99,5,6,'#80644d');pixelRect(476,113,5,6,'#80644d');
 pixelRect(467,73,11,7,'#d9d0b7');pixelRect(480,62,9,7,'#d9d0b7');
 // round door
 pixelRect(339,194,65,78,'#4f3529');ctx.fillStyle='#9a603b';ctx.beginPath();ctx.arc(371,213,31,Math.PI,0);ctx.lineTo(402,262);ctx.lineTo(340,262);ctx.closePath();ctx.fill();ctx.strokeStyle='#402b24';ctx.stroke();
 pixelRect(395,229,5,5,'#d1a453');line(371,185,371,263,'#54372a');
 // windows
 for(const x of[263,439]){pixelRect(x,207,46,37,'#47342a');pixelRect(x+4,211,38,29,'#91b8a4');line(x+23,211,x+23,240,'#5a4234');line(x+4,225,x+42,225,'#5a4234')}
 // path
 for(let i=0;i<9;i++){pixelRect(350+i*6,276+i*8,45-i*2,6,'#b8a077')}
 // garden
 for(const [x,y] of[[210,260],[224,279],[502,268],[527,280],[190,296],[540,302]]){bush(x,y,1.25);flower(x+5,y-7,'#e68b80');flower(x-5,y-4,'#e4cb6a')}
 pixelRect(0,330,W,30,'#6a855c');
}

function drawCreatorBackdrop(){drawCottage();ctx.fillStyle='rgba(64,77,58,.28)';ctx.fillRect(0,0,W,H);pixelRect(175,47,226,283,'#b9c899');pixelRect(181,53,214,271,'#8ca579');for(let y=58;y<320;y+=12)for(let x=188;x<390;x+=12)if((x+y)%24===0)pixelRect(x,y,3,3,'#9bb283')}
function avatar(cx,cy,scale=1,walk=0,pose='idle'){
 const a=state.appearance,skin=SKIN[a.skin],hair=HAIR[a.hair],cloth=CLOTH[a.outfit];const s=scale,body=a.body/100,height=a.height/100;
 ctx.save();ctx.translate(cx|0,cy|0);ctx.scale(s*body,s*height);
 if(pose==='sleep'){ctx.rotate(-Math.PI/2);ctx.translate(-8,-2)}
 // shadow is drawn outside creator only by caller
 const leg=walk?Math.round(Math.sin(walk)*2):0;
 pixelRect(-8,-2+leg,6,16,'#4e4a45');pixelRect(2,-2-leg,6,16,'#4e4a45');pixelRect(-9,13+leg,8,4,'#302d2a');pixelRect(1,13-leg,8,4,'#302d2a');
 pixelRect(-10,-25,20,25,cloth);pixelRect(-13,-22,4,18,skin);pixelRect(9,-22,4,18,skin);
 pixelRect(-9,-39,18,16,skin);pixelRect(-10,-41,20,7,hair);
 if(a.hairStyle===0){pixelRect(-11,-36,4,17,hair);pixelRect(7,-36,4,17,hair)}
 if(a.hairStyle===1){pixelRect(-6,-47,12,7,hair);pixelRect(-3,-50,6,5,hair)}
 if(a.hairStyle===3){pixelRect(-12,-39,5,7,hair);pixelRect(7,-39,5,7,hair);pixelRect(-12,-31,4,7,hair);pixelRect(8,-31,4,7,hair)}
 pixelRect(-5,-33,2,2,EYE[a.eye]);pixelRect(3,-33,2,2,EYE[a.eye]);pixelRect(-1,-27,3,1,'#a56058');
 if(a.gender==='fem')pixelRect(-9,-24,18,3,'#d8b07d');
 ctx.restore();
}
function drawCreator(){drawCreatorBackdrop();pixelRect(242,305,120,7,'rgba(61,56,43,.25)');avatar(302,287,3.1,0,'idle');ctx.fillStyle='#f4e3b8';ctx.font='9px monospace';ctx.fillText('VISTA DEL PERSONAJE',255,326)}

function tile(x,z,c1='#c79a61',c2='#ad7c4e'){const p1=iso(x,z),p2=iso(x+1,z),p3=iso(x+1,z+1),p4=iso(x,z+1);poly([p1,p2,p3,p4],(x+z)%2?c1:c2,'#80583e');const a=iso(x+.12,z+.18),b=iso(x+.88,z+.18);line(a.x,a.y,b.x,b.y,'rgba(95,60,39,.3)')}
function drawFloor(){for(let z=0;z<10;z++)for(let x=0;x<14;x++){if(x>=10&&z<5)tile(x,z,'#b5b39e','#aaa993');else tile(x,z)}}
function wallPanel(x,w,y,h){const a=iso(x,0,y),b=iso(x+w,0,y),c=iso(x+w,0,y+h),d=iso(x,0,y+h);poly([a,b,c,d],'#33404a','#49382e');for(let i=0;i<7;i++){const xx=a.x+8+i*10,base=a.y-2;pixelRect(xx,base-10-(i%3)*5,6,18+(i%3)*5,'#44545d');pixelRect(xx+2,base-6,2,3,'#e6bd73')}pixelRect((a.x+b.x)/2-2,c.y+1,4,h*YH-2,'#6e533f')}
function drawWalls(){
 for(let x=0;x<14;x+=2)box3(x,-.18,2,.18,3.8,'#d5c7a5','#b5a47f','#aa9875','#6f5943');
 for(let z=0;z<10;z+=2)box3(-.18,z,.18,2,3.8,'#d5c7a5','#b5a47f','#aa9875','#6f5943');
 wallPanel(2.2,5.2,.85,2.25);
 // bathroom partition
 box3(9.65,0,.16,5.05,3.1,'#c9bea6','#a99b82','#9d8d76','#6d5b49');
 box3(9.65,4.95,4.35,.16,3.1,'#c9bea6','#a99b82','#9d8d76','#6d5b49');
}
function plantAt(x,z,s=1){const p=iso(x,z,.2);pixelRect(p.x-6*s,p.y-5*s,12*s,9*s,'#86563d');for(const [dx,dy,c] of[[-7,-12,'#37663e'],[-2,-18,'#4d8049'],[5,-14,'#3d7043'],[-8,-22,'#5a8d4e'],[3,-24,'#6a9e58']])pixelRect(p.x+dx*s,p.y+dy*s,8*s,8*s,c)}
function bed(){box3(1.0,1.0,4.4,2.5,.55,'#7b5039','#5e3d31','#4e322b');box3(1.13,1.1,4.14,2.27,.82,'#e2d4b4','#c7b894','#ad9e80');box3(1.2,1.6,4.0,1.7,1.0,'#a75849','#8e493f','#794138');box3(1.22,1.12,1.4,.7,1.08,'#f0e0bd','#d0c19e','#b5a784');box3(3.65,1.12,1.4,.7,1.08,'#f0e0bd','#d0c19e','#b5a784');box3(.9,.9,4.6,.2,2.25,'#80513a','#633d31','#563228');}
function sofa(){box3(5.9,6.2,3.4,1.25,.6,'#9a6546','#7d4f3b','#6b4334');box3(6.0,6.75,3.2,.45,1.35,'#b97750','#945a43','#7d4a39');box3(5.82,6.05,.4,1.45,1.0,'#bd7d55','#945b43','#794a38');box3(9.0,6.05,.4,1.45,1.0,'#bd7d55','#945b43','#794a38');box3(6.25,6.25,1.25,.75,.72,'#e19661','#b87352','#9d5b46');box3(7.62,6.25,1.25,.75,.72,'#e19661','#b87352','#9d5b46')}
function coffee(){box3(6.55,4.9,2.3,1,.55,'#b47b45','#8d5938','#73452f');box3(6.7,5.05,.12,.12,.15,'#4c3a31','#433229','#382921');box3(8.55,5.05,.12,.12,.15,'#4c3a31','#433229','#382921')}
function tv(){box3(7.9,.55,3.35,.65,.55,'#76533a','#60412f','#513629');box3(8.15,.72,2.85,.18,2.15,'#2c3031','#232627','#1b1e1f');const p=iso(8.35,.8,1.95);pixelRect(p.x-20,p.y-17,48,29,state.tv?'#5a8893':'#1c2325');if(state.tv){pixelRect(p.x-15,p.y-12,12,8,'#e4b16f');pixelRect(p.x+2,p.y-9,19,5,'#8fc1a5');pixelRect(p.x-13,p.y+2,35,4,'#7390a1')}}
function rug(){const a=iso(5.3,4.4,.02),b=iso(9.8,4.4,.02),c=iso(9.8,7.8,.02),d=iso(5.3,7.8,.02);poly([a,b,c,d],'#6f8f80','#4d6c62');for(let i=0;i<5;i++){const p=iso(5.8+i*.8,5.3+i*.05,.03);pixelRect(p.x,p.y,6,2,'#90ab94')}}
function bathroom(){
 // shower base and glass
 box3(11.2,.65,2.1,2.05,.18,'#d5d0b8','#aaa895','#94927f');const g1=iso(11.25,.7,.2),g2=iso(13.2,.7,.2),g3=iso(13.2,.7,2.65),g4=iso(11.25,.7,2.65);poly([g1,g2,g3,g4],'rgba(143,185,185,.38)','#6e8b85');for(let i=0;i<4;i++){const p=iso(11.5+i*.45,.75,1.7);pixelRect(p.x,p.y,2,2,'#e9f0d6')}
 // toilet
 box3(10.25,3.25,.9,.95,.45,'#e1dac0','#c3bba3','#aaa18a');box3(10.25,3.85,.9,.35,1.15,'#e7dec4','#cbbfa8','#b4a891');const q=iso(10.7,3.55,.72);pixelRect(q.x-7,q.y-3,14,6,'#f2ead1');pixelRect(q.x-4,q.y-2,8,3,'#9b9e91');
 // sink / mirror
 box3(12.1,3.45,1.2,.7,.78,'#e0d5b9','#bbb098','#a19884');const m=iso(12.18,3.45,2.4);pixelRect(m.x-5,m.y-24,27,31,'#79a1a0');pixelRect(m.x-3,m.y-22,23,27,'#b7cfbf');
}
function decor(){plantAt(.7,7.9,1);plantAt(10.9,7.9,1);plantAt(5.0,1.0,.8);const p=iso(2.0,7.6,.1);box3(1.6,7.2,1.3,.7,.8,'#9d7047','#7c543a','#674331');pixelRect(p.x,p.y-12,2,8,'#6f774d');flower(p.x-3,p.y-18,'#d57467');flower(p.x+4,p.y-16,'#e4c65b')}

const objects={
 bed:{label:'CAMA',desc:'Cama cálida con mantas gruesas.',rect:[1,1,4.4,2.5],approach:{x:3.7,z:4.0},actions:[['Dormir','sleep'],['Sentarse','sitbed']]},
 tv:{label:'TELEVISOR',desc:'Televisor frente al sofá.',rect:[7.9,.55,3.35,.65],approach:{x:7.7,z:4.8},actions:[['Ver televisión','watch'],['Encender / apagar','toggleTv']]},
 sofa:{label:'SOFÁ',desc:'Sofá de tres plazas.',rect:[5.8,6.05,3.6,1.45],approach:{x:7.6,z:5.4},actions:[['Sentarse','sit'],['Relajarse','relax']]},
 shower:{label:'DUCHA',desc:'Ducha de vidrio con agua caliente.',rect:[11.15,.6,2.2,2.15],approach:{x:11.0,z:2.8},actions:[['Ducharse','shower']]},
 toilet:{label:'INODORO',desc:'Baño privado.',rect:[10.15,3.2,1.1,1.1],approach:{x:11.3,z:4.1},actions:[['Usar','toilet']]},
 sink:{label:'LAVAMANOS',desc:'Lavamanos con espejo.',rect:[12.0,3.35,1.3,.85],approach:{x:11.7,z:4.4},actions:[['Lavarse','wash']]}
};
const collisionRects=[[1,1,4.4,2.5,'bed'],[7.9,.55,3.35,.65,'tv'],[5.8,6.05,3.6,1.45,'sofa'],[6.5,4.85,2.5,1.2,'coffee'],[11.15,.6,2.2,2.15,'shower'],[10.15,3.2,1.1,1.1,'toilet'],[12,3.35,1.3,.85,'sink'],[9.55,0,.35,5.05,'wall']];
function blocked(x,z,ignore=''){if(x<.35||x>13.55||z<.35||z>9.55)return true;for(const [rx,rz,rw,rd,id] of collisionRects){if(id===ignore)continue;if(x>rx-.18&&x<rx+rw+.18&&z>rz-.18&&z<rz+rd+.18)return true}return false}

function drawGame(){
 ctx.fillStyle='#91ad9a';ctx.fillRect(0,0,W,H);for(let i=0;i<40;i++)pixelRect((i*59)%640,20+((i*37)%300),2,2,'#a9bca7');drawFloor();rug();drawWalls();
 hitZones=[];
 const items=[
  {depth:2,fn:bed,id:'bed'},{depth:1,fn:tv,id:'tv'},{depth:5,fn:bathroom,id:null},{depth:7.5,fn:coffee,id:null},{depth:9.2,fn:sofa,id:'sofa'},{depth:8,fn:decor,id:null}
 ];
 // bathroom hit zones after combined drawing
 items.sort((a,b)=>a.depth-b.depth);for(const it of items){it.fn();if(it.id){const o=objects[it.id],r=bounds(...o.rect,2.5);hitZones.push({id:it.id,...r})}}
 for(const id of['shower','toilet','sink']){const o=objects[id],r=bounds(...o.rect,2.7);hitZones.push({id,...r})}
 const p=state.player,sp=iso(p.x,p.z,.02);ctx.fillStyle='rgba(47,42,35,.25)';ctx.fillRect(sp.x-10,sp.y-3,20,5);
 if(p.pose!=='shower')avatar(sp.x,sp.y,1.0,p.target?performance.now()/90:0,p.pose==='sleep'?'sleep':'idle');
 // plumbob
 if(p.pose!=='shower'&&p.pose!=='sleep'){const y=sp.y-58;poly([{x:sp.x,y:y-8},{x:sp.x+6,y},{x:sp.x,y:y+9},{x:sp.x-6,y}],'#6fc34e','#355b32')}
 if(p.action?.active){if(p.action.type==='sleep'){const bp=iso(3.0,2.25,1.25);ctx.fillStyle='#f2e4bd';ctx.font='bold 10px monospace';ctx.fillText('Z',bp.x+10,bp.y-28);ctx.fillText('z',bp.x+18,bp.y-37)}if(p.action.type==='shower'){const q=iso(12.1,1.55,1.1);for(let i=0;i<5;i++){ctx.strokeStyle='#d9ecda';ctx.beginPath();ctx.arc(q.x+(i-2)*5,q.y-20-(i%2)*7,3,0,Math.PI*2);ctx.stroke()}}}
}

function portrait(){const c=document.createElement('canvas');c.width=c.height=46;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#9eb784';x.fillRect(0,0,46,46);const old=ctx; // draw manually for stable portrait
 x.fillStyle=HAIR[state.appearance.hair];x.fillRect(12,6,22,10);x.fillStyle=SKIN[state.appearance.skin];x.fillRect(14,12,18,18);x.fillStyle=EYE[state.appearance.eye];x.fillRect(18,19,2,2);x.fillRect(26,19,2,2);x.fillStyle=CLOTH[state.appearance.outfit];x.fillRect(10,30,26,16);$('#portrait').style.backgroundImage=`url(${c.toDataURL()})`;$('#portrait').style.backgroundSize='100% 100%'}
function hud(){const n=state.needs;for(const k of Object.keys(n)){const e=$('#'+k+'Bar');if(e)e.style.width=Math.max(0,Math.min(100,n[k]))+'%'}$('#hudName').textContent=state.appearance.name;$('#houseName').textContent=state.appearance.name.toUpperCase();const day=Math.floor(state.minutes/1440)%7,m=Math.floor(state.minutes%1440);$('#clockText').textContent=`${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'][day]} · ${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;portrait()}
function notify(t){$('#toast').textContent=t;$('#toast').classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('on'),1500)}
function setMode(m){state.mode=m;for(const id of['menu','creator','multi'])$('#'+id).classList.toggle('hidden',m!==id);$('#hud').classList.toggle('hidden',m!=='game');if(m==='game')hud();save()}

function draw(){if(state.mode==='game')drawGame();else if(state.mode==='creator')drawCreator();else drawCottage()}
function update(dt){
 if(state.mode==='game'){
  const p=state.player;let dx=0,dz=0;if(keys.has('w')||keys.has('arrowup'))dz-=1;if(keys.has('s')||keys.has('arrowdown'))dz+=1;if(keys.has('a')||keys.has('arrowleft'))dx-=1;if(keys.has('d')||keys.has('arrowright'))dx+=1;
  if((dx||dz)&&!p.action?.active){const l=Math.hypot(dx,dz),nx=p.x+dx/l*dt*2.2,nz=p.z+dz/l*dt*2.2;if(!blocked(nx,nz)){p.x=nx;p.z=nz;p.target=null}}
  if(p.target&&!p.action?.active){const vx=p.target.x-p.x,vz=p.target.z-p.z,d=Math.hypot(vx,vz);if(d<.06){p.x=p.target.x;p.z=p.target.z;p.target=null;if(p.action?.pending)startAction(p.action.type,p.action.id)}else{const q=Math.min(d,dt*2.25),nx=p.x+vx/d*q,nz=p.z+vz/d*q;if(!blocked(nx,nz,p.action?.id||'')){p.x=nx;p.z=nz}else{p.target=null;p.action=null;notify('No hay camino libre')}}}
  if(p.action?.active){p.action.time-=dt;if(p.action.time<=0)finishAction()}
  state.minutes+=dt*.65*state.speed;state.needs.hunger=Math.max(0,state.needs.hunger-dt*.025);state.needs.energy=Math.max(0,state.needs.energy-dt*.018);state.needs.hygiene=Math.max(0,state.needs.hygiene-dt*.012);state.needs.bladder=Math.max(0,state.needs.bladder-dt*.022);state.needs.fun=Math.max(0,state.needs.fun-dt*.01);hud();
 }
}
function loop(t){const dt=Math.min(.04,(t-last)/1000);last=t;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);

function showContext(id){const o=objects[id];if(!o)return;$('#contextTitle').textContent=o.label;$('#contextDesc').textContent=o.desc;const h=$('#contextActions');h.innerHTML='';for(const [label,type] of o.actions){const b=document.createElement('button');b.textContent=label;b.onclick=()=>queue(id,type);h.appendChild(b)}$('#context').classList.remove('hidden')}
function queue(id,type){const o=objects[id];$('#context').classList.add('hidden');if(type==='toggleTv'){state.tv=!state.tv;notify(state.tv?'Televisor encendido':'Televisor apagado');save();return}state.player.target={...o.approach};state.player.action={id,type,pending:true,active:false};$('#activity').textContent=`Yendo a ${o.label.toLowerCase()}`}
function startAction(type,id){const p=state.player;p.action={id,type,active:true,pending:false,time:{sleep:5,watch:4,sit:3,relax:4,sitbed:3,shower:4,toilet:3,wash:2}[type]||2};p.pose=type==='shower'?'shower':type==='sleep'?'sleep':'idle';const texts={sleep:'Durmiendo',watch:'Viendo televisión',sit:'Sentada',relax:'Relajándose',sitbed:'Descansando',shower:'Duchándose',toilet:'Usando el baño',wash:'Lavándose'};$('#activity').textContent=texts[type]||'Interactuando';if(type==='watch')state.tv=true;notify($('#activity').textContent)}
function finishAction(){const a=state.player.action;if(!a)return;const n=state.needs,chg={sleep:{energy:48},watch:{fun:30},sit:{energy:8},relax:{energy:14,fun:10},sitbed:{energy:12},shower:{hygiene:50},toilet:{bladder:55},wash:{hygiene:18}}[a.type]||{};for(const[k,v]of Object.entries(chg))n[k]=Math.min(100,n[k]+v);state.player.action=null;state.player.pose='idle';$('#activity').textContent='En casa';notify('Acción completada');save()}

function canvasPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
function inverseIso(sx,sy){const dx=(sx-OX)/(TW/2),dy=(sy-OY)/(TH/2);return{x:(dx+dy)/2,z:(dy-dx)/2}}
canvas.addEventListener('pointerup',e=>{if(state.mode!=='game')return;const p=canvasPoint(e);for(let i=hitZones.length-1;i>=0;i--){const r=hitZones[i];if(p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h){showContext(r.id);return}}const w=inverseIso(p.x,p.y);if(w.x>.25&&w.x<13.7&&w.z>.25&&w.z<9.7&&!blocked(w.x,w.z)){state.player.target=w;state.player.action=null;$('#context').classList.add('hidden');$('#activity').textContent='Caminando'}});
addEventListener('keydown',e=>{if(!['INPUT','SELECT'].includes(document.activeElement?.tagName))keys.add(e.key.toLowerCase())});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));

function palette(host,arr,key){const h=$(host);h.innerHTML='';arr.forEach((c,i)=>{const b=document.createElement('button');b.style.background=c;b.className=state.appearance[key]===i?'active':'';b.onclick=()=>{state.appearance[key]=i;palette(host,arr,key);save()};h.appendChild(b)})}
function syncCreator(){const a=state.appearance;$('#charName').value=a.name;$('#gender').value=a.gender;$('#hairStyle').value=a.hairStyle;$('#bodySize').value=a.body;$('#height').value=a.height;$('#outfit').value=a.outfit;$('#trait').value=a.trait;$('#aspiration').value=a.aspiration;palette('#skinPalette',SKIN,'skin');palette('#eyePalette',EYE,'eye');palette('#hairPalette',HAIR,'hair');palette('#outfitPalette',CLOTH,'outfit')}
syncCreator();
$$('[data-go]').forEach(b=>b.onclick=()=>{const m=b.dataset.go;if(m==='creator')syncCreator();setMode(m)});
$$('.creator-tabs button').forEach(b=>b.onclick=()=>{$$('.creator-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.creator-page').forEach(x=>x.classList.toggle('hidden',x.dataset.page!==b.dataset.tab))});
for(const id of['charName','gender','hairStyle','bodySize','height','outfit','trait','aspiration'])$('#'+id).addEventListener('input',()=>{const a=state.appearance;a.name=$('#charName').value||'Valentina';a.gender=$('#gender').value;a.hairStyle=+$('#hairStyle').value;a.body=+$('#bodySize').value;a.height=+$('#height').value;a.outfit=+$('#outfit').value;a.trait=$('#trait').value;a.aspiration=$('#aspiration').value;save()});
$('#enterHome').onclick=()=>{state.appearance.name=$('#charName').value||'Valentina';setMode('game');notify('Bienvenida a casa')};
$('#editBtn').onclick=()=>{syncCreator();setMode('creator')};
$('#resetBtn').onclick=()=>{localStorage.removeItem('sims-tan-pixel');location.reload()};
$$('[data-quick]').forEach(b=>b.onclick=()=>{const id=b.dataset.quick,act={tv:'watch',bed:'sleep',shower:'shower',toilet:'toilet'}[id];queue(id,act)});
$$('.mobile-pad button').forEach(b=>{const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[b.dataset.dir];let timer;const step=()=>{const p=state.player,nx=p.x+d[0]*.15,nz=p.z+d[1]*.15;if(!blocked(nx,nz)){p.x=nx;p.z=nz;p.target=null;p.action=null}};b.onpointerdown=e=>{e.preventDefault();step();timer=setInterval(step,70)};['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>clearInterval(timer)))});
$('#makeRoom').onclick=()=>{const code='SIM-'+Math.floor(1000+Math.random()*9000);$('#roomCode').value=code;$('#netStatus').textContent='Sala '+code+' creada. Comparte el código.';notify('Sala creada')};
$('#joinRoom').onclick=()=>{const c=$('#roomCode').value.trim();$('#netStatus').textContent=c?'Conectando a '+c+'…':'Escribe un código de sala.';if(c)setTimeout(()=>{$('#netStatus').textContent='Sala encontrada. Modo compartido preparado.'},600)};
setMode(state.mode==='game'?'game':'menu');
