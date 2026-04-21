// Lachlan Hodge's (lrhodge) asgn2.js

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;

  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_xrotate = 0; // rotate arond x
let g_yrotate = 0; // rotate around y
let g_jointAngle = 30;
let rotationCap = 90;

function setupWebGL(){ // 
  canvas = document.getElementById('webgl'); // Retrieve <canvas> elemment
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true}); // Get the rendering context for WebGL
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
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
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix')
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix')
    return;
  }
}

function main() {
  setupWebGL();
  connectVarGLSL();

  //initialize canvas.
  gl.clearColor(0.0, 0.0, 0.0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  camera();

  renderShapes();
  actionsHTMLUI();
}

function convertCoords(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return [x,y];
}

function actionsHTMLUI(){
  //document.getElementById("rotSlider").addEventListener("mousemove", function() { g_yrotate = Number(this.value); renderShapes(); });
  document.getElementById("joint").addEventListener("mousemove", function() { g_jointAngle = Number(this.value); renderShapes(); });
  document.getElementById("CamReset").onclick = () => {g_yrotate = 0; g_xrotate = 0; renderShapes();};
  document.getElementById("CamLeft").onclick = () => {g_yrotate = -90; g_xrotate = 0; renderShapes();};
  document.getElementById("CamRight").onclick = () => {g_yrotate = 90; g_xrotate = 0; renderShapes();};
}

function camera(){
  let isDragging = false;
  let lastX, lastY;

  canvas.addEventListener('mousedown', (ev) => {
    isDragging = true;
    lastX = ev.clientX;
    lastY = ev.clientY;
  }); // learned what `(ev) => {...}` is, basically a function(ev) {...}; 

  canvas.addEventListener('mousemove', (ev) => {
    if (!isDragging) return;

    const dx = ev.clientX - lastX;  // delta since last frame
    const dy = ev.clientY - lastY;

    // Apply dx/dy to your camera or object here
    g_yrotate   -= dx * 0.5;
    g_xrotate   += dy * 0.5;

    lastX = ev.clientX;  // update for next frame
    lastY = ev.clientY;

    g_xrotate = Math.max(-70, Math.min(70, g_xrotate));

    renderShapes();
  });

  window.addEventListener('mouseup', () => {isDragging = false;});
}

function renderShapes(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var rotMatrix = new Matrix4().rotate(g_yrotate,0,1,0);
  rotMatrix.rotate(g_xrotate,1,0,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, rotMatrix.elements);

  var body = new Cube();
  body.color = [0.265,0.265,0.647,1.0];
  body.matrix.rotate(5,1,0,0); // angle and which axes rotate
  body.matrix.scale(.25,.2,.5);
  body.matrix.translate(-.5,-.5,0);
  body.render();

  var neck = new Cube();
  neck.color = [0.265,0.265,0.647,1.0];
  neck.matrix.rotate(-8,1,0,0);
  neck.matrix.scale(.125,.325,.125);
  neck.matrix.translate(-.5,0,0);
  neck.render();

  var beak = new Wedge();
  beak.color = [0,1,1,1];
  beak.matrix.rotate(30,1,0,0);
  beak.matrix.scale(.125,.125,.125);
  beak.render();
}
