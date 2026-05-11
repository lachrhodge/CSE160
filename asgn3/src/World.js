// World.js for asgn3

const TEX_COLOR    = -2;
const TEX_UV_DEBUG = -1;
const TEX_DIRT     = 0;
const TEX_GRASS    = 1;
const TEX_STONE    = 2;
const TEX_WOOL     = 3;
const TEX_SKY      = 4;
const TEX_TREE     = 5;

const WHITE = [1,1,1,1];
const BLACK = [0,0,0,1];

let geomList = [];
let solidList = []; // attempting collision

let hue = 0;
let g_RGB = [1,1,1,1];

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
  var startTime = performance.now();
  // start render

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if(rotMatrix != null) gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, rotMatrix.elements);

  for(var i = 0; i < geomList.length; i++){
    geomList[i].render();
  }

  // end render
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration)+" fps: "+ Math.floor(1000/duration), "metrics");
}

function HSVtoRGB(hue){
  // assume S = 1, V = 1
  var hueP = hue / 60;

  var X = 1 * (1 - Math.abs(hueP % 2 - 1));

  var RGB = [1,1,1,1]

  switch(hueP){
    case 0 <= hueP < 1: RGB = [1,X,0]; break;
    case 1 <= hueP < 2: RGB = [X,1,0]; break;
    case 2 <= hueP < 3: RGB = [0,1,X]; break;
    case 3 <= hueP < 4: RGB = [0,X,1]; break;
    case 4 <= hueP < 5: RGB = [X,0,1]; break;
    case 5 <= hueP < 6: RGB = [1,0,X]; break;
  }

  return RGB;
}

function wally(){
  addCube(-32,0,-32,63,4,1, TEX_STONE);
  addCube(31,0,-32,1,4,63,TEX_STONE);
  addCube(-32,0,31,63,4,1, TEX_STONE);
  addCube(-32,0,-32,1,4,63,TEX_STONE);
  addCube(-32,4,-32,63,1,1, TEX_GRASS, GRASS_COL);
  addCube(31,4,-32,1,1,63,TEX_GRASS, GRASS_COL);
  addCube(-32,4,31,63,1,1, TEX_GRASS, GRASS_COL);
  addCube(-32,4,-32,1,1,63,TEX_GRASS, GRASS_COL);
}

function foresty(){
  
}

function addCube(x, y, z, sx=1, sy=1, sz=1, texNum=TEX_DIRT, color = WHITE, collide = true) {
  var cube = new Cube();
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
      TEX_WOOL, GRASS_COL, false
    );
}

}

// Setting world objects. ------------------------------------------------------

function setShapes(){
  // var base_cube = new Cube(); // dirt
  // base_cube.matrix.translate(-32,-1,-32);
  // base_cube.scale(64,1,64);
  // base_cube.texNum = TEX_GRASS;
  // base_cube.color = GRASS_COL;
  // geomList.push(base_cube);
  addCube(-32,-1,-32, 64,1,64,TEX_GRASS, GRASS_COL, false);
  
  var sky_cube = new SkyCube(); // grass
  sky_cube.matrix.translate(-500,-500,-500);
  sky_cube.matrix.scale(1000,1000,1000);
  sky_cube.texNum = TEX_SKY;
  geomList.push(sky_cube);

  wally();

  addCube(1,0,1,1,1,1,TEX_STONE);
  addCube(5,3,5,1,1,1, TEX_UV_DEBUG, WHITE, false);

  addTree(10,0,5,3,2);
  addTree(10,0,0,4,3);
  addTree(-10,0,1,5,4);
  addTree(10,0,-5,3,4);
}
