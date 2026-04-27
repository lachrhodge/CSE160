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

let g_animationMode = 'off';

// joints
let g_tailAngle = 0;
let g_neckBaF  =-40;
let g_neckStS  =  0;
let g_head     =  0;

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

  actionsHTMLUI();
  camera();

  renderShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick(){
  g_seconds = performance.now() / 1000.0 - g_startTime;
  //console.log(g_seconds);

  renderShapes();

  updateAnimAngles();
  requestAnimationFrame(tick);
}

function actionsHTMLUI(){
  document.getElementById("rotSlider").addEventListener("mousemove", function() { g_yrotate = Number(this.value); renderShapes(); });
  //document.getElementById("joint").addEventListener("mousemove", function() { g_jointAngle = Number(this.value); renderShapes(); });
  document.getElementById("CamReset").onclick = () => {g_yrotate = 180; g_vrotate = 20; renderShapes();};
  document.getElementById("CamLeft").onclick = () => {g_yrotate = -90; g_vrotate = 0; renderShapes();};
  document.getElementById("CamRight").onclick = () => {g_yrotate = 90; g_vrotate = 0; renderShapes();};
  document.getElementById("lockY").onclick = () => {g_locked = !g_locked;};
  document.getElementById("tail").addEventListener("mousemove", function() { g_tailAngle = -1 * Number(this.value); renderShapes(); });

  document.getElementById("On").onclick = () => {g_animationMode = 'tail';};
  document.getElementById("Off").onclick = () => {g_animationMode = 'off';};

  document.getElementById("Base").addEventListener("mousemove", function() { g_neckBaF = -1 * Number(this.value); renderShapes(); });
  document.getElementById("sts").addEventListener("mousemove", function() { g_neckStS = Number(this.value); renderShapes(); });
  document.getElementById("headswiv").addEventListener("mousemove", function() { g_head = Number(this.value); renderShapes(); });

  canvas.addEventListener('mousedown', (ev) => {
    if (ev.shiftKey) {
      g_animationMode = 'head';
      animStart = performance.now();
    }
  });
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
    document.getElementById("rotSlider").value = g_yrotate % 360;


    lastX = ev.clientX;  // update for next frame
    lastY = ev.clientY;

    renderShapes();
  });

  window.addEventListener('mouseup', () => {isDragging = false;});
  // window bc if mouse leaves canvas, then unclick, it will not trigger.
}

var animStart;
var animNow;
var animFlag = false;

function updateAnimAngles(){
  if(g_animationMode === 'tail'){
    g_tailAngle = -1 * Math.abs(70 * Math.sin(g_seconds))

    g_neckBaF = 290 - (35 * Math.sin(g_seconds));
    g_neckStS = 50 * Math.cos(g_seconds * 4.5);

  }
  else if(g_animationMode === 'head'){
    animNow = performance.now();
    if(animNow - animStart > 5000){
      //console.log("Howdy");
      animFlag = !animFlag;
    }

    if(animFlag){
      g_neckStS = 25 * Math.cos(g_seconds * 8);
      g_tailAngle = -35 * Math.abs(Math.cos(g_seconds*7));
    }

    g_head = 70 * Math.cos(g_seconds * 12);
    //g_tailAngle = -70 * ((g_seconds * 2 % 2) / 2);
    animNow += 500;
    if(animNow - animStart > 25000){
      g_animationMode = 'tail';
      animStart = animNow;
    }
  }
  else{
    g_tailAngle = -1 * Number(document.getElementById("tail").value);
    g_neckBaF = -1 * Number(document.getElementById("Base").value);
    g_neckStS = Number(document.getElementById("sts").value);
    g_head = Number(document.getElementById("headswiv").value);
  }
}



function renderShapes(){
  var startTime = performance.now();

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
  floor.matrix.translate(-.5,-3.72,-.5);
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

  var legSeg1 = new Cube();
  legSeg1.color = [193/255, 153/255, 97/255,1];
  legSeg1.matrix = new Matrix4(legStump1.matrix);
  legSeg1.matrix.translate(.25,-1,.25);
  legSeg1.matrix.scale(.5,1,.5);
  legSeg1.render();

  var legSeg1l = new Cube();
  legSeg1l.color = [193/255, 153/255, 97/255,1];
  legSeg1l.matrix = new Matrix4(legSeg1.matrix);
  
  legSeg1l.matrix.translate(0,-.5,0);
  legSeg1l.matrix.rotate(45,1,0,0);
  legSeg1l.matrix.translate(0,.5,0);

  legSeg1l.matrix.translate(0.125,-1.5,-0.25);
  legSeg1l.matrix.scale(.75,2,.35);
  legSeg1l.render();

  var foot1 = new Wedge();
  foot1.color = [193/255, 153/255, 97/255,1];
  foot1.matrix.scale(.05,.05, -.1);
  foot1.matrix.translate(1.35,-13.5,-1.5);
  foot1.render();

  var foot2 = new Wedge();
  foot2.color = [193/255, 153/255, 97/255,1];
  foot2.matrix.scale(.05,.05, -.1);
  foot2.matrix.translate(-2.25,-13.5,-1.5);
  foot2.render();

  var legStump2 = new Cube();
  legStump2.color = [0.265,0.265,0.647,1.0];
  legStump2.matrix.scale(.09,.15,.09);
  legStump2.matrix.translate(-1.5,-2.25,1.7);
  legStump2.render();

  var legSeg2 = new Cube();
  legSeg2.color = [193/255, 153/255, 97/255,1];
  legSeg2.matrix = new Matrix4(legStump2.matrix);
  legSeg2.matrix.translate(.25,-1,.25);
  legSeg2.matrix.scale(.5,1,.5);
  legSeg2.render();

  var legSeg2l = new Cube();
  legSeg2l.color = [193/255, 153/255, 97/255,1];
  legSeg2l.matrix = new Matrix4(legSeg2.matrix);
  
  legSeg2l.matrix.translate(0,-.5,0);
  legSeg2l.matrix.rotate(45,1,0,0);
  legSeg2l.matrix.translate(0,.5,0);

  legSeg2l.matrix.translate(0.125,-1.5,-0.25);
  legSeg2l.matrix.scale(.75,2,.35);
  legSeg2l.render();



  // head and neck
  var neckBase = new Cube();
  neckBase.color = [0.205,0.205,0.607,1.0];
  neckBase.matrix = new Matrix4(bodyMatrix);
  neckBase.matrix.rotate(g_neckBaF,1,0,0);
  var baseMatrix = new Matrix4(neckBase.matrix);
  neckBase.matrix.scale(.10,.25,.125);
  neckBase.matrix.translate(-.5,-.1,-.4);
  neckBase.render();

  var neckShaft = new Cube();
  neckShaft.color = [0.165,0.165,0.547,1.0];
  neckShaft.matrix = baseMatrix;
  neckShaft.matrix.rotate(8,1,0,0);
  neckShaft.matrix.translate(-.04,.19,-.07);

  neckShaft.matrix.translate(0.04,0,0);
  neckShaft.matrix.rotate(g_neckStS,0,0,1);
  neckShaft.matrix.translate(-0.04,0,0);

  var shaftMat = new Matrix4(neckShaft.matrix);
  neckShaft.matrix.scale(.08,.17,.09);
  neckShaft.render();

  var head = new Cube();
  head.color = [0.265,0.265,0.647,1.0];
  head.matrix = shaftMat;
  head.matrix.translate(0,0,0.1);
  head.matrix.rotate(g_head,0,1,0);
  head.matrix.translate(0,0,-.1);
  head.matrix.scale(.05,.08,.12);
  head.matrix.translate(0.25,2.1,-0.2);
  head.render();

  var eyes = new Cube();
  eyes.color = [.1,.1,.1,1];
  eyes.matrix = new Matrix4(shaftMat);
  eyes.matrix.scale(1.5,.25,.15);
  eyes.matrix.translate(-.15,2,2.5);
  eyes.render();

  var beak = new Wedge();
  beak.color = [193/255, 153/255, 97/255,1];
  beak.matrix = new Matrix4(shaftMat);
  beak.matrix.scale(1,.65,-.55);
  beak.render();

  var headPiece = new Cube();
  headPiece.color = [0.265,0.647,0.265,1.0];
  headPiece.matrix = new Matrix4(shaftMat);
  headPiece.matrix.translate(.25,.8,.8);
  headPiece.matrix.scale(.5,1,.65);
  headPiece.render();



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


  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration)+" fps: "+ Math.floor(1000/duration), "metrics");
}

function sendTextToHTML(text, htmlID){
  var htmlEl = document.getElementById(htmlID);
  if(!htmlID){
    console.log("Failed to get "+ htmlID+" from HTML")
    return;
  }
  htmlEl.innerHTML = text;
}