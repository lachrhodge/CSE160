

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
  uniform sampler2D u_sampler2;
  uniform sampler2D u_sampler3;
  uniform sampler2D u_sampler4;
  uniform sampler2D u_sampler5;
  uniform int u_whichTex;
  varying vec2 v_UV;

  void main() {

    if(u_whichTex == -2){
      gl_FragColor = u_FragColor;
    } else if(u_whichTex == -1){
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if(u_whichTex == 0){
      gl_FragColor = texture2D(u_sampler0, v_UV) * u_FragColor;
    } else if(u_whichTex == 1){
      gl_FragColor = texture2D(u_sampler1, v_UV) * u_FragColor;
    } else if(u_whichTex == 2){
      gl_FragColor = texture2D(u_sampler2, v_UV) * u_FragColor;
    } else if(u_whichTex == 4){
      gl_FragColor = texture2D(u_sampler4, v_UV) * u_FragColor;
    } else if(u_whichTex == 3){
      gl_FragColor = texture2D(u_sampler3, v_UV) * u_FragColor; 
    } else if(u_whichTex == 5){
      gl_FragColor = texture2D(u_sampler5, v_UV) * u_FragColor; 
    } else {
      gl_FragColor = vec4(1.0,.2,.2,1);  
    }

  }`

// canvas and webGL
let canvas;
let gl;
let fov = 70;
let u_FragColor;
let a_Position;
let a_UV;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ProjectionMatrix;
let u_whichTex;
let u_sampler0;
let u_sampler1;
let u_sampler2;
let u_sampler3;
let u_sampler4;

let g_party = false;
const g_defaultPos = [-1,1.5,0];
let g_nearButton = false;
const dot = document.getElementById("circle");
let g_activeList = [];

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
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor'); // Get the storage location of u_FragColor
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  u_sampler0 = gl.getUniformLocation(gl.program, 'u_sampler0');
  u_sampler1 = gl.getUniformLocation(gl.program, 'u_sampler1');
  u_sampler2 = gl.getUniformLocation(gl.program, 'u_sampler2');
  u_sampler3 = gl.getUniformLocation(gl.program, 'u_sampler3');
  u_sampler4 = gl.getUniformLocation(gl.program, 'u_sampler4');
  u_sampler5 = gl.getUniformLocation(gl.program, 'u_sampler5');
  u_whichTex = gl.getUniformLocation(gl.program, 'u_whichTex');

  var projMatrix = new Matrix4();
  projMatrix.setPerspective(fov, canvas.width / canvas.height, 0.1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMatrix.elements);
}

function main() {
  setupWebGL();
  connectVarGLSL();


  //initialize canvas.
  gl.clearColor(0.0, 0.0, 0.0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  actionsHTMLUI();
  cameraHandler();

  initTextures();
  setShapes();

  buttonListener();

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

  hue = (g_seconds / 4 * 360) % 360;
  g_RGB = HSVtoRGB(hue);

  // button checks
  g_nearButton = b1.isNear(g_camPos);

  if(g_nearButton){
    dot.style.background = "yellow";
  } else {
    dot.style.background = "transparent";
  }
  
  var duration = performance.now() - now;
  sendTextToHTML(" ms: " + Math.floor(duration)+" fps: "+ Math.floor(1/dt), "metrics");
  sendTextToHTML("Buttons found: "+ g_activeList.length+"/5", "buttCount");
  requestAnimationFrame(tick);
}

function actionsHTMLUI(){
  document.getElementById("Reset").onclick = () => {rotMatrix = new Matrix4(); g_pitch = 0; g_yaw = 90; g_camPos = [...g_defaultPos]; } 
  document.querySelector("#WoolBox").onclick = () => {g_party = !g_party;}
  document.getElementById("fovSlider").addEventListener("mousemove", (event) => {
    fov = Number(event.target.value);
    var projMatrix = new Matrix4();
    projMatrix.setPerspective(fov, canvas.width / canvas.height, 0.1, 1000);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMatrix.elements);
  });
}

function buttonListener(){
  document.addEventListener("keydown", (event) => {
    if (event.key === "f") {
      if(b1.isNear(g_camPos) && b1.activate()) g_activeList.push(b1);
      if(b2.isNear(g_camPos) && b2.activate()) g_activeList.push(b2);
      if(b3.isNear(g_camPos) && b3.activate()) g_activeList.push(b3);
      if(b4.isNear(g_camPos) && b4.activate()) g_activeList.push(b4);
      if(b5.isNear(g_camPos) && b5.activate()) g_activeList.push(b5);
      WIN();
    }
  });
}

function WIN(){
  if(g_activeList.length >= 5){
    window.location.replace("https://www.youtube.com/watch?v=QDia3e12czc");
    //window.location.href = "https://youtu.be/dQw4w9WgXcQ?si=0oz9HEph8dWB8xcq";
  }
}

function sendTextToHTML(text, htmlID){
  var htmlEl = document.getElementById(htmlID);
  if(!htmlID){
    console.log("Failed to get "+ htmlID+" from HTML")
    return;
  }
  htmlEl.innerHTML = text;
}
