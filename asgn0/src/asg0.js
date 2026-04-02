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
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color

  /**
   * End of DrawRectangle.js code
   * Below is all student generated or repurposed from recordings
  */

  let v1 = new Vector3([25,25,0]); // v[0] is +x, x[1] is -y

  drawVector(v1, 'green');
  console.log(v1.elements);
}

function drawVector(v, color){
  let ceny = canvas.height / 2;
  let cenx = canvas.width / 2;

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(cenx, ceny);
  ctx.lineTo( cenx + v.elements[0] * 20, ceny + v.elements[1] * 20 );
  ctx.lineWidth = 2;
  ctx.stroke();
}
