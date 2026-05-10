// Lachlan Hodge's (lrhodge) asgn2.js

// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    }
  `

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  uniform sampler2D u_sampler0;
  uniform sampler2D u_sampler1;
  uniform int u_whichTex;
  varying vec2 v_UV;

  void main() {

    if(u_whichTex == -2){
      gl_FragColor = u_FragColor;
    } else if(u_whichTex == -1){
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if(u_whichTex == 0){
      gl_FragColor = texture2D(u_sampler0, v_UV);
    } else if(u_whichTex == 1){
      gl_FragColor = texture2D(u_sampler1, v_UV);
    } else {
      gl_FragColor = vec4(1.0,.2,.2,1);  
    }

  }`

// global variables
// canvas and webGL
let canvas;
let gl;
let u_FragColor;
let a_Position;
let a_UV;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ProjectionMatrix;
let u_whichTex;
let u_sampler0;

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
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
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
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix){
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  var projMatrix = new Matrix4();
  projMatrix.setPerspective(70, canvas.width / canvas.height, 0.1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMatrix.elements);

  u_sampler0 = gl.getUniformLocation(gl.program, 'u_sampler0');
  if (!u_sampler0) {
    console.log('Failed to get the storage location of u_sampler0');
    return false;
  }
  u_whichTex = gl.getUniformLocation(gl.program, 'u_whichTex');
  if (!u_whichTex) {
    console.log('Failed to get the storage location of u_whichTex');
    return false;
  }
}

function main() {
  setupWebGL();
  connectVarGLSL();

  //initialize canvas.
  gl.clearColor(0.0, 0.0, 0.0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  actionsHTMLUI();
  setShapes();
  cameraHandler();

  initTextures();

  requestAnimationFrame(tick);
}

var g_startTime = performance.now();
var g_seconds = (performance.now() - g_startTime) / 1000;
var t_last = performance.now();

function tick(){
  const now = performance.now();
  g_seconds = (now - g_startTime) / 1000;

  var dt = (now - t_last) / 1000;
  t_last = now;

  movementHandler(dt);
  updateCam();
  renderShapes();
  // console.log(g_camPos);

  requestAnimationFrame(tick);
}

function actionsHTMLUI(){
    document.getElementById("Reset").onclick = () => {rotMatrix = new Matrix4(); g_pitch = 0; g_yaw = 90; g_camPos = [-1,1.5,.5]; } 
}

function sendTextToHTML(text, htmlID){
  var htmlEl = document.getElementById(htmlID);
  if(!htmlID){
    console.log("Failed to get "+ htmlID+" from HTML")
    return;
  }
  htmlEl.innerHTML = text;
}
