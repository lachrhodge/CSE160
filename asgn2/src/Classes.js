class Point{
  constructor(){
    this.type='point';
    this.pos = [0,0,0];
    this.color = [1.0, 1.0, 1.0, 1.0]
    this.size = 5.0;
  }

  render(){
    var xy = this.pos;//g_points[i];
    var rgba = this.color;//g_colors[i];
    var size = this.size;//g_sizes[i];

    gl.disableVertexAttribArray(a_Position);

    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniform1f(u_size, size);

    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

class Triangle{
  constructor(){
    this.type='triangle';
    this.pos = [0,0,0];
    this.color = [1.0, 1.0, 1.0, 1.0]
    this.size = 5.0;
  }

  render(){
    var xy = this.pos;//g_points[i];
    var rgba = this.color;//g_colors[i];
    var scale = this.size / 200;//g_sizes[i];

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Draw
    drawTriangle([xy[0],xy[1],  xy[0]+scale, xy[1],  xy[0], xy[1]+scale]);
  }
}

class Circle{
  constructor(seg){
    this.type='circle';
    this.pos = [0.0,0.0,0.0];
    this.color = [1.0, 1.0, 1.0, 1.0]
    this.size = 5.0;
    this.segments = seg;
  }

  render(){
    var center = this.pos;//g_points[i];
    var rgba = this.color;//g_colors[i];
    var scale = this.size / 200;//g_sizes[i];

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Draw
    var angleStep = 360/this.segments;

    var vertices = [];
    vertices.push(center[0],center[1]);

    for(var a1 = 0; a1 <= 360; a1+=angleStep){
      var vec = [Math.cos(a1*Math.PI/180)*scale, Math.sin(a1*Math.PI/180)*scale];
      vertices.push(center[0]+vec[0], center[1]+vec[1]);
    }

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    // static draw is not good, switch to dynamic draw

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
  }

}

function drawTriangle(vertices) { // basically a method of 
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
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
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
