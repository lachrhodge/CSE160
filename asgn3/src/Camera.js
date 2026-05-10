// Camera.js for asgn3, handles all things camera
let rotMatrix = null;

let g_pitch = 0; // rotate arond x
let g_yaw = 90; // rotate around y

let g_camPos = [-1,1.5,.5];

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

const keysDown = new Set();
window.addEventListener('keydown', (ev) => keysDown.add(ev.key));
window.addEventListener('keyup',   (ev) => keysDown.delete(ev.key));

function movementHandler(deltaT){
    const speed = 3;
    const yr = g_yaw * Math.PI / 180;

    // forward/back along the direction you're facing
    const fwdX = Math.sin(yr);
    const fwdZ = -Math.cos(yr);  // negative because WebGL Z points toward you

    if (keysDown.has('w')) { g_camPos[0] += fwdX * speed * deltaT; g_camPos[2] += fwdZ * speed * deltaT; }
    if (keysDown.has('s')) { g_camPos[0] -= fwdX * speed * deltaT; g_camPos[2] -= fwdZ * speed * deltaT; }
    // strafe: perpendicular to forward
    if (keysDown.has('a')) { g_camPos[0] += fwdZ * speed * deltaT; g_camPos[2] -= fwdX * speed * deltaT; }
    if (keysDown.has('d')) { g_camPos[0] -= fwdZ * speed * deltaT; g_camPos[2] += fwdX * speed * deltaT; }

    if (keysDown.has('q')) { g_camPos[0] += fwdZ * speed * deltaT; g_camPos[2] -= fwdX * speed * deltaT; }
    if (keysDown.has('e')) { g_camPos[0] -= fwdZ * speed * deltaT; g_camPos[2] += fwdX * speed * deltaT; }
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
