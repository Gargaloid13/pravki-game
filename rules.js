(function(root){
const BASE_SPEED=250,MAX_METERS=1500,PIXELS_PER_METER=36;
function speed(meters){return BASE_SPEED*(1+3*Math.min(1,Math.max(0,meters)/MAX_METERS));}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function playerBox(x,ground,height){return {x:x-14,y:ground-height-105,w:28,h:Math.max(22,105-(height>0?16:0))};}
function obstacleShape(variant){return {variant,w:[80,64,58][variant],h:[38,64,92][variant]};}
function nextObstacle(x,v,r=Math.random){return {x:x+v*(1.25+r()*.65)+70,...obstacleShape(Math.floor(r()*3))};}
function bonusValue(type){return type==='btc'?100:10;}
const api={BASE_SPEED,MAX_METERS,PIXELS_PER_METER,speed,overlap,playerBox,nextObstacle,bonusValue};root.RunnerRules=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
