// Lachlan Hodge's (lrhodge) asgn2.js

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ProjectionMatrix;

let g_vrotate = 20; // rotate arond x
let g_yrotate = 180; // rotate around y
let g_jointAngle = 30;
let rotationCap = 90;
let g_locked = true;
let g_camDist = 1.5;

// joints
let g_tailAngle = 0;

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
  // this came about bc I was having issues with my orbital camera
  // which originally only rotated around x and y axes.
  // without projMatrix, there was major clipping and objects not rendering properly
  // had some help with Claude.
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
  document.getElementById("CamReset").onclick = () => {g_yrotate = 180; g_vrotate = 20; renderShapes();};
  document.getElementById("CamLeft").onclick = () => {g_yrotate = -90; g_vrotate = 0; renderShapes();};
  document.getElementById("CamRight").onclick = () => {g_yrotate = 90; g_vrotate = 0; renderShapes();};
  document.getElementById("lockY").onclick = () => {g_locked = !g_locked;};
  document.getElementById("tail").addEventListener("mousemove", function() { g_tailAngle = -1 * Number(this.value); renderShapes(); });
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
      g_vrotate   -= dy * 0.5;
    }

    g_yrotate   -= dx * 0.5;
    g_vrotate = Math.max(-70, Math.min(70, g_vrotate));

    lastX = ev.clientX;  // update for next frame
    lastY = ev.clientY;

    renderShapes();
  });

  window.addEventListener('mouseup', () => {isDragging = false;});
  // window bc if mouse leaves canvas, then unclick, it will not trigger.
}

function renderShapes(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // convert to radians for Math.sin()/cos();
  var yr = g_yrotate * Math.PI/180;
  var vr = g_vrotate * Math.PI/180;

  var camX = g_camDist * Math.cos(vr) * Math.sin(yr);
  var camY = g_camDist * Math.sin(vr);
  var camZ = g_camDist * Math.cos(vr) * Math.cos(yr);
  
  var rotMatrix = new Matrix4().setLookAt(
    camX, camY, camZ,
    0,    0,    0,
    0,    1,    0
  );

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, rotMatrix.elements);

  var floor = new Cube();
  floor.color = [.4,.3,.2,1];
  floor.matrix.scale(2.5,.25,2.5);
  floor.matrix.translate(-.5,-3,-.5);
  floor.render()

  var body = new Cube();
  body.color = [0.265,0.265,0.647,1.0];
  body.matrix.rotate(30,1,0,0);
  var bodyMatrix = new Matrix4(body.matrix);
  body.matrix.scale(.25,.2,.5);
  body.matrix.translate(-.5,-.5,-.07);
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
  neckBase.matrix.rotate(-40,1,0,0);
  var baseMatrix = new Matrix4(neckBase.matrix);
  neckBase.matrix.scale(.10,.25,.125);
  neckBase.matrix.translate(-.5,-.1,-.4);
  neckBase.render();

  var neckShaft = new Cube();
  neckShaft.color = [0.165,0.165,0.547,1.0];
  neckShaft.matrix = baseMatrix;
  neckShaft.matrix.rotate(8,1,0,0);
  var shaftMat = new Matrix4(neckShaft.matrix);
  neckShaft.matrix.scale(.08,.23,.09);
  neckShaft.matrix.translate(-.5,.7,-0.8);
  neckShaft.render();

  var head = new Cube();
  neckShaft.color = [0.265,0.265,0.647,1.0];
  neckShaft.matrix = shaftMat;
  head.matrix.scale(.2,.2,.2);
  //head.matrix.translate(.2,.2,.2);
  head.render();


  // tail feathers
  //-------------------------------------------------
  var tailNib0 = new Wedge();
  tailNib0.color = [0.265,0.647,0.265,1.0];
  tailNib0.matrix = new Matrix4(bodyMatrix);
  tailNib0.matrix.translate(0,0,0.275);
  tailNib0.matrix.rotate(g_tailAngle,1,0,0);
  tailNib0.matrix.translate(0,0,-0.275);
  nib0Mat = new Matrix4(tailNib0.matrix);
  tailNib0.matrix.translate(-.05,.1,.75);
  tailNib0.matrix.scale(.1,.025,-.4);
  tailNib0.render();

  var tailMid0 = new Cube();
  tailMid0.color = [0.265,0.647,0.265,1.0];
  tailMid0.matrix = nib0Mat;

  tailMid0.matrix.translate(-0.05,0.1,0.75);
  tailMid0.matrix.rotate(0.6 * g_tailAngle,1,0,0);
  var mid0Mat = new Matrix4(tailMid0.matrix);
  tailMid0.matrix.scale(.1,.025,.2);
  tailMid0.render();

  var tailEnd0 = new Cube();
  tailEnd0.color = [0.665,0.500,0.665,1.0];
  tailEnd0.matrix = mid0Mat;

  tailEnd0.matrix.translate(0,0,0.2);
  tailEnd0.matrix.rotate(0.3 * g_tailAngle,1,0,0);
  tailEnd0.matrix.scale(.1,.025,.2);
  tailEnd0.render();

//-------------------------------------------------

  var tailNibl1 = new Wedge();
  tailNibl1.color = [0.265,0.647,0.265,1.0];
  tailNibl1.matrix = new Matrix4(bodyMatrix);

  tailNibl1.matrix.translate(0,0,0.275);
  tailNibl1.matrix.rotate(g_tailAngle,1,0,0);
  tailNibl1.matrix.translate(0,0,-0.275);

  tailNibl1.matrix.rotate(8,0,1,0);
  var nibl1Mat = new Matrix4(tailNibl1.matrix);
  tailNibl1.matrix.translate(-.06,.1,.75);
  tailNibl1.matrix.scale(.1,.025,-.4);
  tailNibl1.render();

  var tailMidl1 = new Cube();
  tailMidl1.color = [0.265,0.647,0.265,1.0];
  tailMidl1.matrix = nibl1Mat;

  tailMidl1.matrix.translate(-0.05,0.1,0.75);
  tailMidl1.matrix.rotate(0.6 * g_tailAngle,1,0,0);
  var midl1Mat = new Matrix4(tailMidl1.matrix);
  tailMidl1.matrix.scale(.1,.025,.2);
  tailMidl1.render();

  var tailEndl1 = new Cube();
  tailEndl1.color = [0.665,0.500,0.665,1.0];
  tailEndl1.matrix = midl1Mat;

  tailEndl1.matrix.translate(0,0,0.2);
  tailEndl1.matrix.rotate(0.3 * g_tailAngle,1,0,0);
  tailEndl1.matrix.scale(.1,.025,.2);
  tailEndl1.render();

//-------------------------------------------------

  var tailNibl2 = new Wedge();
  tailNibl2.color = [0.265,0.647,0.265,1.0];
  tailNibl2.matrix = new Matrix4(bodyMatrix);

  tailNibl2.matrix.translate(0,0,0.275);
  tailNibl2.matrix.rotate(g_tailAngle,1,0,0);
  tailNibl2.matrix.translate(0,0,-0.275);

  tailNibl2.matrix.rotate(16,0,1,0);
  var nibl2Mat = new Matrix4(tailNibl2.matrix);
  tailNibl2.matrix.translate(-.06,.1,.75);
  tailNibl2.matrix.scale(.1,.025,-.4);
  tailNibl2.render();

  var tailMidl2 = new Cube();
  tailMidl2.color = [0.265,0.647,0.265,1.0];
  tailMidl2.matrix = nibl2Mat;

  tailMidl2.matrix.translate(-0.05,0.1,0.75);
  tailMidl2.matrix.rotate(0.6 * g_tailAngle,1,0,0);
  var midl2Mat = new Matrix4(tailMidl2.matrix);
  tailMidl2.matrix.scale(.1,.025,.2);
  tailMidl2.render();

  var tailEndl2 = new Cube();
  tailEndl2.color = [0.665,0.500,0.665,1.0];
  tailEndl2.matrix = midl2Mat;

  tailEndl2.matrix.translate(0,0,0.2);
  tailEndl2.matrix.rotate(0.3 * g_tailAngle,1,0,0);
  tailEndl2.matrix.scale(.1,.025,.2);
  tailEndl2.render();

//-------------------------------------------------

  var tailNibr1 = new Wedge();
  tailNibr1.color = [0.265,0.647,0.265,1.0];
  tailNibr1.matrix = new Matrix4(bodyMatrix);

  tailNibr1.matrix.translate(0,0,0.275);
  tailNibr1.matrix.rotate(g_tailAngle,1,0,0);
  tailNibr1.matrix.translate(0,0,-0.275);

  tailNibr1.matrix.rotate(-8,0,1,0);
  var nibr1Mat = new Matrix4(tailNibr1.matrix);
  tailNibr1.matrix.translate(-.06,.1,.75);
  tailNibr1.matrix.scale(.1,.025,-.4);
  tailNibr1.render();

  var tailMidr1 = new Cube();
  tailMidr1.color = [0.265,0.647,0.265,1.0];
  tailMidr1.matrix = nibr1Mat;

  tailMidr1.matrix.translate(-0.05,0.1,0.75);
  tailMidr1.matrix.rotate(0.6 * g_tailAngle,1,0,0);
  var midr1Mat = new Matrix4(tailMidr1.matrix);
  tailMidr1.matrix.scale(.1,.025,.2);
  tailMidr1.render();

  var tailEndr1 = new Cube();
  tailEndr1.color = [0.665,0.500,0.665,1.0];
  tailEndr1.matrix = midr1Mat;

  tailEndr1.matrix.translate(0,0,0.2);
  tailEndr1.matrix.rotate(0.3 * g_tailAngle,1,0,0);
  tailEndr1.matrix.scale(.1,.025,.2);
  tailEndr1.render();

//-------------------------------------------------

  var tailNibr2 = new Wedge();
  tailNibr2.color = [0.265,0.647,0.265,1.0];
  tailNibr2.matrix = new Matrix4(bodyMatrix);

  tailNibr2.matrix.translate(0,0,0.275);
  tailNibr2.matrix.rotate(g_tailAngle,1,0,0);
  tailNibr2.matrix.translate(0,0,-0.275);

  tailNibr2.matrix.rotate(-16,0,1,0);
  var nibr2Mat = new Matrix4(tailNibr2.matrix);
  tailNibr2.matrix.translate(-.06,.1,.75);
  tailNibr2.matrix.scale(.1,.025,-.4);
  tailNibr2.render();

  var tailMidr2 = new Cube();
  tailMidr2.color = [0.265,0.647,0.265,1.0];
  tailMidr2.matrix = nibr2Mat;

  tailMidr2.matrix.translate(-0.05,0.1,0.75);
  tailMidr2.matrix.rotate(0.6 * g_tailAngle,1,0,0);
  var midr2Mat = new Matrix4(tailMidr2.matrix);
  tailMidr2.matrix.scale(.1,.025,.2);
  tailMidr2.render();

  var tailEndr2 = new Cube();
  tailEndr2.color = [0.665,0.500,0.665,1.0];
  tailEndr2.matrix = midr2Mat;

  tailEndr2.matrix.translate(0,0,0.2);
  tailEndr2.matrix.rotate(0.3 * g_tailAngle,1,0,0);
  tailEndr2.matrix.scale(.1,.025,.2);
  tailEndr2.render();

}
