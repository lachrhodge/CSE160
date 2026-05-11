// World.js for asgn3

const TEX_COLOR    = -2;
const TEX_UV_DEBUG = -1;
const TEX_DIRT     = 0;
const TEX_GRASS    = 1;
const TEX_STONE    = 2;
const TEX_WOOL     = 3;
const TEX_SKY      = 4;
const TEX_TREE     = 5;

const WHITE        = [1,1,1,1];
const BLACK        = [0,0,0,1];
const OFF          = [0.7, 0.1, 0.1, 0.85];
const ON           = [0.1, 0.7, 0.1, 0.85];
const GRASS_COL    = [0.4, 0.7, 0.4, 1.0];
const CLOUD_COL    = [0.7, 0.8, 0.8, 1.0];
const TREE_COL     = [0.3, 0.4, 0.25, 1.0];

let geomList = [];
let solidList = []; // attempting collision

let hue = 0;
let g_RGB = [1,1,1,1];

//buttons
var b1 = null;
var b2 = null;
var b3 = null;
var b4 = null;
var b5 = null;

function initTextures() {
  var images = [
    { src: './textures/dirt.png',  num: TEX_DIRT  },
    { src: './textures/grass.png', num: TEX_GRASS },
    { src: './textures/stone.png', num: TEX_STONE },
    { src: './textures/skybox.png', num: TEX_SKY},
    { src: './textures/wool.png', num: TEX_WOOL},
    { src: './textures/tree.png', num: TEX_TREE},
  ];

  images.forEach(({ src, num }) => {
    var image = new Image();
    image.onload = function() {sendTexture(image, num);};
    image.src = src;
  });
  
  return true;
}

function sendTexture(image, TEX_NUM) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0 + TEX_NUM);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  
  if(TEX_NUM != TEX_SKY){
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  switch(TEX_NUM) {
    case TEX_DIRT:  gl.uniform1i(u_sampler0, TEX_NUM); break;
    case TEX_GRASS: gl.uniform1i(u_sampler1, TEX_NUM); break;
    case TEX_STONE: gl.uniform1i(u_sampler2, TEX_NUM); break;
    case TEX_WOOL:  gl.uniform1i(u_sampler3, TEX_NUM); break;
    case TEX_SKY:   gl.uniform1i(u_sampler4, TEX_NUM); break;
    case TEX_TREE:  gl.uniform1i(u_sampler5, TEX_NUM); break;
  }
}

function renderShapes(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if(rotMatrix != null) gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, rotMatrix.elements);

  if(!g_party){
    geomList[1].render();
  } else {
    geomList[0].color = g_RGB;
    geomList[0].render();
  }

  geomList[2].color = g_RGB;
  geomList[2].render();

  for(var i = 3; i < geomList.length; i++){
    geomList[i].render();
  }
}

function HSVtoRGB(hue){
  // assume S = 1, V = 1
  var h = hue % 360;
  var hP = h / 60;
  var X = 1 - Math.abs(hP % 2 - 1);
  var i = Math.floor(hP);

  const sectors = [
    [1,X,0,1],
    [X,1,0,1],
    [0,1,X,1],
    [0,X,1,1],
    [X,0,1,1],
    [1,0,X,1],
  ];
  return sectors[i];
}

function wally(){
  addCube(-32,0,-32,31,4,1, TEX_STONE);
  addCube(2,0,-32,29,4,1, TEX_STONE);
  addCube(31,0,-32,1,4,63,TEX_STONE);
  addCube(-32,0,31,63,4,1, TEX_STONE);
  addCube(-32,0,-32,1,4,63,TEX_STONE);

  //false wall
  addCube(-0.999,0.001,-31.1,2.998,4,0.1,TEX_STONE,[.8,.8,.8,1],false);
}

function towery(){
  addCube(-3,0,-3,4,10,1,TEX_STONE);
  addCube(-3,0,2,4,10,1,TEX_STONE);
  addCube(1,0,1,1,10,1,TEX_STONE);
  addCube(1,0,-2,1,10,1,TEX_STONE);
  addCube(1,2.5,-1,1,7.5,2,TEX_STONE,WHITE,false);
  addCube(-4,0,-2,1,10,4,TEX_STONE);
  addCube(-3,0,-2,4,.01,4,TEX_TREE,WHITE,false);
  addCube(-3,3,-2,4,.01,4,TEX_TREE,WHITE,false);
}

function foresty(){
  forest(25,30,30,10,-30);
}

function forest(numTrees = 5, xMax=20, zMax=20, xMin=-20, zMin=-20){
  var cols = Math.ceil(Math.sqrt(numTrees));
  var rows = Math.ceil(numTrees / cols);

  var cellW = (xMax - xMin) / cols;
  var cellD = (zMax - zMin) / rows;

  var count = 0;
  for(var r = 0; r < rows && count < numTrees; r++){
    for(var c = 0; c < cols && count < numTrees; c++){
      // random position within each cell
      var xT = xMin + c * cellW + Math.random() * cellW;
      var zT = zMin + r * cellD + Math.random() * cellD;

      addTree(xT, 0, zT, Math.floor(Math.random() * 4) + 2, Math.floor(Math.random() * 3) + 2);
      count++;
    }
  }
}

function buttony(){
  b1 = new Button(30.5,0.1,30.5);
  b1.addToWorld();
  addCube(29.5,0,29.5,1.5,0.1,1.5,TEX_STONE,[.7,.1,.7,.8],false);

  b2 = new Button(30.5,0.1,30.5);
  b2.addToWorld();

  b3 = new Button(30.5,0.1,30.5);
  b3.addToWorld();

  b4 = new Button(30.5,0.1,30.5);
  b4.addToWorld();

  b5 = new Button(30.5,0.1,30.5);
  b5.addToWorld();
}

function addHouseClosed(x,y,z){
  addCube(x,y,z,10,4,6,TEX_TREE,WHITE,false);
  addCube(x-.25,y,z-.25,10.5,.5,6.5,TEX_STONE); // foundation
  addCube(x+10,y+.5,z+2.4,.1,2.2,1.2,TEX_STONE,WHITE,false);
  addCube(x+10,y+.5,z+2.5,.125,2,1,TEX_DIRT,WHITE,false);
  addCube(x+10.25,y,z+2,.25,.25,2,TEX_STONE,WHITE,false);
}

function addCube(x, y, z, sx=1, sy=1, sz=1, texNum=TEX_DIRT, color = WHITE, collide = true, cube = new Cube()) {
  cube.matrix.translate(x, y, z);
  cube.scale(sx, sy, sz);
  cube.texNum = texNum;
  cube.color = color;
  geomList.push(cube);
  if(collide) solidList.push({x,y,z,sx,sy,sz}); // store for collision
}

// tH --> tree height, total height -> tH + 2, tH > 2, tH must even
// tr --> height of trunk keep between 2 and 5
function addTree(x,y,z, tH = 2,tr = 2){
  addCube(x,y,z,1,tr,1,TEX_TREE);
  
  // addCube(x-2,tH, z-2, 5,2,5,TEX_WOOL, GRASS_COL, false);
  // addCube(x-1,tH+2, z-1, 3,1,3,TEX_WOOL, GRASS_COL, false);
  // addCube(x,tH+3,z,1,1,1,TEX_WOOL,GRASS_COL, false);

  for(var i = 0; i < tH + 1; i++){
    var C = 1/3*(tH-i)/tH;
    //var C = (1/5) * Math.pow((tH - i) / tH /1.5, 4) * tH;
    addCube(
      x - C*tH,
      y + tr + 2*i,
      z - C*tH,
      2*C*tH + 1, 2, 2*C*tH + 1,
      TEX_WOOL, TREE_COL, false
    );
  }
}

// check button area collide


// Setting world objects. ------------------------------------------------------

function setShapes(){
  // var base_cube = new Cube(); // dirt
  // base_cube.matrix.translate(-32,-1,-32);
  // base_cube.scale(64,1,64);
  // base_cube.texNum = TEX_GRASS;
  // base_cube.color = GRASS_COL;
  // geomList.push(base_cube);
  
  addCube(-400,-400,-400,800,800,800,TEX_COLOR,g_RGB,false); // 0

  var sky_cube = new SkyCube(); // grass 1
  sky_cube.matrix.translate(-500,-500,-500);
  sky_cube.matrix.scale(1000,1000,1000);
  sky_cube.texNum = TEX_SKY;
  geomList.push(sky_cube);

  addCube(-3,.5,1,1,1,1, TEX_COLOR, g_RGB, true); // 2

  addCube(-32,-1,-32, 64,1,64,TEX_GRASS, GRASS_COL, false);
  wally();
  foresty();
  towery();
  buttony();

  addHouseClosed(-10,0,-10);
  //addHouseClosed(10,0,10);

  addCube(-3,1.75,1,1,1,1, TEX_UV_DEBUG, WHITE, false);

}
