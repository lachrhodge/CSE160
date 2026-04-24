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
let g_locked = true;

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

function actionsHTMLUI(){
  //document.getElementById("rotSlider").addEventListener("mousemove", function() { g_yrotate = Number(this.value); renderShapes(); });
  //document.getElementById("joint").addEventListener("mousemove", function() { g_jointAngle = Number(this.value); renderShapes(); });
  document.getElementById("CamReset").onclick = () => {g_yrotate = 0; g_xrotate = 0; renderShapes();};
  document.getElementById("CamLeft").onclick = () => {g_yrotate = -90; g_xrotate = 0; renderShapes();};
  document.getElementById("CamRight").onclick = () => {g_yrotate = 90; g_xrotate = 0; renderShapes();};
  document.getElementById("lockY").onclick = () => {g_locked = !g_locked;};
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
    if(!g_locked){
      g_xrotate   -= dy * 0.5;
    }
    g_yrotate   -= dx * 0.5;

    lastX = ev.clientX;  // update for next frame
    lastY = ev.clientY;

    g_xrotate = Math.max(-70, Math.min(70, g_xrotate));

    renderShapes();
  });

  window.addEventListener('mouseup', () => {isDragging = false;}); // window bc if mouse leaves canvas, then unclick, it will not trigger.
}

function renderShapes(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var rotMatrix = new Matrix4().rotate(g_yrotate,0,1,0);
  rotMatrix.rotate(g_xrotate,1,0,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, rotMatrix.elements);

  var floor = new Cube();
  floor.color = [.4,.3,.2,1];
  floor.matrix.scale(1.42,1,1.42);
  floor.matrix.translate(-.5,-1.5,-.5);
  floor.render()

  var body = new Cube();
  body.color = [0.265,0.265,0.647,1.0];
  body.matrix.translate(-.125,-.1,-.07);
  var bodyMatrix = body.matrix;
  body.matrix.rotate(30,1,0,0);
  body.matrix.scale(.25,.2,.5);
  body.render();

  var legStump1 = new Cube();
  legStump1.color = [0.265,0.265,0.647,1.0];
  legStump1.matrix.scale(.09,.15,.09);
  legStump1.matrix.translate(.5,-2.25,1.7);
  legStump1.render();
  var legStump2 = new Cube();
  legStump2.color = [0.265,0.265,0.647,1.0];
  legStump2.matrix.scale(.09,.15,.09);
  legStump2.matrix.translate(-1.5,-2.25,1.7);
  legStump2.render();
  
  var neckBase = new Cube();
  neckBase.color = [0.205,0.205,0.607,1.0];
  neckBase.matrix = new Matrix4(bodyMatrix);
  //neckBase.matrix.rotate(180,0,1,0);
  neckBase.matrix.translate(.25,.01,0);
  neckBase.matrix.rotate(-15, 1,0,0);
  neckBase.matrix.scale(.5,1.45,.25);
  neckBase.render();
  var baseMatrix = neckBase.matrix;

  var neckShaft = new Cube();
  neckShaft.color = [0.265,0.265,0.647,1.0];
  neckShaft.matrix = new Matrix4(bodyMatrix);


  var tailNib0 = new Wedge();
  tailNib0.color = [0.265,0.647,0.265,1.0];
  tailNib0.matrix = new Matrix4(bodyMatrix);
  tailNib0.matrix.translate(.375, 1,1.5);
  tailNib0.matrix.scale(.25,.25,-1);
  var nibMatrix = tailNib0.matrix;
  tailNib0.render();


}
