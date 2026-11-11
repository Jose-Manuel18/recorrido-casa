// Recorrido virtual: una calle sin salida con un proyecto a cada lado.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { makeMaterials, makeWorld, Ctx } from './kit.js';
import { buildCasa1, CASA1 } from './casa1.js';
import { buildCasa2, CASA2 } from './casa2.js';
import { buildStreet, sign } from './street.js';
import { placePeople } from './people.js';

// ====== Nombres de los carteles (cámbialos aquí) ======
const PROJECTS = [
  { title: 'PROYECTO 1', sub: 'Remodelación de la casa', accent: '#e0a458' },
  { title: 'PROYECTO 2', sub: 'Propuesta del taller', accent: '#8fbf9a' },
];
CASA1.name = cap(PROJECTS[0].title); CASA2.name = cap(PROJECTS[1].title);
function cap(s) { return s.charAt(0) + s.slice(1).toLowerCase(); }

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const isTouch = matchMedia('(pointer: coarse)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const START = { x: 0, z: 9, yaw: 0 };

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  $('fatal').hidden = false; $('intro').hidden = true; throw e;
}
let quality = params.get('q') || (isTouch ? 'media' : 'alta');
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#cfe0ee', 70, 320);
const fovFor = () => (innerWidth < innerHeight ? 86 : 70);
const camera = new THREE.PerspectiveCamera(fovFor(), innerWidth / innerHeight, 0.08, 1500);
camera.rotation.order = 'YXZ';

// ---------- Cielo ----------
const sunDir = new THREE.Vector3(0.3, 0.86, 0.42).normalize();
function skyMaterial(disc) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sunDir: { value: sunDir }, disc: { value: disc } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: `
      uniform vec3 sunDir; uniform float disc; varying vec3 vDir;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for(int i=0;i<5;i++){ s += a*noise(p); p = p*2.03 + 7.1; a *= 0.5; } return s; }
      void main(){
        vec3 d = normalize(vDir); float h = max(d.y, 0.0);
        vec3 zen = vec3(0.13, 0.33, 0.74), hor = vec3(0.60, 0.76, 0.93);
        vec3 col = mix(hor, zen, pow(h, 0.5));
        float sd = max(dot(d, sunDir), 0.0);
        col += vec3(1.0, 0.86, 0.62) * pow(sd, 8.0) * 0.22;
        col += vec3(1.0, 0.95, 0.85) * smoothstep(0.9992, 0.9997, sd) * 24.0 * disc;
        vec2 uv = d.xz / (d.y + 0.3) * 1.5;
        float c = smoothstep(0.50, 0.80, fbm(uv + vec2(3.1, 1.7))) * smoothstep(0.03, 0.3, d.y);
        col = mix(col, vec3(1.0, 0.99, 0.97) * 1.1, c * 0.85);
        if (d.y < 0.0) col = mix(hor, vec3(0.42, 0.47, 0.38), smoothstep(0.0, -0.12, d.y));
        gl_FragColor = vec4(col * 1.2, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}
const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), skyMaterial(1));
sky.frustumCulled = false; scene.add(sky);
{
  const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), skyMaterial(0)));
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(envScene, 0.02).texture; scene.environmentIntensity = 0.42;
  pm.dispose();
}

// ---------- Luces ----------
const hemi = new THREE.HemisphereLight('#dbe8ff', '#b7a184', 0.5); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff0d8', 3.9);
const SUN_C = new THREE.Vector3(2, 0, -16);
sun.position.copy(SUN_C).addScaledVector(sunDir, 140); sun.target.position.copy(SUN_C);
sun.castShadow = true; sun.shadow.mapSize.setScalar(isTouch ? 2048 : 4096);
Object.assign(sun.shadow.camera, { left: -46, right: 46, top: 46, bottom: -46, near: 20, far: 320 });
sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.045;
scene.add(sun, sun.target);

// ---------- Mundo ----------
makeMaterials();
const world = makeWorld();
const root = new Ctx(world, new THREE.Matrix4());
const X1 = -5.19, Z1 = 14.98, X2 = 33.68, Z2 = -31.24;
const c1 = new Ctx(world, new THREE.Matrix4().makeRotationY(Math.PI).setPosition(X1, 0, Z1), CASA1.s, CASA1.ox, CASA1.oy);
const c2 = new Ctx(world, new THREE.Matrix4().makeRotationY(-Math.PI / 2).setPosition(X2, 0, Z2), CASA2.s, CASA2.ox, CASA2.oy);
const lot1 = [X1 - (1157 - 46) / 45, Z1 - (1010 - 40) / 45, X1, Z1];
const lot2 = [X2 - (1290 - 65) / 43, Z2, X2, Z2 + (1392 - 45) / 43];
buildStreet(root, [lot1, lot2]);
const houses = [buildCasa1(c1), buildCasa2(c2)];
houses[0].yaw = Math.PI / 2; houses[1].yaw = -Math.PI / 2;
sign(root, -7.05, -0.35, PROJECTS[0].title, PROJECTS[0].sub, PROJECTS[0].accent);
sign(root, 7.05, 0.45, PROJECTS[1].title, PROJECTS[1].sub, PROJECTS[1].accent);
world.batch.build(scene);
placePeople(scene, world);

// luces de techo: un grupo pequeño que acompaña al jugador
const lampPool = [];
for (let i = 0; i < (isTouch ? 3 : 6); i++) { const l = new THREE.PointLight('#ffe6c4', 0, 9, 1.7); scene.add(l); lampPool.push(l); }

// ---------- Posproceso ----------
let composer = null, gtao = null;
function setupComposer() {
  if (composer) { composer.dispose(); composer = null; }
  if (quality !== 'alta') return;
  const sz = renderer.getDrawingBufferSize(new THREE.Vector2());
  const rt = new THREE.WebGLRenderTarget(sz.x, sz.y, { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  gtao = new GTAOPass(scene, camera, sz.x, sz.y);
  gtao.updateGtaoMaterial({ radius: 0.4, distanceExponent: 1.5, thickness: 1.2, scale: 1.25, samples: 16 });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 10, radiusExponent: 1, rings: 2, samples: 16 });
  gtao.blendIntensity = 1.0;
  // lo que no debe proyectar oclusión (etiquetas, confeti)
  const noAO = []; scene.traverse((o) => { if (o.userData.noAO) noAO.push(o); });
  const ov = gtao.overrideVisibility?.bind(gtao), rv = gtao.restoreVisibility?.bind(gtao);
  if (ov && rv) {
    gtao.overrideVisibility = () => { ov(); for (const o of noAO) { o.userData._v = o.visible; o.visible = false; } };
    gtao.restoreVisibility = () => { rv(); for (const o of noAO) o.visible = o.userData._v; };
  }
  composer.addPass(gtao);
  composer.addPass(new OutputPass());
}
setupComposer();

// ---------- Jugador ----------
const player = { x: +(params.get('x') ?? START.x), z: +(params.get('z') ?? START.z), yaw: +(params.get('yaw') ?? START.yaw), pitch: +(params.get('pitch') ?? 0), vx: 0, vz: 0, bob: 0, jy: 0, vy: 0 };
const R = 0.24, EYE = 1.62;
function resolve(p) {
  for (let it = 0; it < 3; it++) {
    for (const c of world.colliders) {
      const cx = Math.max(c[0], Math.min(p.x, c[2])), cz = Math.max(c[1], Math.min(p.z, c[3]));
      let dx = p.x - cx, dz = p.z - cz; const d2 = dx * dx + dz * dz;
      if (d2 >= R * R) continue;
      if (d2 > 1e-9) { const d = Math.sqrt(d2); p.x = cx + (dx / d) * R; p.z = cz + (dz / d) * R; }
      else { // dentro de la caja: salir por el lado más cercano
        const l = p.x - c[0], r = c[2] - p.x, t = p.z - c[1], b = c[3] - p.z, m = Math.min(l, r, t, b);
        if (m === l) p.x = c[0] - R; else if (m === r) p.x = c[2] + R; else if (m === t) p.z = c[1] - R; else p.z = c[3] + R;
      }
    }
  }
}
function roomAt(x, z) { for (const r of world.rooms) { const b = r.box; if (x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3]) return r; } return null; }

// ---------- Entrada ----------
const keys = new Set();
let playing = false, locked = false, tour = null;
const joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 }, look = { id: null, x: 0, y: 0 };
addEventListener('keydown', (e) => {
  if (e.code === 'KeyM' && playing) toggleMap();
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) && playing) e.preventDefault();
  if (e.code === 'Space' && playing && !tour && $('menu').hidden && player.jy === 0) player.vy = 4.3; // salto
  keys.add(e.code);
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
const canvas = $('c');
canvas.addEventListener('click', () => { if (playing && !isTouch && !locked && !tour) canvas.requestPointerLock?.(); });
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  if (!locked && playing && !tour && !isTouch && $('menu').hidden) openMenu();
});
document.addEventListener('mousemove', (e) => { if (!locked) return; player.yaw -= e.movementX * 0.0022; player.pitch = clampPitch(player.pitch - e.movementY * 0.0022); });
const clampPitch = (p) => Math.max(-1.35, Math.min(1.35, p));
canvas.addEventListener('pointerdown', (e) => {
  if (!playing || locked) return;
  if (e.pointerType === 'touch' && joy.id === null && e.clientX < innerWidth * 0.42 && e.clientY > innerHeight * 0.3) { joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.x = joy.y = 0; }
  else if (look.id === null && (e.pointerType === 'touch' || tour || isTouch)) { look.id = e.pointerId; look.x = e.clientX; look.y = e.clientY; }
  canvas.setPointerCapture?.(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId === joy.id) {
    let dx = (e.clientX - joy.ox) / 52, dy = (e.clientY - joy.oy) / 52; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; }
    joy.x = dx; joy.y = dy; knob(dx, dy);
  } else if (e.pointerId === look.id) {
    player.yaw -= (e.clientX - look.x) * 0.0045; player.pitch = clampPitch(player.pitch - (e.clientY - look.y) * 0.0045); look.x = e.clientX; look.y = e.clientY;
  }
});
const endPtr = (e) => { if (e.pointerId === joy.id) { joy.id = null; joy.x = joy.y = 0; knob(0, 0); } if (e.pointerId === look.id) look.id = null; };
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
const knobEl = document.querySelector('.joy__knob');
function knob(x, y) { knobEl.style.transform = `translate(${x * 32}px, ${y * 32}px)`; }

// ---------- Interfaz ----------
$('go1').textContent = $('t1').textContent = CASA1.name; $('go2').textContent = $('t2').textContent = CASA2.name;
const startBtn = $('start');
startBtn.disabled = false; startBtn.textContent = 'Empezar a caminar';
startBtn.addEventListener('click', begin);
function begin() {
  $('intro').hidden = true; $('hud').hidden = false; playing = true;
  if (!isTouch) canvas.requestPointerLock?.();
  canvas.focus({ preventScroll: true });
  toast(isTouch ? 'Camina con el pulgar izquierdo y arrastra para mirar.' : 'W A S D para caminar · ratón para mirar · Espacio para saltar · Esc abre el menú', 6000);
  perf.t = 0; perf.n = 0; perf.on = quality === 'alta' && !params.has('q');
}
function openMenu() { $('menu').hidden = false; document.exitPointerLock?.(); $('resume').focus(); keys.clear(); }
function closeMenu(lock = true) { $('menu').hidden = true; if (lock && !isTouch && !tour) canvas.requestPointerLock?.(); canvas.focus({ preventScroll: true }); }
$('menu-btn').addEventListener('click', openMenu);
$('resume').addEventListener('click', () => closeMenu());
$('menu').addEventListener('click', (e) => { if (e.target === $('menu')) closeMenu(); });
addEventListener('keydown', (e) => { if (e.code === 'Escape' && !$('menu').hidden && !locked) { /* el navegador ya soltó el ratón */ } });
document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
  stopTour(false);
  const g = b.dataset.go;
  if (g === 'calle') Object.assign(player, { x: START.x, z: START.z, yaw: START.yaw, pitch: 0 });
  else { const h = houses[+g]; Object.assign(player, { x: h.entry[0], z: h.entry[1], yaw: h.yaw, pitch: 0 }); }
  closeMenu();
}));
document.querySelectorAll('[data-tour]').forEach((b) => b.addEventListener('click', () => { closeMenu(false); startTour(+b.dataset.tour); }));
$('tour-stop').addEventListener('click', () => stopTour(true));
$('quality').addEventListener('click', () => {
  quality = quality === 'alta' ? 'media' : 'alta';
  $('quality').textContent = 'Calidad: ' + quality; $('quality').setAttribute('aria-pressed', String(quality === 'alta'));
  setupComposer();
});
$('quality').textContent = 'Calidad: ' + quality; $('quality').setAttribute('aria-pressed', String(quality === 'alta'));
let mapOn = true;
function toggleMap() { mapOn = !mapOn; $('map').hidden = !mapOn; $('map-toggle').textContent = 'Mapa: ' + (mapOn ? 'visible' : 'oculto'); $('map-toggle').setAttribute('aria-pressed', String(mapOn)); }
$('map-toggle').addEventListener('click', toggleMap);
let toastT = 0;
function toast(msg, ms = 3500) { const t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), ms); }

// ---------- Recorrido guiado ----------
function startTour(i) {
  const h = houses[i];
  tour = { pts: h.tour, i: 1, name: i === 0 ? CASA1.name : CASA2.name };
  player.x = h.tour[0][0]; player.z = h.tour[0][1]; player.pitch = 0;
  const dx = h.tour[1][0] - player.x, dz = h.tour[1][1] - player.z; player.yaw = Math.atan2(-dx, -dz);
  $('tour-label').textContent = 'Recorrido guiado · ' + tour.name; $('tourbar').hidden = false;
  document.exitPointerLock?.();
}
function stopTour(msg) {
  if (!tour) return; tour = null; $('tourbar').hidden = true;
  if (msg) toast(isTouch ? 'Recorrido detenido. Sigue caminando por tu cuenta.' : 'Recorrido detenido. Haz clic en la vista para seguir caminando.');
}
function tourStep(dt) {
  const [tx, tz] = tour.pts[tour.i]; let dx = tx - player.x, dz = tz - player.z; const d = Math.hypot(dx, dz), step = 1.9 * dt;
  if (d <= step) { player.x = tx; player.z = tz; tour.i++; if (tour.i >= tour.pts.length) { tour = null; $('tourbar').hidden = true; toast('Fin del recorrido guiado. Ahora puedes caminar por tu cuenta.', 5000); } return; }
  player.x += (dx / d) * step; player.z += (dz / d) * step;
  if (look.id === null) { let dy = Math.atan2(-dx, -dz) - player.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); player.yaw += dy * Math.min(1, dt * 3.2); player.pitch += (0 - player.pitch) * Math.min(1, dt * 2); }
  player.bob += step;
}

// ---------- Mapa ----------
const mapC = $('map'), mg = mapC.getContext('2d');
function drawMap() {
  const S = mapC.width, k = S / 34;
  mg.clearRect(0, 0, S, S); mg.save();
  mg.beginPath(); mg.arc(S / 2, S / 2, S / 2, 0, 7); mg.clip();
  mg.translate(S / 2, S / 2); mg.rotate(player.yaw); mg.scale(k, k); mg.translate(-player.x, -player.z);
  mg.fillStyle = 'rgba(243,239,232,.10)'; mg.fillRect(-3.5, -35.2, 7, 105); mg.beginPath(); mg.arc(0, -44, 9.5, 0, 7); mg.fill();
  mg.fillStyle = 'rgba(224,164,88,.16)'; mg.fillRect(lot1[0], lot1[1], lot1[2] - lot1[0], lot1[3] - lot1[1]);
  mg.fillStyle = 'rgba(143,191,154,.16)'; mg.fillRect(lot2[0], lot2[1], lot2[2] - lot2[0], lot2[3] - lot2[1]);
  mg.fillStyle = 'rgba(243,239,232,.82)';
  const px = player.x, pz = player.z;
  for (const c of world.colliders) { if (c[2] < px - 25 || c[0] > px + 25 || c[3] < pz - 25 || c[1] > pz + 25) continue; mg.fillRect(c[0], c[1], Math.max(c[2] - c[0], 0.14), Math.max(c[3] - c[1], 0.14)); }
  mg.restore();
  mg.fillStyle = '#e0a458'; mg.beginPath(); mg.moveTo(S / 2, S / 2 - 15); mg.lineTo(S / 2 + 10, S / 2 + 11); mg.lineTo(S / 2, S / 2 + 5); mg.lineTo(S / 2 - 10, S / 2 + 11); mg.closePath(); mg.fill();
}

// ---------- Bucle ----------
const clock = new THREE.Clock();
let frame = 0, exposure = 0.9, lastRoom;
const perf = { on: false, t: 0, n: 0 }; // si va lento en calidad alta, baja sola a media
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  frame++;
  if (perf.on && playing) { perf.t += dt; perf.n++; if (perf.t > 4) { perf.on = false; if (perf.n / perf.t < 34) { $('quality').click(); toast('Bajé la calidad gráfica para que camine fluido. Puedes cambiarla en el menú.', 5000); } } }
  if (playing && $('menu').hidden) {
    let ix = joy.x, iy = -joy.y;
    if (keys.has('KeyW') || keys.has('ArrowUp')) iy += 1; if (keys.has('KeyS') || keys.has('ArrowDown')) iy -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1; if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1;
    const mag = Math.hypot(ix, iy);
    if (tour && mag > 0.2) stopTour(true);
    if (tour) tourStep(dt);
    else {
      if (mag > 1) { ix /= mag; iy /= mag; }
      const sp = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 5.2 : 2.7;
      const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw), rx = Math.cos(player.yaw), rz = -Math.sin(player.yaw);
      const tvx = (fx * iy + rx * ix) * sp, tvz = (fz * iy + rz * ix) * sp, a = Math.min(1, dt * 10);
      player.vx += (tvx - player.vx) * a; player.vz += (tvz - player.vz) * a;
      player.x += player.vx * dt; player.z += player.vz * dt;
      resolve(player);
      player.bob += Math.hypot(player.vx, player.vz) * dt;
    }
  } else if (!playing && !reduceMotion && !params.has('x')) {
    player.yaw = START.yaw + Math.sin(t * 0.18) * 0.35;
  }
  const bob = reduceMotion ? 0 : Math.sin(player.bob * 3.4) * 0.022;
  if (player.vy !== 0 || player.jy > 0) { player.vy -= 13 * dt; player.jy += player.vy * dt; if (player.jy <= 0) { player.jy = 0; player.vy = 0; } }
  camera.position.set(player.x, EYE + bob + player.jy, player.z);
  camera.rotation.set(player.pitch, player.yaw, 0);
  sky.position.copy(camera.position);

  if (frame % 6 === 1) {
    const r = roomAt(player.x, player.z);
    if (r !== lastRoom) { lastRoom = r; $('place-house').textContent = r ? r.house : 'Calle'; $('place-room').textContent = r ? r.name : ''; }
    // luces de techo cercanas
    const near = world.lamps.map((l) => [(l[0] - player.x) ** 2 + (l[2] - player.z) ** 2, l]).sort((a, b) => a[0] - b[0]);
    lampPool.forEach((L, i) => { const n = near[i]; if (!n) { L.intensity = 0; return; } const d = Math.sqrt(n[0]); L.position.set(n[1][0], n[1][1], n[1][2]); L.intensity = 9 * Math.max(0, Math.min(1, (11 - d) / 5)); });
  }
  const target = lastRoom && !lastRoom.ext ? 1.1 : 0.9;
  exposure += (target - exposure) * Math.min(1, dt * 1.8); renderer.toneMappingExposure = exposure;
  for (const p of world.dynamic) p.userData.update(t, camera.position);
  if (playing && mapOn && frame % 3 === 0) drawMap();
  if (composer) composer.render(); else renderer.render(scene, camera);
}
renderer.setAnimationLoop(tick);

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.fov = fovFor(); camera.updateProjectionMatrix();
  if (composer) { const sz = renderer.getDrawingBufferSize(new THREE.Vector2()); composer.setSize(innerWidth, innerHeight); gtao?.setSize(sz.x, sz.y); }
});

// ---------- Utilidades de verificación ----------
function tourCheck() {
  const out = [];
  houses.forEach((h, hi) => {
    for (let i = 1; i < h.tour.length; i++) {
      const [ax, az] = h.tour[i - 1], [bx, bz] = h.tour[i], n = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.06);
      for (let s = 0; s <= n; s++) {
        const x = ax + ((bx - ax) * s) / n, z = az + ((bz - az) * s) / n;
        const hit = world.colliders.find((c) => { const cx = Math.max(c[0], Math.min(x, c[2])), cz = Math.max(c[1], Math.min(z, c[3])); return (x - cx) ** 2 + (z - cz) ** 2 < 0.2 * 0.2; });
        if (hit) { out.push({ casa: hi + 1, tramo: i, en: [+x.toFixed(2), +z.toFixed(2)], caja: hit.map((v) => +v.toFixed(2)) }); break; }
      }
    }
  });
  return out;
}
window.__app = { world, player, houses, tourCheck, begin, startTour, c1, c2, renderer, scene, setQuality(q) { quality = q; setupComposer(); } };
if (params.has('x') || params.has('play')) { $('intro').hidden = true; $('hud').hidden = false; playing = true; }
