const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#game'), ctx=canvas.getContext('2d');
canvas.width=960;canvas.height=540;ctx.imageSmoothingEnabled=false;
const W=960,H=540,TW=54,TH=27,YH=27,OX=475,OY=96;

const SKIN=['#f2c7a6','#dda176','#bb7854','#87523b','#593326'];
const HAIR=['#2b211c','#51382a','#845333','#c0864f','#923f32','#d0aa67'];
const EYE=['#3d3028','#566248','#68787a','#3c6279','#765b43'];
const CLOTH=['#6e8865','#a76653','#44505a','#e0c79b','#806783','#b78653'];
const P={ink:'#49362b',deep:'#382a24',wood:'#8b5d3e',wood2:'#b7794b',cream:'#ead8ae',sage:'#7fa06b',sage2:'#5f8255',leaf:'#4c7847',leaf2:'#69984f',leaf3:'#85ac5c',brick:'#b46653',roof:'#6f5143',gold:'#d5ae67',blue:'#6e9a9b',tile:'#c7c1a4',water:'#7caab0'};
const state={mode:'menu',appearance:{name:'Valentina',gender:'fem',skin:1,hair:0,eye:0,hairStyle:0,body:100,height:100,outfit:0,trait:'Sociable',aspiration:'Vida equilibrada'},needs:{energy:78,hunger:72,hygiene:82,fun:70,bladder:75},minutes:14*60+40,tv:false,player:{x:6.2,z:6.2,target:null,action:null,pose:'idle'},speed:1};
let hitZones=[],last=performance.now(),toastTimer=0,network=null,peer=null;
const keys=new Set();

function save(){try{localStorage.setItem('sims-tan-cozy-pixel',JSON.stringify(state))}catch{}}
function load(){try{const s=JSON.parse(localStorage.getItem('sims-tan-cozy-pixel')||'null');if(s){Object.assign(state,s);state.player=Object.assign({x:6.2,z:6.2,target:null,action:null,pose:'idle'},s.player||{});state.player.target=null;state.player.action=null;state.player.pose='idle'}}catch{}}
load();
function px(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function line(x1,y1,x2,y2,c,w=1){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);ctx.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);ctx.stroke()}
function poly(a,c,stroke=P.ink){ctx.beginPath();ctx.moveTo(a[0].x|0,a[0].y|0);for(let i=1;i<a.length;i++)ctx.lineTo(a[i].x|0,a[i].y|0);ctx.closePath();ctx.fillStyle=c;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function iso(x,z,y=0){return{x:OX+(x-z)*TW/2,y:OY+(x+z)*TH/2-y*YH}}
function box3(x,z,w,d,h,top,left,right,stroke=P.ink){const a=iso(x,z,h),b=iso(x+w,z,h),c=iso(x+w,z+d,h),d0=iso(x,z+d,h),A=iso(x,z),B=iso(x+w,z),C=iso(x+w,z+d),D=iso(x,z+d);poly([d0,c,C,D],left,stroke);poly([b,c,C,B],right,stroke);poly([a,b,c,d0],top,stroke)}
function zone(id,x,z,w,d,h=2.1){const pts=[];for(const xx of[x,x+w])for(const zz of[z,z+d])for(const yy of[0,h])pts.push(iso(xx,zz,yy));const minx=Math.min(...pts.map(p=>p.x)),maxx=Math.max(...pts.map(p=>p.x)),miny=Math.min(...pts.map(p=>p.y)),maxy=Math.max(...pts.map(p=>p.y));hitZones.push({id,x:minx-6,y:miny-8,w:maxx-minx+12,h:maxy-miny+16})}
function dot(x,y,c){px(x,y,2,2,c)}
function flower(x,y,c){px(x,y,2,5,'#4e7145');px(x-2,y-2,2,2,c);px(x+2,y-2,2,2,c);px(x,y-4,2,2,'#f1d37e')}
function bush(x,y,s=1){for(const [dx,dy,c] of[[-9,0,'#355b3a'],[-5,-6,'#4d7a42'],[2,-8,'#5f8c49'],[8,-1,'#3f6940'],[-5,4,'#6d9d52'],[2,4,'#73a455'],[0,-2,'#5a8847']])px(x+dx*s,y+dy*s,10*s,8*s,c)}
function plankTexture(x,y,w,h,base,alt,step=12){px(x,y,w,h,base);for(let yy=y+step;yy<y+h;yy+=step)line(x,yy,x+w,yy,'#6e4934');for(let yy=y+4;yy<y+h;yy+=step){for(let i=0;i<5;i++){const xx=x+((i*41+yy*7)%Math.max(1,w-18));line(xx,yy,xx+12,yy,alt)}}}

function drawSkyGradient(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#8eb3ad');g.addColorStop(.55,'#9aae83');g.addColorStop(1,'#718d67');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
function drawMenuScene(){
 drawSkyGradient();
 for(let i=0;i<75;i++){const x=(i*131)%W,y=28+(i*73)%265;dot(x,y,i%4?'#91aa83':'#c2c690')}
 // distant forest
 for(let x=-20;x<W+40;x+=42){const h=60+((x*13)%37+37)%37;px(x,H-190-h,18,h,'#536b50');bush(x+7,H-190-h,1.6);bush(x-4,H-165-h,1.25)}
 px(0,H-160,W,160,'#6e8b62');
 // raised foundation shadow
 poly([{x:170,y:438},{x:690,y:438},{x:785,y:488},{x:260,y:488}],'#5e694b',null);
 // pub facade
 px(192,221,482,208,'#d9ad76');px(184,429,500,16,'#6b4535');
 for(let y=236;y<428;y+=19){line(194,y,672,y,'#b77e5b');for(let x=206+(y%38);x<660;x+=64)line(x,y,x,y+18,'#c39068')}
 // roof large
 poly([{x:158,y:224},{x:252,y:129},{x:520,y:139},{x:701,y:221},{x:665,y:250},{x:204,y:248}], '#604a44','#3b312c');
 for(let x=183;x<675;x+=18)line(x,220-(x<270?(270-x)*.37:0),x+55,166+(x%23),'#786158');
 // dormer
 poly([{x:290,y:203},{x:338,y:155},{x:390,y:204}], '#b65f4e',P.ink);px(304,201,72,50,'#d7a56e');poly([{x:298,y:205},{x:338,y:164},{x:382,y:205}],'#d2735e',P.ink);px(317,186,42,33,'#4b433c');px(321,190,34,25,'#78a1a1');line(338,190,338,215,'#5c4438');line(321,202,355,202,'#5c4438');
 // roof ivy
 for(let i=0;i<44;i++){const x=408+(i*23)%225,y=135+((i*31)%98);bush(x,y,.66);if(i%5===0)flower(x+2,y-6,i%10?'#e38b73':'#dfc35e')}
 // hanging pub sign
 px(120,264,7,73,'#584337');px(104,264,37,7,'#584337');px(96,282,62,40,'#3f3e31');px(101,287,52,30,'#e0c08a');ctx.fillStyle='#5c4938';ctx.font='bold 11px monospace';ctx.fillText('PUB',116,299);ctx.font='7px monospace';ctx.fillText('SIMS TAN',105,311);
 // center sign
 px(240,235,330,60,'#477247');px(246,241,318,48,'#e6d5a9');px(251,246,308,38,'#568553');ctx.fillStyle='#f3e3b8';ctx.font='bold 22px serif';ctx.textAlign='center';ctx.fillText('The Sims Tan',405,272);ctx.textAlign='left';
 // windows / doors
 const wins=[220,315,505,595];for(const x of wins){px(x,312,63,72,'#5b4034');px(x+5,317,53,62,'#97b9a4');line(x+31,317,x+31,379,'#694b3a',3);line(x+5,348,x+58,348,'#694b3a',3);px(x+10,355,13,8,'#e8be78');px(x+38,328,12,8,'#c77761')}
 px(402,303,72,126,'#5b3e30');px(409,311,58,113,'#7a563e');px(421,330,34,69,'#a88059');px(446,365,5,5,'#d8ad63');
 // balcony + ladder
 px(575,299,121,12,'#76503d');for(let x=583;x<691;x+=21)px(x,301,5,86,'#76503d');for(let y=314;y<383;y+=16)px(580,y,113,5,'#76503d');px(699,259,7,163,'#684938');px(735,259,7,163,'#684938');for(let y=272;y<415;y+=18)px(699,y,43,4,'#684938');
 // patio details
 plankTexture(180,445,590,74,'#d6a36e','#b87f59',13);px(214,456,139,8,'#704a36');px(226,466,116,43,'#9c6c48');px(232,471,104,31,'#d6b477');
 // benches / pots
 px(530,478,137,17,'#8b593d');px(547,495,102,25,'#b7794d');for(const x of[190,688,735]){px(x,471,28,24,'#8b5a42');bush(x+9,468,1.2);flower(x+7,458,'#e68775')}
 // foreground plants
 for(const [x,y,s] of[[145,438,1.5],[167,470,1.3],[698,440,1.5],[759,455,1.3],[118,491,1.4]]){bush(x,y,s);flower(x,y-10,'#e9c768')}
 // little cat
 px(365,460,20,12,'#5d574b');px(381,455,9,9,'#5d574b');px(383,451,3,4,'#5d574b');px(389,452,3,4,'#5d574b');px(350,456,17,4,'#5d574b');
}

function avatar(cx,cy,scale=1,walk=0,pose='idle'){
 const a=state.appearance,skin=SKIN[a.skin],hair=HAIR[a.hair],cloth=CLOTH[a.outfit],s=scale,body=a.body/100,height=a.height/100;
 ctx.save();ctx.translate(Math.round(cx),Math.round(cy));ctx.scale(s*body,s*height);
 if(pose==='sleep'){ctx.rotate(-Math.PI/2);ctx.translate(-7,-5)}
 const leg=walk?Math.round(Math.sin(walk)*2):0;
 px(-8,-1+leg,6,15,'#504a44');px(2,-1-leg,6,15,'#504a44');px(-9,13+leg,8,4,'#2c2927');px(1,13-leg,8,4,'#2c2927');
 px(-10,-25,20,25,cloth);px(-12,-22,3,18,skin);px(9,-22,3,18,skin);px(-9,-39,18,16,skin);px(-10,-42,20,8,hair);
 if(a.hairStyle===0){px(-11,-37,4,18,hair);px(7,-37,4,18,hair)}else if(a.hairStyle===1){px(-6,-47,12,7,hair);px(-3,-50,6,5,hair)}else if(a.hairStyle===3){px(-12,-39,5,7,hair);px(7,-39,5,7,hair);px(-12,-31,4,7,hair);px(8,-31,4,7,hair)}
 px(-5,-33,2,2,EYE[a.eye]);px(3,-33,2,2,EYE[a.eye]);px(-1,-27,3,1,'#a26158');if(a.gender==='fem')px(-9,-24,18,3,'#d5a76f');ctx.restore();
}
function drawCreator(){
 drawMenuScene();ctx.fillStyle='rgba(53,55,42,.36)';ctx.fillRect(0,0,W,H);
 // garden studio nook
 px(205,76,336,408,'#7f9d72');px(215,86,316,388,'#a9bb8c');for(let y=95;y<468;y+=18)for(let x=224;x<520;x+=18)if((x+y)%36===0)dot(x,y,'#8ea77a');
 for(let x=220;x<530;x+=42)bush(x,456,1.1);px(295,438,160,9,'rgba(54,47,37,.25)');avatar(375,405,4.1,0,'idle');
 ctx.fillStyle='#f2e5bf';ctx.font='10px monospace';ctx.fillText('VISTA DEL PERSONAJE',318,463);
}

function floorTile(x,z,bath=false){const a=iso(x,z),b=iso(x+1,z),c=iso(x+1,z+1),d=iso(x,z+1);const base=bath?((x+z)%2?'#bfc4b2':'#d1cfbc'):((x+z)%2?'#c6915e':'#d5a66e');poly([a,b,c,d],base,'#8a6348');if(!bath){const p=iso(x+.12,z+.23),q=iso(x+.88,z+.23);line(p.x,p.y,q.x,q.y,'rgba(92,58,38,.32)')}}
function drawFloor(){for(let z=0;z<10;z++)for(let x=0;x<14;x++)floorTile(x,z,x>=10&&z<=4)}
function drawWalls(){
 for(let x=0;x<14;x+=2)box3(x,-.18,2,.18,3.7,'#ddd0ad','#b8a886','#a69474','#715845');
 for(let z=0;z<10;z+=2)box3(-.18,z,.18,2,3.7,'#ddd0ad','#b8a886','#a69474','#715845');
 // tall back window city
 const p=iso(1.3,.02,3.35);px(p.x-15,p.y+12,207,77,'#30454c');px(p.x-9,p.y+18,195,65,'#758f8b');for(let i=0;i<26;i++){const x=p.x+(i*37)%188,y=p.y+35+((i*19)%40);px(x,y,6,19,'#42575b');dot(x+2,y+5,'#e1b66d')}for(let x=p.x+20;x<p.x+185;x+=48)px(x,p.y+18,4,65,'#59483b');
 // bathroom partitions
 box3(9.72,.1,.18,4.95,3.0,'#cfc7ad','#a79b83','#9b8c76','#6d5948');box3(9.72,4.87,4.28,.18,3.0,'#cfc7ad','#a79b83','#9b8c76','#6d5948');
 // trim
 for(let x=0;x<14;x+=1.3)box3(x,-.14,1.25,.09,.16,'#7f5a42','#684631','#5e3c2d','#54382b');
}
function potPlant(x,z,scale=1){const p=iso(x,z,.18);px(p.x-7*scale,p.y-7*scale,14*scale,12*scale,'#8b5741');px(p.x-9*scale,p.y-12*scale,18*scale,5*scale,'#a46848');for(const [dx,dy,c] of[[-9,-25,'#3e6b42'],[-3,-32,'#56814b'],[5,-28,'#4a7546'],[9,-20,'#6c9551'],[-11,-18,'#5d8a4d'],[0,-22,'#7aa259']])px(p.x+dx*scale,p.y+dy*scale,9*scale,10*scale,c)}
function books(x,y){const cs=['#ae6254','#66866b','#c89e62','#6f7187','#8a594b'];for(let i=0;i<5;i++){const w=5+(i%2)*2;px(x+i*7,y+(i%2)*2,w,18-(i%3),cs[i])}}
function drawBed(){box3(.85,1.0,4.35,2.55,.48,'#76503a','#5f3e31','#503329');box3(1.0,1.13,4.05,2.28,.78,'#eadcb8','#c9b98f','#ae9f7c');box3(1.06,1.72,3.95,1.6,.98,'#ad6654','#8f5042','#794237');box3(1.09,1.15,1.35,.72,1.08,'#f3e8c8','#d5c79f','#baa981');box3(3.62,1.15,1.35,.72,1.08,'#f3e8c8','#d5c79f','#baa981');box3(.72,.84,4.62,.18,2.35,'#7a513b','#603e30','#523329');const h=iso(1.35,1.13,1.02);for(let i=0;i<18;i++)dot(h.x+((i*13)%92),h.y+((i*7)%26),'#d48a6c');zone('bed',.7,.82,4.7,2.7,2.4)}
function drawNightstand(){box3(.45,3.86,1.0,.85,.78,'#a36d49','#81513a','#6d4432');const p=iso(.95,4.2,.8);px(p.x-2,p.y-21,4,21,'#66513f');px(p.x-9,p.y-29,18,12,'#ebd39e');dot(p.x-4,p.y-22,'#f7e3a7');books(p.x+15,p.y-17)}
function drawSofa(){box3(5.6,6.25,3.55,1.3,.58,'#9d6848','#80513c','#6f4637');box3(5.72,6.82,3.3,.42,1.38,'#bd7d58','#955b44','#7d4b3a');box3(5.48,6.1,.42,1.52,1.03,'#c4815b','#985d45','#7c4a39');box3(8.93,6.1,.42,1.52,1.03,'#c4815b','#985d45','#7c4a39');box3(5.98,6.34,1.24,.74,.73,'#dc9869','#b76f52','#995542');box3(7.38,6.34,1.24,.74,.73,'#e6a26f','#bb7455','#9a5944');const p=iso(7.2,6.7,1.1);px(p.x-7,p.y-8,13,13,'#d1b473');px(p.x+14,p.y-7,12,12,'#678a70');zone('sofa',5.45,6.05,3.95,1.65,1.5)}
function drawRug(){const a=iso(4.65,4.48,.02),b=iso(9.65,4.48,.02),c=iso(9.65,7.55,.02),d=iso(4.65,7.55,.02);poly([a,b,c,d],'#73978c','#4f7068');const a2=iso(5.0,4.78,.03),b2=iso(9.3,4.78,.03),c2=iso(9.3,7.25,.03),d2=iso(5.0,7.25,.03);poly([a2,b2,c2,d2],'#8fb0a0','#d0c08c');for(let i=0;i<18;i++){const p=iso(5.2+(i%6)*.65,5.0+Math.floor(i/6)*.72,.04);dot(p.x,p.y,i%2?'#e3cf93':'#55796d')}}
function drawCoffee(){box3(6.25,4.92,2.45,1.1,.52,'#b57a48','#8f5938','#76462f');const p=iso(7.45,5.45,.55);px(p.x-9,p.y-8,15,3,'#6c4f3e');px(p.x-5,p.y-14,7,6,'#efe0b6');dot(p.x+17,p.y-6,'#e6c06d');zone('coffee',6.2,4.9,2.55,1.2,.7)}
function drawTV(){box3(7.7,.55,3.4,.72,.5,'#7e573e','#634230','#52352a');box3(7.95,.78,2.92,.18,2.12,'#292f30','#222727','#181c1d');const p=iso(8.27,.86,1.93);px(p.x-20,p.y-18,60,34,state.tv?'#6da1a0':'#1b2224');if(state.tv){px(p.x-16,p.y-14,19,10,'#e5b16c');px(p.x+8,p.y-12,25,7,'#98b892');px(p.x-14,p.y+3,43,5,'#6f879c');dot(p.x+25,p.y-3,'#f0d47a')}box3(8.85,.72,.12,.12,.85,'#43352f','#3b2f29','#332721');zone('tv',7.65,.48,3.55,.85,2.6)}
function drawShelf(){box3(11.45,5.62,1.8,.58,2.82,'#8c5b3e','#6e4633','#5c392d');for(let y=.65;y<2.65;y+=.63)box3(11.55,5.64,1.58,.48,y,'#9f6947','#7b4e37','#67412f');const p=iso(11.65,5.68,2.5);books(p.x,p.y+28);books(p.x+8,p.y+45);potPlant(12.1,5.5,.65)}
function drawBathroom(){
 // shower enclosure back-right
 box3(11.68,.55,1.78,2.0,.14,'#d0c9ad','#aaa08b','#9d907e');const a=iso(11.7,.62,2.45),b=iso(13.38,.62,2.45),c=iso(13.38,.62,.2),d=iso(11.7,.62,.2);poly([a,b,c,d],'rgba(162,195,192,.42)','#748b88');for(let i=0;i<5;i++){const p=iso(12.0+i*.28,.72,2.3-i*.08);dot(p.x,p.y,'#e9f0de')}
 const sp=iso(13.05,.8,2.2);px(sp.x-2,sp.y-2,4,25,'#9a9f98');px(sp.x-6,sp.y-6,12,5,'#b9bdb1');zone('shower',11.55,.45,1.95,2.25,2.8);
 // vanity + mirror
 box3(10.22,2.52,1.45,.62,.86,'#a36a49','#815139','#6e4534');box3(10.36,2.61,1.15,.46,1.02,'#efe8ce','#cbc3a8','#b4ad96');const mp=iso(10.3,2.62,2.35);px(mp.x-9,mp.y-5,49,43,'#5e4c3e');px(mp.x-5,mp.y-1,41,35,'#8fb0ad');dot(mp.x+27,mp.y+7,'#dbe4ce');zone('sink',10.15,2.45,1.62,.78,2.6);
 // toilet
 box3(12.06,3.36,.72,.78,.46,'#ddd8c6','#bbb5a1','#a8a28f');box3(12.12,3.78,.62,.28,1.0,'#eee8d4','#c8c0aa','#b5ad99');const tp=iso(12.42,3.44,.53);ctx.strokeStyle='#8e887c';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(tp.x,tp.y,12,6,0,0,Math.PI*2);ctx.stroke();zone('toilet',11.98,3.28,.9,.95,1.3);
 // towels / small plant
 const p=iso(10.15,4.15,1.82);px(p.x-2,p.y-3,24,8,'#d0966f');px(p.x-2,p.y+5,24,8,'#709190');potPlant(13.45,4.35,.72);
}
function drawDesk(){box3(1.05,6.72,2.35,.75,.78,'#a56d48','#7f4e36','#67412f');box3(1.15,6.84,.12,.58,1.45,'#77513b','#5f4032','#51342b');box3(3.02,6.84,.12,.58,1.45,'#77513b','#5f4032','#51342b');const p=iso(2.0,6.95,.85);books(p.x-14,p.y-18);px(p.x+25,p.y-29,32,23,'#374247');px(p.x+28,p.y-26,26,17,'#769095');zone('desk',1.0,6.65,2.5,.9,1.6)}
function drawDecor(){
 // paintings
 const p=iso(5.55,.02,2.65);px(p.x,p.y,48,38,'#604c3e');px(p.x+4,p.y+4,40,30,'#c6b07f');px(p.x+9,p.y+9,13,17,'#6f8b6e');px(p.x+27,p.y+7,10,21,'#b56f5a');
 potPlant(3.9,7.7,1.0);potPlant(9.45,3.0,.85);potPlant(4.6,.48,.75);
 // scattered cozy clutter
 const q=iso(4.1,3.65,.1);px(q.x-4,q.y-3,12,5,'#c98952');dot(q.x+12,q.y-1,'#e0c069');
}
const objects={
 bed:{label:'Cama',desc:'Cama doble con colcha, almohadas y velador.',approach:{x:4.7,z:3.95},actions:[['Dormir','sleep'],['Sentarse','sitBed'],['Hacer la cama','makeBed']]},
 sofa:{label:'Sofá',desc:'Sofá amplio frente al televisor.',approach:{x:7.35,z:5.55},actions:[['Sentarse','sitSofa'],['Relajarse','relax']]},
 tv:{label:'Televisor',desc:'Televisor del salón.',approach:{x:8.8,z:2.25},actions:[['Ver televisión','watchTV'],['Encender / apagar','toggleTV']]},
 shower:{label:'Ducha',desc:'Ducha de vidrio del baño.',approach:{x:11.15,z:1.75},actions:[['Ducharse','shower']]},
 toilet:{label:'Inodoro',desc:'Baño principal.',approach:{x:11.35,z:4.05},actions:[['Usar baño','toilet']]},
 sink:{label:'Lavamanos',desc:'Lavamanos con espejo.',approach:{x:10.1,z:3.25},actions:[['Lavarse manos','wash'],['Mirarse','mirror']]},
 desk:{label:'Escritorio',desc:'Escritorio con libros y pantalla.',approach:{x:2.3,z:6.15},actions:[['Sentarse','desk'],['Leer','read']]},
 coffee:{label:'Mesa de centro',desc:'Mesa con taza y revistas.',approach:{x:7.3,z:4.3},actions:[['Tomar café','coffee']]}
};
function drawGame(){
 hitZones=[];ctx.fillStyle='#88a9a4';ctx.fillRect(0,0,W,H);
 // ground shadow / garden edge
 poly([{x:115,y:426},{x:575,y:510},{x:850,y:375},{x:393,y:292}],'#657b5d',null);
 drawFloor();drawWalls();drawRug();
 const entities=[
 {d:2.3,fn:drawTV},{d:3.1,fn:drawBed},{d:4.2,fn:drawNightstand},{d:4.6,fn:drawBathroom},{d:6.3,fn:drawDesk},{d:6.4,fn:drawCoffee},{d:7.4,fn:drawSofa},{d:8.0,fn:drawShelf},{d:8.1,fn:drawDecor}
 ];
 const pd=state.player.x+state.player.z;entities.push({d:pd,fn:drawPlayer});entities.sort((a,b)=>a.d-b.d).forEach(e=>e.fn());
 // foreground soft vegetation
 bush(108,445,1.6);bush(824,401,1.4);flower(118,425,'#e9c66b');flower(838,385,'#e68b75');
}
function drawPlayer(){const p=iso(state.player.x,state.player.z,0);ctx.fillStyle='rgba(49,42,33,.23)';ctx.beginPath();ctx.ellipse(p.x,p.y+4,15,7,0,0,Math.PI*2);ctx.fill();const moving=!!state.player.target;avatar(p.x,p.y,1.28,moving?performance.now()/95:0,state.player.pose); // plumbob
 const py=p.y-65;poly([{x:p.x,y:py-13},{x:p.x+8,y:py},{x:p.x,y:py+13},{x:p.x-8,y:py}], '#6fc46d','#3d7d46');poly([{x:p.x,y:py-13},{x:p.x+8,y:py},{x:p.x,y:py}], '#8cdb78',null)}
function screenToGrid(sx,sy){const A=(sx-OX)/(TW/2),B=(sy-OY)/(TH/2);return{x:(A+B)/2,z:(B-A)/2}}

function draw(){if(state.mode==='menu'||state.mode==='multi')drawMenuScene();else if(state.mode==='creator')drawCreator();else drawGame()}
function setMode(m){state.mode=m;$('#menu').classList.toggle('hidden',m!=='menu');$('#creator').classList.toggle('hidden',m!=='creator');$('#multi').classList.toggle('hidden',m!=='multi');$('#hud').classList.toggle('hidden',m!=='game');save()}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('on'),1500)}
function selectObject(id){const o=objects[id];if(!o)return;$('#contextTitle').textContent=o.label.toUpperCase();$('#contextDesc').textContent=o.desc;const h=$('#contextActions');h.innerHTML='';o.actions.forEach(([label,act])=>{const b=document.createElement('button');b.textContent=label.toUpperCase();b.onclick=()=>queue(id,act);h.appendChild(b)});$('#context').classList.remove('hidden')}
function queue(id,act){const o=objects[id];$('#context').classList.add('hidden');state.player.target={x:o.approach.x,z:o.approach.z};state.player.action={id,act};state.player.pose='idle';toast('Yendo a '+o.label.toLowerCase()+'…')}
function actDone(ms,msg,delta={},pose='idle'){state.player.pose=pose;toast(msg);setTimeout(()=>{for(const [k,v] of Object.entries(delta))state.needs[k]=Math.max(0,Math.min(100,state.needs[k]+v));state.player.pose='idle';state.player.action=null;hud();save()},ms)}
function executeAction(){const a=state.player.action;if(!a)return;switch(a.act){case'toggleTV':state.tv=!state.tv;toast(state.tv?'Televisor encendido':'Televisor apagado');state.player.action=null;break;case'watchTV':state.tv=true;actDone(3300,'Viendo televisión…',{fun:28},'sit');break;case'sitSofa':actDone(2400,'Sentada en el sofá',{energy:7},'sit');break;case'relax':actDone(3000,'Relajándose',{energy:12,fun:10},'sit');break;case'sleep':actDone(4200,'Durmiendo…',{energy:45},'sleep');break;case'sitBed':actDone(2300,'Descansando',{energy:9},'sit');break;case'makeBed':actDone(1000,'Cama ordenada');break;case'shower':actDone(3200,'Duchándose…',{hygiene:45},'hidden');break;case'toilet':actDone(2400,'Usando el baño…',{bladder:45},'sit');break;case'wash':actDone(1600,'Lavándose las manos',{hygiene:15});break;case'mirror':actDone(1500,'Mirándose al espejo',{fun:3});break;case'desk':actDone(2500,'Sentada en el escritorio',{fun:6},'sit');break;case'read':actDone(2800,'Leyendo…',{fun:10});break;case'coffee':actDone(1800,'Tomando café',{energy:8});break}}
function step(dt){
 if(state.mode!=='game')return;
 let dx=0,dz=0;if(keys.has('w')||keys.has('arrowup'))dz-=1;if(keys.has('s')||keys.has('arrowdown'))dz+=1;if(keys.has('a')||keys.has('arrowleft'))dx-=1;if(keys.has('d')||keys.has('arrowright'))dx+=1;
 if(dx||dz){state.player.target=null;state.player.action=null;const l=Math.hypot(dx,dz),sp=2.15*dt;state.player.x=Math.max(.4,Math.min(13.55,state.player.x+dx/l*sp));state.player.z=Math.max(.35,Math.min(9.55,state.player.z+dz/l*sp));}
 else if(state.player.target){const v={x:state.player.target.x-state.player.x,z:state.player.target.z-state.player.z},d=Math.hypot(v.x,v.z);if(d<.06){state.player.x=state.player.target.x;state.player.z=state.player.target.z;state.player.target=null;if(state.player.action)executeAction()}else{const sp=Math.min(d,2.0*dt);state.player.x+=v.x/d*sp;state.player.z+=v.z/d*sp}}
 if(state.speed){const f=dt*state.speed;state.needs.energy=Math.max(0,state.needs.energy-f*.018);state.needs.hunger=Math.max(0,state.needs.hunger-f*.026);state.needs.hygiene=Math.max(0,state.needs.hygiene-f*.014);state.needs.fun=Math.max(0,state.needs.fun-f*.012);state.needs.bladder=Math.max(0,state.needs.bladder-f*.023);state.minutes+=f*.52}
}
function hud(){for(const k of['energy','hunger','hygiene','fun','bladder']){const e=$('#'+k+'Bar');if(e)e.style.width=Math.round(state.needs[k])+'%'}$('#hudName').textContent=state.appearance.name;$('#houseName').textContent=state.appearance.name.toUpperCase();const m=Math.floor(state.minutes%1440),d=Math.floor(state.minutes/1440)%7;$('#clockText').textContent=`${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'][d]} · ${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;$('#activity').textContent=state.player.target?'Caminando':state.player.action?'Ocupada':'En casa';drawPortrait()}
function drawPortrait(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#8fac83';x.fillRect(0,0,64,64);x.fillStyle=HAIR[state.appearance.hair];x.fillRect(18,8,28,18);x.fillStyle=SKIN[state.appearance.skin];x.fillRect(20,14,24,27);x.fillStyle=HAIR[state.appearance.hair];x.fillRect(17,10,5,30);x.fillRect(42,10,5,30);x.fillStyle=EYE[state.appearance.eye];x.fillRect(25,24,3,3);x.fillRect(36,24,3,3);x.fillStyle=CLOTH[state.appearance.outfit];x.fillRect(13,43,38,21);$('#portrait').style.backgroundImage=`url(${c.toDataURL()})`}

function palette(host,arr,key){const h=$(host);h.innerHTML='';arr.forEach((c,i)=>{const b=document.createElement('button');b.style.background=c;b.className=state.appearance[key]===i?'active':'';b.onclick=()=>{state.appearance[key]=i;palette(host,arr,key);save()};h.appendChild(b)})}
palette('#skinPalette',SKIN,'skin');palette('#hairPalette',HAIR,'hair');palette('#eyePalette',EYE,'eye');palette('#outfitPalette',CLOTH,'outfit');
function syncCreator(){state.appearance.name=$('#charName').value.trim()||'Valentina';state.appearance.gender=$('#gender').value;state.appearance.hairStyle=+$('#hairStyle').value;state.appearance.body=+$('#bodySize').value;state.appearance.height=+$('#height').value;state.appearance.outfit=+$('#outfit').value;state.appearance.trait=$('#trait').value;state.appearance.aspiration=$('#aspiration').value;save();hud()}
['charName','gender','hairStyle','bodySize','height','outfit','trait','aspiration'].forEach(id=>$('#'+id)?.addEventListener('change',syncCreator));
$$('[data-go]').forEach(b=>b.onclick=()=>{const m=b.dataset.go;if(m==='game')hud();setMode(m)});$('#enterHome').onclick=()=>{syncCreator();setMode('game')};$('#editBtn').onclick=()=>setMode('creator');$('#resetBtn').onclick=()=>{localStorage.removeItem('sims-tan-cozy-pixel');location.reload()};
$$('.creator-tabs button').forEach(b=>b.onclick=()=>{$$('.creator-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.creator-page').forEach(x=>x.classList.add('hidden'));$(`.creator-page[data-page="${b.dataset.tab}"]`).classList.remove('hidden')});
$$('[data-quick]').forEach(b=>b.onclick=()=>selectObject(b.dataset.quick));

async function getPeer(){if(peer)return peer;const mod=await import('https://cdn.jsdelivr.net/npm/peerjs@1.5.5/+esm');const P=mod.default||mod.Peer;peer=new P();peer.on('connection',c=>{network=c;$('#netStatus').textContent='Conectado.'});return peer}
$('#makeRoom').onclick=async()=>{try{const p=await getPeer();const ready=id=>{$('#roomCode').value=id;$('#netStatus').textContent='Sala lista. Comparte el código.'};p.id?ready(p.id):p.once('open',ready)}catch{$('#netStatus').textContent='No se pudo crear la sala.'}};
$('#joinRoom').onclick=async()=>{try{const id=$('#roomCode').value.trim();if(!id)return;const p=await getPeer();const go=()=>{network=p.connect(id,{reliable:true});$('#netStatus').textContent='Conectando…';network.on('open',()=>{$('#netStatus').textContent='Conectado.';setMode('game')})};p.id?go():p.once('open',go)}catch{$('#netStatus').textContent='No se pudo conectar.'}};

canvas.addEventListener('pointerup',e=>{if(state.mode!=='game')return;const r=canvas.getBoundingClientRect(),sx=(e.clientX-r.left)/r.width*W,sy=(e.clientY-r.top)/r.height*H;for(let i=hitZones.length-1;i>=0;i--){const z=hitZones[i];if(sx>=z.x&&sx<=z.x+z.w&&sy>=z.y&&sy<=z.y+z.h){selectObject(z.id);return}}const g=screenToGrid(sx,sy);if(g.x>=.2&&g.x<=13.8&&g.z>=.2&&g.z<=9.8){state.player.target={x:g.x,z:g.z};state.player.action=null;$('#context').classList.add('hidden')}});
addEventListener('keydown',e=>{if(!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))keys.add(e.key.toLowerCase())});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
$$('.mobile-pad button').forEach(b=>{const dir={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[b.dataset.dir];let t;b.onpointerdown=e=>{e.preventDefault();const f=()=>{state.player.target=null;state.player.x=Math.max(.4,Math.min(13.55,state.player.x+dir[0]*.08));state.player.z=Math.max(.35,Math.min(9.55,state.player.z+dir[1]*.08))};f();t=setInterval(f,48)};['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>clearInterval(t)))});

hud();setMode('menu');
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;step(dt);hud();draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
