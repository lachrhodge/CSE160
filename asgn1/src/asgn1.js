// ColoredPoint.js (c) 2012 matsuda (Rewritten)
// Lachlan Hodge's (lrhodge) asgn1.js

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_size;
  }
  `

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// global variables
// canvas and webGL
let canvas;
let gl;
let u_FragColor;
let a_Position;
let u_size;

// UI elements
var g_shapes = [];  // The array for the position of a mouse press
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_mode = 0;
let g_segments = 3;

function setupWebGL(){ // 
  canvas = document.getElementById('webgl'); // Retrieve <canvas> elemment
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true}); // Get the rendering context for WebGL
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVarGLSL(){ // compressed down bc I don't want to look at it
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) { // Initialize shaders
    console.log('Failed to intialize shaders.');
    return;
  }
  a_Position = gl.getAttribLocation(gl.program, 'a_Position'); // Get the stored loc. of a_Position
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor'); // Get the storage location of u_FragColor
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  u_size = gl.getUniformLocation(gl.program, 'u_size');
  if (!u_size) {
    console.log('Failed to get the storage location of u_size')
    return;
  }
}

function main() {
  setupWebGL();
  connectVarGLSL();

  // handling changing sliders and the like.
  actionsHTMLUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {if (ev.buttons == 1) click(ev);};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function click(ev) {
  let [x,y] = convertCoords(ev); 
  
  let point;
  switch(g_mode){
    case 0:
      point = new Point();
      break;
    case 1:
      point = new Triangle();
      break;
    case 2:
      point = new Circle(g_segments);
      break;
  }

  point.pos = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;

  g_shapes.push(point)
  
  renderShapes();
  //point.render();
}

function convertCoords(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return [x,y];
}

function renderShapes(){
  var len = g_shapes.length;
  gl.clear(gl.COLOR_BUFFER_BIT);
  for(var i = 0; i < len; i++) {

    g_shapes[i].render();

    /*
    var xy = g_points[i];
    var rgba = g_colors[i];
    var size = g_sizes[i];

    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniform1f(u_size, size);

    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
    */
  }
}

function actionsHTMLUI(){
  // color
  document.getElementById("red").addEventListener("input", function() { g_selectedColor[0] = Number(this.value)/100; });
  document.getElementById("green").addEventListener("input", function() { g_selectedColor[1] = Number(this.value)/100; });
  document.getElementById("blue").addEventListener("input", function() { g_selectedColor[2] = Number(this.value)/100; });

  // size and segments
  document.getElementById("size").addEventListener("input", function() { g_selectedSize = Number(this.value); });
  document.getElementById("numSeg").addEventListener("input", function() { g_segments = Number(this.value);  });

  // drawing mode (shape select)
  document.getElementById("sqr").onclick = function() {g_mode = 0;};
  document.getElementById("tri").onclick = function() {g_mode = 1;};
  document.getElementById("cir").onclick = function() {g_mode = 2;};

  // clear function
  document.getElementById("ctrll").onclick = function() { g_shapes = []; renderShapes(); };
}

