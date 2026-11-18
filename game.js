const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),P=RunnerPhysics,R=RunnerRules;
const GROUND=420,STACK_DROP=8,DESK_DROP=30,CRASH_DURATION=1.05,REVEAL_AT=.325,PLAYER_X=200,WORLD_SCALE=.80;
const hero=new Image(),run=new Image();hero.src='hero.png';run.src='asset-beg-pravilny.png';
const artwork={};for(const name of ['desk','bitcoin','check','stack-high','stack-medium','stack-low','gameover-title']){const image=new Image();image.src='asset-'+name+'.png';artwork[name]=image;}
const art={};
let ready=false,frames=[],jumpFrame,headFrame,p=P.create(),travel=0,score=0,phase=0,runTravel=0,clock=0,worldClock=0,last=0,acc=0,state='run',crashTime=0,crashX=PLAYER_X,obstacles=[],bonuses=[],papers=[],popups=[],clouds=[],nextBonus=550,jumpStart=0;
const $=s=>document.querySelector(s),button=canvas;
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function sprite(image,x,y,w,h){const c=document.createElement('canvas');c.width=Math.ceil(w);c.height=Math.ceil(h);let g=c.getContext('2d');g.drawImage(image,x,y,w,h,0,0,w,h);const d=g.getImageData(0,0,c.width,c.height);let minX=c.width,minY=c.height,maxX=0,maxY=0;for(let j=0;j<c.height;j++)for(let i=0;i<c.width;i++)if(d.data[(j*c.width+i)*4+3]>100){minX=Math.min(i,minX);maxX=Math.max(i,maxX);minY=Math.min(j,minY);maxY=Math.max(j,maxY);}return {image:c,x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1};}
Promise.all([hero.decode(),run.decode(),...Object.values(artwork).map(image=>image.decode())]).then(()=>{for(let i=0;i<8;i++)frames.push({image:run,x:i%4*run.width/4,y:Math.floor(i/4)*run.height/2,w:run.width/4,h:run.height/2});jumpFrame=sprite(hero,hero.width*.65,0,hero.width*.35,hero.height);for(const [name,image] of Object.entries(artwork))art[name]=sprite(image,0,0,image.width,image.height);ready=true;reset();}).catch(()=>{$('#status').textContent='Не удалось загрузить изображения. Обнови страницу.';});
function reset(){p=P.create();travel=score=phase=runTravel=clock=worldClock=crashTime=0;state='run';acc=0;papers=[];popups=[];clouds=[];obstacles=[{x:1150,w:80,h:38,variant:0}];bonuses=[{x:620,y:GROUND-55,type:'check',seed:0}];nextBonus=900;$('#restart').hidden=true;$('#end').hidden=true;$('#jump-hint').hidden=false;}
function press(){if(!ready||state!=='run')return;if(p.grounded&&!p.held)jumpStart=travel;P.press(p);button.classList.add('active');}
function release(){P.release(p);button.classList.remove('active');}
window.addEventListener('keydown',e=>{if(e.target===$('#restart'))return;if(e.code==='Space'){e.preventDefault();if(!e.repeat)press();}if(e.code==='Enter'&&state==='over')reset();});window.addEventListener('keyup',e=>{if(e.target===$('#restart'))return;if(e.code==='Space'){e.preventDefault();release();}});
button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);press();});for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,release);$('#restart').onclick=()=>{reset();canvas.focus({preventScroll:true});};
window.addEventListener('blur',()=>{release();last=0;acc=0;});document.addEventListener('visibilitychange',()=>{release();last=0;acc=0;});
function crash(o){state='crash';crashTime=0;$('#jump-hint').hidden=true;crashX=Math.max(PLAYER_X,Math.min(800,o.x));release();obstacles=obstacles.filter(v=>v!==o);for(let i=0;i<96;i++)papers.push({x:crashX,y:GROUND-Math.random()*o.h,vx:(Math.random()-.5)*760,vy:-140-Math.random()*460,a:Math.random()*6,spin:(Math.random()-.5)*9,w:9+Math.random()*18});for(let i=0;i<22;i++)clouds.push({angle:i/22*Math.PI*2,reach:70+Math.random()*100,radius:34+Math.random()*30,seed:Math.random()*6});}
function update(dt){clock+=dt;if(state==='run'){
 const v=R.speed(travel/36),ds=v*dt,wasGrounded=p.grounded;P.step(p,dt);if(!wasGrounded&&p.grounded)p.lastDistance=travel-jumpStart;travel+=ds;if(p.grounded)runTravel+=dt*250*1.15*Math.sqrt(v/250);worldClock+=dt;
 for(const o of obstacles)o.x-=ds;for(const b of bonuses)b.x-=ds;
 obstacles=obstacles.filter(o=>o.x+o.w>-60);let tail=obstacles[obstacles.length-1];if(!tail||tail.x<1100)obstacles.push(R.nextObstacle(tail?tail.x:1100,v));
 nextBonus-=ds;if(nextBonus<=0){const type=Math.random()<.13?'btc':'check',x=1080,h=[45,90,145,200][Math.floor(Math.random()*4)];bonuses.push({x,y:GROUND-h,type,seed:Math.random()*6});nextBonus=v*(.7+Math.random()*.6);}
 const box=R.playerBox(PLAYER_X,GROUND,p.y);for(const b of bonuses){const y=b.y+Math.sin(worldClock*3+b.seed)*5;if(!b.got&&R.overlap(box,{x:b.x-16,y:y-20,w:32,h:40})){b.got=true;let points=R.bonusValue(b.type);score+=points;popups.push({x:b.x,y,points,age:0});}}
 bonuses=bonuses.filter(b=>b.x>-50&&!b.got);
 for(const o of obstacles)if(R.overlap(box,{x:o.x+4,y:GROUND+STACK_DROP-o.h+3,w:o.w-8,h:o.h-3})){crash(o);break;}
 }else{crashTime+=dt;if(state==='crash'&&crashTime>=CRASH_DURATION){state='over';$('#restart').hidden=false;$('#end').hidden=false;$('#end').textContent='Погряз в правках. USD: '+score+'. Пробежал '+Math.floor(travel/36)+' м.';}}
 const effectDt=dt*(state==='crash'?2:1);
 for(const q of papers){q.x+=q.vx*effectDt;q.y+=q.vy*effectDt;q.vy+=650*effectDt;q.a+=q.spin*effectDt;if(q.y>GROUND+50){q.y=GROUND+50;q.vx*=.94;q.vy=0;q.spin=0;}}
 for(const q of popups){q.age+=dt;q.y-=30*dt;}popups=popups.filter(q=>q.age<.9);
}
function background(){
 // Office layers: windows at the back, workstations behind the clear aisle.
 rect(0,0,1000,500,'#e3dfd3');rect(0,0,1000,49,'#d1d1c7');rect(0,47,1000,3,'#b9beb5');
 for(let i=0;i<5;i++){
  const x=((i*280-travel*.12)%1400+1400)%1400-280;
  rect(x+13,73,226,173,'#8c9d9b');rect(x+19,79,214,160,'#bed2d2');
  // City silhouettes stay outside the office windows.
  for(let j=0;j<5;j++){const h=25+(j*23+i*17)%63;rect(x+23+j*43,236-h,35,h,'#9db7bb');for(let k=0;k<3;k++)rect(x+28+j*43,241-h+k*15,5,5,'#c4d6d1');}
  rect(x+123,79,5,160,'#8c9d9b');rect(x+19,168,214,5,'#8c9d9b');
  rect(x+10,238,232,8,'#f4eee0');
  // Venetian blind header and pull cord.
  rect(x+12,70,228,10,'#c8c8bb');rect(x+226,81,2,48,'#a6aea2');rect(x+225,127,4,6,'#8e9e91');
 }
 for(let i=0;i<5;i++){const x=((i*285-travel*.18)%1425+1425)%1425-285;rect(x+64,13,100,5,'#b7beb5');rect(x+69,18,90,10,'#faf7dd');rect(x+65,29,98,3,'#d9d9bf');}
 rect(0,251,1000,104,'#d6d7c9');rect(0,350,1000,7,'#b2bbad');
 for(let i=0;i<6;i++){
  const x=((i*240-travel*.35)%1440+1440)%1440-240;
  if(i%3===2){
   // Filing cabinet and a potted plant.
   rect(x+23,274,70,76,'#a9b5a8');for(let j=0;j<3;j++){rect(x+28,279+j*23,60,19,'#c2c9b8');rect(x+52,285+j*23,13,3,'#879a8e');}
   rect(x+119,322,25,28,'#b59b7d');rect(x+129,279,4,46,'#819b78');for(let j=0;j<4;j++){rect(x+110+j%2*20,284+j*8,22,9,'#8fa480');rect(x+115+j%2*20,281+j*8,12,4,'#a2b18c');}
  }else{
   // Desk, CRT monitor, keyboard, mug and tucked office chair.
   rect(x+10,308,164,9,'#b99e7c');rect(x+19,317,7,33,'#9a9f8c');rect(x+157,317,7,33,'#9a9f8c');
   rect(x+70,266,52,35,'#8b9d96');rect(x+75,270,42,24,'#b6cbc1');rect(x+80,275,28,2,'#829f96');rect(x+80,280,20,2,'#829f96');rect(x+92,300,9,6,'#8b9d96');rect(x+82,305,30,3,'#8b9d96');
   rect(x+58,305,30,3,'#8e9f93');rect(x+144,295,10,13,'#e9e5d6');rect(x+153,298,4,6,'#e9e5d6');
   rect(x+35,315,29,13,'#879991');rect(x+41,328,21,6,'#879991');rect(x+48,334,4,13,'#879991');rect(x+32,347,36,3,'#9aa99b');
  }
 }
 // Carpet in the work area, a contrasting front aisle, and tile seams.
 rect(0,357,1000,63,'#b7c0af');for(let y=375;y<416;y+=20)rect(0,y,1000,1,'#afbba9');
 rect(0,420,1000,5,'#7d8a7d');rect(0,425,1000,75,'#bca98d');rect(0,425,1000,5,'#d1c0a2');
 for(let y=454;y<500;y+=30)rect(0,y,1000,2,'#a3917c');for(let i=0;i<14;i++){const x=((i*100-travel)%1400+1400)%1400-100;rect(x,430,2,70,'#aa9880');rect(x+4,433,88,2,'#c5b497');}
}
function drawArt(s,x,y,w,h){ctx.drawImage(s.image,s.x,s.y,s.w,s.h,Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function stack(o){const name=['stack-low','stack-medium','stack-high'][o.variant??[38,64,92].indexOf(o.h)]||'stack-low';drawArt(art[name],o.x,GROUND+STACK_DROP-o.h,o.w,o.h);}
function bonus(b){const y=b.y+Math.sin(worldClock*3+b.seed)*5;if(b.type==='btc'){const width=Math.max(4,Math.abs(Math.cos(worldClock*5+b.seed))*31);drawArt(art.bitcoin,b.x-width/2,y-19,width,38);}else{drawArt(art.check,b.x-16,y-24,32,48);}}
function runner(){rect(PLAYER_X-28,423,56,3,'#647a5c');if(state==='over'||(state==='crash'&&crashTime>=REVEAL_AT))return;if(p.grounded){const s=frames[RunnerGait.sample(runTravel)],scale=RunnerGait.height*WORLD_SCALE/(s.h*.90);ctx.drawImage(s.image,s.x,s.y,s.w,s.h,Math.round(PLAYER_X-s.w*RunnerGait.rootX*scale),Math.round(GROUND-s.h*RunnerGait.groundY*scale),Math.round(s.w*scale),Math.round(s.h*scale));}else{const s=jumpFrame,scale=170/(hero.height*.93)*WORLD_SCALE*1.15;ctx.drawImage(s.image,s.x,s.y,s.w,s.h,Math.round(PLAYER_X-s.w*scale/2),Math.round(GROUND-p.y-s.h*scale),Math.round(s.w*scale),Math.round(s.h*scale));}}
function desk(){
 // Place the supplied scene at the impact point, retaining the frozen world.
 const scene=art.desk,w=310,h=w*scene.h/scene.w,x=Math.max(14,Math.min(1000-w-14,crashX-150)),y=GROUND-h+DESK_DROP;
 drawArt(scene,x,y,w,h);
 // Alternate small, clipped hand patches from the supplied drawing.
 const source=artwork.desk,scale=w/scene.w,tap=Math.floor(clock*10)%2;
 for(const [sx,sy,sw,sh,dy] of [[735,391,68,38,tap?2:0],[814,376,70,51,tap?0:2]]){
  ctx.save();ctx.beginPath();ctx.rect(x+(sx-scene.x)*scale,y+(sy-scene.y)*scale-2*scale,sw*scale,sh*scale+4*scale);ctx.clip();
  ctx.drawImage(source,sx,sy,sw,sh,x+(sx-scene.x)*scale,y+(sy-scene.y+dy)*scale,sw*scale,sh*scale);ctx.restore();
 }
 if(state!=='over')return;
 const titleW=340,titleH=titleW*art['gameover-title'].h/art['gameover-title'].w;
 const titleX=(1000-titleW)/2,titleY=50;
 drawArt(art['gameover-title'],titleX,titleY,titleW,titleH);
 PixelText(ctx,'USD '+score,titleX+titleW/2,titleY+titleH+12,2.5,'#293c31',true);
}
function draw(){ctx.imageSmoothingEnabled=false;background();for(const o of obstacles)stack(o);for(const b of bonuses)bonus(b);if(ready){ctx.save();if(state==='crash'){ctx.translate(PLAYER_X,GROUND);ctx.rotate(-Math.min(crashTime,.25)*1.4);ctx.translate(-PLAYER_X,-GROUND);}runner();ctx.restore();}if(state==='over'||(state==='crash'&&crashTime>=REVEAL_AT))desk();for(const q of papers){ctx.save();ctx.translate(Math.round(q.x),Math.round(q.y));ctx.rotate(q.a);rect(-q.w/2,-4,q.w,9,'#f9f3df');rect(-q.w/2+2,-1,q.w-4,1,'#a3b0a5');ctx.restore();}for(const q of popups)PixelText(ctx,'+'+q.points,q.x,q.y,2,'#466f49',true);
smoke();
ctx.font='bold 16px monospace';ctx.fillStyle='#344436';ctx.textBaseline='top';ctx.textAlign='left';ctx.fillText(String(Math.floor(travel/36)).padStart(5,'0')+' м',22,18);ctx.textAlign='right';ctx.fillText(score+' USD',978,18);ctx.textAlign='left';
const status=!ready?'Загрузка':state==='over'?'Погряз в правках':state==='crash'?'Столкновение':'Бег';if($('#status').textContent!==status)$('#status').textContent=status;
if(!ready){ctx.textAlign='center';ctx.fillText('Загрузка…',500,240);ctx.textAlign='left';}}
function puff(x,y,r,color){
 // Four-pixel steps keep the billowing silhouette in the game's pixel style.
 for(let dy=-r;dy<=r;dy+=4){const half=Math.round(Math.sqrt(Math.max(0,r*r-dy*dy))/4)*4;rect(x-half,y+dy,half*2,4,color);}
}
function smoke(){if(state!=='crash')return;const t=crashTime*2,grow=1-Math.exp(-t*10),fade=Math.max(0,1-Math.max(0,t-1.0)/1.1);ctx.save();ctx.globalAlpha=fade;
for(const c of clouds){const spread=c.reach*grow,x=crashX+35+Math.cos(c.angle)*spread,y=GROUND-95+Math.sin(c.angle)*spread*.7-Math.max(0,t-.4)*14,r=c.radius*(.7+grow*.5);puff(x,y,r,'#bcc2b5');puff(x-5,y-7,r*.84,'#e3e5d5');puff(x-8,y-13,r*.63,'#f7f2df');}
// Sheets burst visibly in front of the smoke, without fire.
for(let i=0;i<papers.length;i+=3){const q=papers[i];ctx.save();ctx.translate(Math.round(q.x),Math.round(q.y));ctx.rotate(q.a);rect(-8,-5,16,10,'#fff6e2');rect(-5,-1,10,1,'#9ca99c');ctx.restore();}
ctx.restore();}

function loop(t){if(!last)last=t;const dt=Math.min((t-last)/1000,.05);last=t;if(!document.hidden&&ready){acc+=dt;while(acc>=1/120){update(1/120);acc-=1/120;}}draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);
