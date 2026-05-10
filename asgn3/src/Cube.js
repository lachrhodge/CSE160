class Cube{
  constructor(){
    this.type='cube';
    this.color = [1.0, 1.0, 1.0, 1.0]
    this.matrix = new Matrix4();
    this.texNum = 0;
    this.uvScale = [1,1,1];
  }

  render(){
    var rgba = this.color;//g_colors[i];

    gl.uniform1i(u_whichTex, this.texNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var sx = this.uvScale[0];
    var sy = this.uvScale[1];
    var sz = this.uvScale[2];

    //front & back
    drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [sx,0, 0,sy, 0,0]);
    drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [sx,0, sx,sy, 0,sy]);
    drawTriangle3DUV( [0,0,1, 1,1,1, 1,0,1], [0,0, sx,sy, sx,0]);
    drawTriangle3DUV( [0,0,1, 1,1,1, 0,1,1], [0,0, sx,sy, 0,sy]);
    //top/bottom
    drawTriangle3DUV( [0,1,0, 1,1,0, 1,1,1], [sx,0, 0,0, 0,sz]);
    drawTriangle3DUV( [0,1,0, 0,1,1, 1,1,1], [sx,0, sx,sz, 0,sz]);
    drawTriangle3DUV( [0,0,0, 1,0,0, 1,0,1], [sx,0, 0,0, 0,sz]);
    drawTriangle3DUV( [0,0,0, 0,0,1, 1,0,1], [sx,0, sx,sz, 0,sz]);
    // //sides
    // // gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
    // // not drawing colors due to texture
    drawTriangle3DUV( [0,0,0, 0,1,1, 0,1,0], [0,0, sz,sy, 0,sy]);
    drawTriangle3DUV( [0,0,0, 0,1,1, 0,0,1], [0,0, sz,sy, sz,0]);

    drawTriangle3DUV( [1,0,0, 1,0,1, 1,1,1], [sz,0, 0,0, 0,sy]);
    drawTriangle3DUV( [1,0,0, 1,1,0, 1,1,1], [sz,0, sz,sy, 0,sy]);
  }
  
}

function drawTriangle3D(vertices) { // basically a method of 
  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),gl.DYNAMIC_DRAW);
  // static draw is not good, switch to dynamic draw

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function drawTriangle3DUV(vertices, uv) { // basically a method of 
  // Create vertex buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // new code for asgn3
  var uvBuffer = gl.createBuffer();
  if(!uvBuffer){
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
