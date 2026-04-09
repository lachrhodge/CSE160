// Lachlan Hodge's asgn1.js

var canvas = document.getElementById('example');
var ctx = canvas.getContext('2d');

function main() {  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  }
  clearCanvas();
}

function clearCanvas(){
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, 400, 400);
}

function paint(v, color){
  
}
