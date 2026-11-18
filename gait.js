// Six distinct poses form two mirrored steps. The unused sheet cells repeat
// the forward leg and break the cycle; more images are not more animation.
(function(root){
const gait={
  // contact near, support near, toe-off near / contact far, support far, toe-off far
  cells:[0,1,6,4,5,2],
  columns:4,rows:2,
  stride:136,
  // All cells use this root and ground line, never a moving foot's bounding box.
  rootX:.48,groundY:.95,height:170,
  sample(distance){const phase=((distance/this.stride)%1+1)%1;return this.cells[Math.floor(phase*this.cells.length)];}
};
root.RunnerGait=gait;if(typeof module!=='undefined')module.exports=gait;
})(globalThis);
