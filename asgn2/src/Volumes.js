class Cube{
  constructor(){
    this.type='cube';
    this.color = [1.0, 1.0, 1.0, 1.0]
    this.matrix = new Matrix4();
  }

  render(){
    //var center = this.pos;//g_points[i];
    var rgba = this.color;//g_colors[i];
    //var scale = this.size / 200;//g_sizes[i];

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //front
    drawTriangle3D( [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0] );
    drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0] );
    //back
    drawTriangle3D( [0,0,1, 1,1,1, 1,0,1] );
    drawTriangle3D( [0,0,1, 0,1,1, 1,1,1] );
    //top/bottom
    gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
    drawTriangle3D( [0,1,0, 1,1,0, 1,1,1] );
    drawTriangle3D( [0,1,0, 0,1,1, 1,1,1] );
    drawTriangle3D( [0,0,0, 1,0,0, 1,0,1] );
    drawTriangle3D( [0,0,0, 0,0,1, 1,0,1] );
    //sides
    gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
    drawTriangle3D( [0,0,0, 0,1,0, 0,1,1] );
    drawTriangle3D( [0,0,0, 0,0,1, 0,1,1] );
    drawTriangle3D( [1,0,0, 1,1,0, 1,1,1] );
    drawTriangle3D( [1,0,0, 1,0,1, 1,1,1] );
  }

}

class Wedge{
    constructor(){
    this.type='wedge';
    this.color = [1.0, 1.0, 1.0, 1.0]
    this.matrix = new Matrix4();
  }

  render(){
    //var center = this.pos;//g_points[i];
    var rgba = this.color;//g_colors[i];
    //var scale = this.size / 200;//g_sizes[i];

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    //slope
    drawTriangle3D( [0,1,0, 0,0,1, 1,0,1] );
    drawTriangle3D( [0,1,0, 1,1,0, 1,0,1] );
    //bottom
    gl.uniform4f(u_FragColor, rgba[0] * .7, rgba[1] * .7, rgba[2] * .7, rgba[3]);    
    drawTriangle3D( [0,0,0, 1,0,0, 1,0,1] );
    drawTriangle3D( [0,0,0, 0,0,1, 1,0,1] );
    //front
    gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
    drawTriangle3D( [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0] );
    drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0] );
    //sides
    gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
    drawTriangle3D( [0,0,0, 0,1,0, 0,0,1] );
    drawTriangle3D( [1,0,0, 1,1,0, 1,0,1] );
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
