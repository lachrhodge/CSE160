// World.js for asgn3

const WHITE = [1,1,1,1];
const BLACK = [0,0,0,1];

let geomList = [];
let solidList = []; // attempting collision

function initTextures() {
  var images = [
    { src: './textures/dirt.png',  num: TEX_DIRT  },
    { src: './textures/grass_block_top.png', num: TEX_GRASS },
    { src: './textures/stone.png', num: TEX_STONE },
    { src: './textures/skybox.png', num: TEX_SKY},
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

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  switch(TEX_NUM) {
    case TEX_DIRT:  gl.uniform1i(u_sampler0, TEX_NUM); break;
    case TEX_GRASS: gl.uniform1i(u_sampler1, TEX_NUM); break;
    case TEX_STONE: gl.uniform1i(u_sampler2, TEX_NUM); break;
    case TEX_SKY:   gl.uniform1i(u_sampler4, TEX_NUM); break;
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

function setShapes(){
  var base_cube = new Cube(); // dirt
  base_cube.matrix.translate(-32,-1,-32);
  base_cube.scale(64,1,64);
  base_cube.texNum = TEX_GRASS;
  base_cube.color = GRASS_COL;
  geomList.push(base_cube);

  var sky_cube = new SkyCube(); // grass
  sky_cube.matrix.translate(-500,-500,-500);
  sky_cube.matrix.scale(1000,1000,1000);
  sky_cube.texNum = TEX_SKY;
  geomList.push(sky_cube);

  addCube(-32,0,-32,12,2,1,TEX_STONE);
  addCube(1,0,1,1,1,1,TEX_STONE);
}

function addCube(x, y, z, sx=1, sy=1, sz=1, texNum=TEX_DIRT) {
  var cube = new Cube();
  cube.matrix.translate(x, y, z);
  cube.scale(sx, sy, sz);
  cube.texNum = texNum;
  geomList.push(cube);
  solidList.push({x,y,z,sx,sy,sz}); // store for collision
}