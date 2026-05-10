// World.js for asgn3

const WHITE = [1,1,1,1];
const BLACK = [0,0,0,1];

let geomList = [];

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

function initTextures() {
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendTexture0(image); };
  // Tell the browser to load an image
  image.src = 'dirt.png';

  // add more textures

  return true;
}

function sendTexture0(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_sampler0, 0);
}

function setShapes(){
  var base_cube = new Cube();
  base_cube.matrix.translate(-32,-1,-32);
  base_cube.matrix.scale(64,1,64);
  base_cube.uvScale = [64,1,64];
  geomList.push(base_cube);
}
