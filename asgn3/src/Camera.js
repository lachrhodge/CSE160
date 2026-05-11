// Camera.js for asgn3, handles all things camera
let rotMatrix = null;

let g_pitch = 0; // rotate arond x
let g_yaw = 90; // rotate around y

let g_camPos = [-1,1.5,.5];
let camPosMax = 32; // 64 x 64 area

const camRadius = 0.3;

function cameraHandler(){
  if(rotMatrix === null){ // default state
    rotMatrix = new Matrix4();
  }

  let isDragging = false;
  let lastX, lastY;

  canvas.addEventListener('mousedown', (ev) => {
    isDragging = true;
    lastX = ev.clientX;
    lastY = ev.clientY;
  }); // learned what `(ev) => {...}` is, basically a function(ev) {...}; 

  window.addEventListener('mousemove', (ev) => { // allow for dragging outside canvas
    if (!isDragging) return;

    const dx = ev.clientX - lastX;  // delta since last frame
    const dy = ev.clientY - lastY;

    // Apply dx/dy to your camera or object here
    g_yaw   += dx * 0.5;
    g_pitch -= dy * 0.5;
    g_pitch = Math.max(-70, Math.min(70, g_pitch));

    lastX = ev.clientX;  // update for next frame
    lastY = ev.clientY;
  });

  window.addEventListener('mouseup', () => {isDragging = false;});
  // window bc if mouse leaves canvas, then unclick, it will not trigger.
}

function collideCheck(px, py, pz) {
  for (let solid of solidList) {
    // expand cube bounds by player size
    if (
      
      px + camRadius > solid.x  &&
      px - camRadius < solid.x + solid.sx  &&
      pz + camRadius > solid.z  &&
      pz - camRadius < solid.z + solid.sz
    ) {
      return true;
    }
  }
  return false;
}

const keysDown = new Set();
window.addEventListener('keydown', (ev) => keysDown.add(ev.key));
window.addEventListener('keyup',   (ev) => keysDown.delete(ev.key));

function movementHandler(deltaT){
  const speed = 10;
  const yr = g_yaw * Math.PI / 180;

  // forward/back along the direction you're facing
  const fwdX = Math.sin(yr);
  const fwdZ = -Math.cos(yr);  // negative because WebGL Z points toward you

  let nx = g_camPos[0];
  let nz = g_camPos[2];

  if (keysDown.has('w')) { nx += fwdX * speed * deltaT; nz += fwdZ * speed * deltaT; }
  if (keysDown.has('s')) { nx -= fwdX * speed * deltaT; nz -= fwdZ * speed * deltaT; }
  // strafe: perpendicular to forward
  if (keysDown.has('a')) { nx += fwdZ * speed * deltaT; nz -= fwdX * speed * deltaT; }
  if (keysDown.has('d')) { nx -= fwdZ * speed * deltaT; nz += fwdX * speed * deltaT; }

  nx = Math.min(camPosMax, Math.max(-camPosMax, nx));
  nz = Math.min(camPosMax, Math.max(-camPosMax, nz));

  if (keysDown.has('q')) {g_yaw -= 90 * deltaT;}
  if (keysDown.has('e')) {g_yaw += 90 * deltaT;}

  // if all checked together, you end up standing still, unable to move
  // check x independently
  if (!collideCheck(nx, g_camPos[1], g_camPos[2])){
    g_camPos[0] = nx;
  }
  // check Z independently
  if (!collideCheck(g_camPos[0], g_camPos[1], nz)){
    g_camPos[2] = nz;
  }
}

function updateCam(){
  // convert to radians for Math.sin()/cos();
  var yr = g_yaw * Math.PI/180;
  var pr = g_pitch * Math.PI/180;

  var camX = g_camPos[0] + Math.cos(pr) * Math.sin(yr);
  var camY = g_camPos[1] + Math.sin(pr);
  var camZ = g_camPos[2] - Math.cos(pr) * Math.cos(yr);

  rotMatrix.setLookAt(
      g_camPos[0], g_camPos[1], g_camPos[2],
      camX,        camY,        camZ,
      0,           1,           0
  );
}
