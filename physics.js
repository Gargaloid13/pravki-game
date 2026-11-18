(function(root){
const config={speed:250,impulse:440,gravity:1550,holdGravity:420,maxHold:.32,releaseSpeed:180};
function create(){return {y:0,v:0,grounded:true,held:false,hold:0,time:0,apex:0,lastHeight:0,lastDistance:0};}
function press(p){if(p.held)return;p.held=true;if(p.grounded){p.grounded=false;p.v=config.impulse;p.hold=0;p.time=0;p.apex=0;}}
function release(p){p.held=false;if(p.hold<config.maxHold&&p.v>config.releaseSpeed)p.v=config.releaseSpeed;}
function step(p,dt){if(p.grounded)return;p.time+=dt;p.hold+=dt;const g=p.held&&p.hold<=config.maxHold&&p.v>0?config.holdGravity:config.gravity;p.v-=g*dt;p.y+=p.v*dt;p.apex=Math.max(p.apex,p.y);if(p.y<=0){p.y=0;p.v=0;p.grounded=true;p.lastHeight=p.apex;p.lastDistance=p.time*config.speed;}}
root.RunnerPhysics={config,create,press,release,step};if(typeof module!=='undefined')module.exports=root.RunnerPhysics;
})(globalThis);
