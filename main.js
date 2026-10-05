import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/webxr/VRButton.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080d14);
scene.fog = new THREE.Fog(0x080d14, 12, 58);

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 120);
camera.position.set(0, 1.65, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

scene.add(new THREE.HemisphereLight(0xc6d9ff, 0x161a20, 1.8));
const sun = new THREE.DirectionalLight(0xffffff, 2.1);
sun.position.set(4, 8, 3);
scene.add(sun);

const world = new THREE.Group();
scene.add(world);

const palette = {
  blue: 0x123b63,
  orange: 0xd66f32,
  cream: 0xe8e0d2,
  dark: 0x151c25,
  floor: 0x242c36,
  brass: 0xb08b52,
  glass: 0x6e9bb8
};

const roomData = [
  { title: '01 · SU ÉPOCA', subtitle: 'Jerez y el siglo XVIII', color: palette.blue },
  { title: '02 · ANDRÉS BENÍTEZ Y PEREA', subtitle: 'Vida, oficio y taller', color: palette.orange },
  { title: '03 · SU OBRA Y SU LEGADO', subtitle: 'Arte y patrimonio', color: palette.blue },
  { title: '04 · RECORRIDO POR JEREZ', subtitle: 'La ciudad como escenario', color: palette.orange },
  { title: '05 · NUESTRO CENTRO HOY', subtitle: 'Tradición técnica e innovación', color: palette.blue },
  { title: '06 · EL FUTURO', subtitle: '40 años y todo lo que queda por construir', color: palette.orange }
];

const stops = [];
const ROOM_LENGTH = 10;
const CORRIDOR_LENGTH = 18;
const ROOM_GAP = ROOM_LENGTH + CORRIDOR_LENGTH;
const ROOM_WIDTH = 8;
const ROOM_HEIGHT = 4.8;

function material(color, roughness = 0.7, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addText(group, text, position, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = options.background || 'rgba(10,16,24,.88)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = options.color || '#ffffff';
  ctx.font = options.font || '700 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(options.width || 5.8, options.height || 1.45),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  );
  mesh.position.copy(position);
  mesh.rotation.y = options.rotationY || 0;
  group.add(mesh);
  return mesh;
}

function createRoom(index, data) {
  const g = new THREE.Group();
  const z = -index * ROOM_GAP;
  g.position.z = z;

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(ROOM_WIDTH, 0.16, ROOM_LENGTH),
    material(palette.floor)
  );
  floor.position.y = -0.08;
  g.add(floor);

  const wallMat = material(0x202a35);
  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.22, ROOM_HEIGHT, ROOM_LENGTH), wallMat);
  sideL.position.set(-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
  g.add(sideL);

  const sideR = sideL.clone();
  sideR.position.x = ROOM_WIDTH / 2;
  g.add(sideR);

  const back = new THREE.Mesh(new THREE.BoxGeometry(ROOM_WIDTH, ROOM_HEIGHT, 0.22), material(data.color));
  back.position.set(0, ROOM_HEIGHT / 2, -ROOM_LENGTH / 2);
  g.add(back);

  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(ROOM_WIDTH, 0.18, ROOM_LENGTH), material(0x111821));
  ceiling.position.y = ROOM_HEIGHT;
  g.add(ceiling);

  const portal = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 3.2, 0.3),
    material(data.color, 0.45, 0.15)
  );
  portal.position.set(0, 1.6, ROOM_LENGTH / 2);
  g.add(portal);

  const innerPortal = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 2.8, 0.34),
    material(0x090d14, 0.35, 0)
  );
  innerPortal.position.set(0, 1.55, ROOM_LENGTH / 2 - 0.18);
  g.add(innerPortal);

  addText(g, data.title, new THREE.Vector3(0, 3.35, -ROOM_LENGTH / 2 + 0.16), {
    width: 6.2, height: 1.0, font: '700 44px Arial', background: 'rgba(10,16,24,.9)'
  });

  addText(g, data.subtitle, new THREE.Vector3(0, 2.55, -ROOM_LENGTH / 2 + 0.18), {
    width: 4.8, height: 0.7, font: '400 30px Arial', background: 'rgba(10,16,24,.82)'
  });

  // Placeholder plinths: these will later become photos, objects, documents and 3D pieces.
  for (const x of [-2.25, 0, 2.25]) {
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.9, 1.35),
      material(0x303b47)
    );
    plinth.position.set(x, 0.45, -0.9);
    g.add(plinth);

    const object = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.65, 0.08),
      material(data.color, 0.5, 0.15)
    );
    object.position.set(x, 1.22, -0.9);
    g.add(object);
  }

  // Small wall markers hinting that this is an exhibition space.
  for (const x of [-3.1, 3.1]) {
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.8, 0.9),
      material(data.color, 0.4, 0.1)
    );
    marker.position.set(x, 1.9, -1.6);
    g.add(marker);
  }

  world.add(g);
  stops.push({ z, title: data.title, room: g });
}

function createCorridor(index, from, to) {
  const g = new THREE.Group();
  const z = -(index * ROOM_GAP) + ROOM_LENGTH / 2 + CORRIDOR_LENGTH / 2;

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(ROOM_WIDTH, 0.12, CORRIDOR_LENGTH),
    material(0x1b232d)
  );
  floor.position.y = -0.06;
  g.add(floor);

  const wallMat = material(0x161e27);
  for (const x of [-ROOM_WIDTH / 2, ROOM_WIDTH / 2]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.18, ROOM_HEIGHT, CORRIDOR_LENGTH), wallMat);
    wall.position.set(x, ROOM_HEIGHT / 2, 0);
    g.add(wall);
  }

  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(ROOM_WIDTH, 0.14, CORRIDOR_LENGTH), material(0x0e141b));
  ceiling.position.y = ROOM_HEIGHT;
  g.add(ceiling);

  // Repeated light bands make movement legible without looking like a vehicle.
  for (let i = 0; i < 5; i++) {
    const light = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.08, 0.16),
      new THREE.MeshStandardMaterial({ color: 0xdde8f5, emissive: 0x6e9bb8, emissiveIntensity: 1.6 })
    );
    light.position.set(0, 3.85, -CORRIDOR_LENGTH / 2 + 2 + i * 3.4);
    g.add(light);
  }

  addText(g, `PASILLO 0${index} · ${from.title.replace(/^\d+ · /, '')} → ${to.title.replace(/^\d+ · /, '')}`,
    new THREE.Vector3(0, 2.7, 0), {
      width: 6.8, height: 0.9, font: '700 32px Arial', background: 'rgba(10,16,24,.9)'
    });

  world.add(g);
}

roomData.forEach((data, i) => createRoom(i, data));
for (let i = 0; i < roomData.length - 1; i++) createCorridor(i + 1, roomData[i], roomData[i + 1]);

const controllers = [renderer.xr.getController(0), renderer.xr.getController(1)];
controllers.forEach((controller, i) => {
  controller.addEventListener('selectstart', () => flash(i));
  scene.add(controller);
});

let running = false;
let paused = false;
let speed = 0;
let stopIndex = 0;
let lastTime = 0;
let pauseTimer = null;

const status = document.querySelector('#status');
const stationLabel = document.querySelector('#station');

function flash(controllerIndex) {
  stationLabel.textContent = `INTERACCIÓN · MANDO ${controllerIndex + 1}`;
  clearTimeout(flash.timer);
  flash.timer = setTimeout(() => {
    stationLabel.textContent = stops[Math.min(stopIndex, stops.length - 1)].title;
  }, 900);
}

function startRide() {
  running = true;
  paused = false;
  speed = 0;
  stopIndex = 0;
  world.position.z = 0;
  status.textContent = 'RECORRIDO';
  stationLabel.textContent = stops[0].title;
  document.querySelector('#overlay').style.display = 'none';
}

function pauseAtRoom() {
  paused = true;
  speed = 0;
  status.textContent = 'EN SALA';
  stationLabel.textContent = stops[stopIndex].title;
  clearTimeout(pauseTimer);

  if (stopIndex < stops.length - 1) {
    pauseTimer = setTimeout(() => {
      paused = false;
      status.textContent = 'RECORRIDO';
    }, 4200);
  } else {
    running = false;
    status.textContent = 'FINAL';
  }
}

function updateRide(dt) {
  if (!running || paused) return;

  speed = THREE.MathUtils.damp(speed, 0.78, 1.6, dt);
  world.position.z += speed * dt;

  const travelled = world.position.z;
  const nextRoomTravel = -stops[stopIndex + 1]?.z;

  if (stopIndex < stops.length - 1 && travelled >= nextRoomTravel) {
    world.position.z = nextRoomTravel;
    stopIndex++;
    pauseAtRoom();
  }
}

function animate(time) {
  const dt = Math.min(0.05, lastTime ? (time - lastTime) / 1000 : 0);
  lastTime = time;
  updateRide(dt);
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

document.querySelector('#start').addEventListener('click', startRide);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
