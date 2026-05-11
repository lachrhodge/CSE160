const GRASS_COL    = [0.4, 0.7, 0.4, 1.0];
const CLOUD_COL    = [0.7, 0.8, 0.8, 1.0];

class Cube{
  constructor(){
    this.type = 'cube';
    this.color = [1, 1, 1, 1];
    this.matrix = new Matrix4();
    this.texNum = TEX_DIRT;
    this.uvScale = [1,1,1];
  }

  render(){
    var rgba = this.color;//g_colors[i];

    gl.uniform1i(u_whichTex, this.texNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);


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
    drawTriangle3DUV( [0,0,0, 0,1,1, 0,1,0], [0,0, sz,sy, 0,sy]);
    drawTriangle3DUV( [0,0,0, 0,1,1, 0,0,1], [0,0, sz,sy, sz,0]);
    drawTriangle3DUV( [1,0,0, 1,0,1, 1,1,1], [sz,0, 0,0, 0,sy]);
    drawTriangle3DUV( [1,0,0, 1,1,0, 1,1,1], [sz,0, sz,sy, 0,sy]);
  }
  
  scale( fx, fy, fz){
    this.matrix.scale(fx,fy,fz);
    this.uvScale = [fx,fy,fz];
  }
}

class SkyCube{
  constructor(){
    this.type = 'cube';
    this.color = [1, 1, 1, 1];
    this.matrix = new Matrix4();
  }

  render(){
    var rgba = this.color;//g_colors[i];

    const P = 1/512;

    gl.depthMask(false);
    
    gl.uniform1i(u_whichTex, TEX_SKY);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //front & back
    drawTriangle3DUV( [0,0,0, 1,1,0, 1,0,0], [1/4,1/3, 2/4,2/3, 1/4,1/3]);
    drawTriangle3DUV( [0,0,0, 0,1,0, 1,1,0], [1/4,1/3, 1/4,2/3, 2/4,2/3]);
    drawTriangle3DUV( [0,0,1, 1,1,1, 1,0,1], [4/4,1/3, 3/4,2/3, 3/4,1/3]);
    drawTriangle3DUV( [0,0,1, 1,1,1, 0,1,1], [4/4,1/3, 3/4,2/3, 4/4,2/3]);
    //top/bottom
    drawTriangle3DUV( [0,1,0, 1,1,0, 1,1,1], [1/4+P,2/3-P, 2/4-P,2/3+P, 2/4-P,3/3-P]);
    drawTriangle3DUV( [0,1,0, 0,1,1, 1,1,1], [1/4+P,2/3-P, 1/4+P,3/3-P, 2/4-P,3/3-P]);
    drawTriangle3DUV( [0,0,0, 1,0,0, 1,0,1], [1/4+P,1/3+P, 2/4-P,1/3+P, 2/4-P,0+P]);
    drawTriangle3DUV( [0,0,0, 0,0,1, 1,0,1], [1/4+P,1/3+P, 1/4+P,0+P, 2/4-P,0+P]);
    // sides // 90 deg left
    drawTriangle3DUV( [0,0,0, 0,1,1, 0,1,0], [1/4,1/3, 0/4,2/3, 1/4,2/3]);
    drawTriangle3DUV( [0,0,0, 0,1,1, 0,0,1], [1/4,1/3, 0/4,2/3, 0/4,1/3]);
    // 90 deg right
    drawTriangle3DUV( [1,0,0, 1,0,1, 1,1,1], [2/4,1/3, 3/4,1/3, 3/4,2/3]);
    drawTriangle3DUV( [1,0,0, 1,1,0, 1,1,1], [2/4,1/3, 2/4,2/3, 3/4,2/3]);

    gl.depthMask(true);
  }
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
