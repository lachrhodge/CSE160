// DrawTriangle.js (c) 2012 matsuda
var canvas = document.getElementById('example');
// Get the rendering context for 2DCG
var ctx = canvas.getContext('2d');

function main() {  
  // Retrieve <canvas> element

  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  }

  // Draw a blue rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to BLACK
  ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color

  /**
   * End of DrawRectangle.js code
   * Below is all student generated or repurposed from recordings
  */

  let v1 = new Vector3([2.25,2.25,0]); // v[0] is +x, x[1] is -y

  drawVector(v1, 'red');
}

function drawVector(v, color){
  const drawScale = 20;
  let ceny = canvas.height / 2;
  let cenx = canvas.width / 2;

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(cenx, ceny);
  ctx.lineTo( cenx + v.elements[0] * drawScale, ceny + v.elements[1] * -1 * drawScale);
  ctx.lineWidth = 2;
  ctx.stroke();
}

function handleDrawEvent(){
  var vec1 = new Vector3();
  var vec2 = new Vector3();
  getVectors(vec1, vec2);

  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, 400, 400);

  drawVector(vec1, 'red');
  drawVector(vec2, 'blue');
}

function handleDrawOperationEvent(){
  var v1 = new Vector3();
  var v2 = new Vector3();
  getVectors(v1,v2);
  var C = document.getElementById('scalar').value;

  //console.log(document.getElementById('oper').value);

  switch(document.getElementById('oper').value){
    case 'add':
      drawVector(v1.add(v2), 'green');
      break;
    case 'sub':
      drawVector(v1.sub(v2), 'green');
      break;
    case 'mul':
      drawVector(v1.mul(C), 'green');
      drawVector(v2.mul(C), 'green');
      break;
    case 'div':
      drawVector(v1.div(C), 'green');
      drawVector(v2.div(C), 'green');
      break;
    case 'mag':
      console.log("Magnitude v1: ", (v1.magnitude()).toFixed(3));
      console.log("Magnitude v2: ", (v2.magnitude()).toFixed(3));
      break;
    case 'nor':
      drawVector(v1.normalize(), 'green');
      drawVector(v2.normalize(), 'green');
      break;
    case 'ang':
      var t = angleBetween(v1,v2);
      console.log("angle between:", (t * 180/Math.PI).toFixed(3), "(degrees) or", t.toFixed(3), "(radians)");
      break;
    case 'ara':
      console.log("Area of v1 and v2 triangle:", areaTriangle(v1,v2));
  }
}

function angleBetween(v1, v2){
  var theta = Math.acos(Vector3.dot(v1,v2)/(v1.magnitude() * v2.magnitude()));
  return theta;
}

function areaTriangle(v1, v2){
  var v3 = new Vector3();

  v3 = Vector3.cross(v1,v2);

  return v3.magnitude() / 2;
}

// helper that sets vectors
function getVectors(v1,v2){
  v1.elements = [document.getElementById('v1x').value, document.getElementById('v1y').value,0];
  v2.elements = [document.getElementById('v2x').value,document.getElementById('v2y').value,0];
}