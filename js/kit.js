// Kit de construcción: texturas procedurales, materiales, lotes de geometría y contexto de dibujo.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// ---------- Texturas ----------
function tex(size, meters, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / meters, 1 / meters);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function speckle(g, s, n, colors, alpha, r0, r1, r) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = colors[(r() * colors.length) | 0];
    g.globalAlpha = alpha * (0.4 + 0.6 * r());
    const x = r() * s, y = r() * s, rad = r0 + r() * (r1 - r0);
    for (const dx of [0, -s, s]) for (const dy of [0, -s, s]) {
      if (x + dx < -rad || x + dx > s + rad || y + dy < -rad || y + dy > s + rad) continue;
      g.beginPath(); g.arc(x + dx, y + dy, rad, 0, 6.3); g.fill();
    }
  }
  g.globalAlpha = 1;
}
const fill = (g, s, c) => { g.fillStyle = c; g.fillRect(0, 0, s, s); };

function makeTextures() {
  const T = {};
  T.plaster = tex(512, 2, (g, s) => { const r = rng(1); fill(g, s, '#f4f1ea'); speckle(g, s, 5000, ['#fff', '#d9d4c8', '#e8e2d6'], 0.10, 0.6, 2.2, r); });
  T.plasterBump = tex(512, 2, (g, s) => { const r = rng(2); fill(g, s, '#808080'); speckle(g, s, 9000, ['#fff', '#000'], 0.10, 0.5, 2.5, r); }, false);
  T.tile = tex(512, 1.2, (g, s) => {
    const r = rng(3); fill(g, s, '#b9b2a4');
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const v = 226 + ((r() * 10) | 0);
      g.fillStyle = `rgb(${v},${v - 4},${v - 12})`; g.fillRect(i * 256 + 2, j * 256 + 2, 252, 252);
    }
    speckle(g, s, 500, ['#fff', '#cfc6b4'], 0.10, 4, 22, r);
  });
  T.wood = tex(1024, 1.6, (g, s) => {
    const r = rng(4); fill(g, s, '#c79a63');
    const ph = s / 8;
    for (let j = 0; j < 8; j++) {
      let x = -r() * 300;
      while (x < s) {
        const w = 380 + r() * 300, v = r();
        g.fillStyle = `rgb(${(196 + v * 26) | 0},${(150 + v * 24) | 0},${(98 + v * 20) | 0})`;
        g.fillRect(x, j * ph, w - 1.5, ph - 1.5);
        g.globalAlpha = 0.10;
        for (let k = 0; k < 14; k++) { g.fillStyle = r() > 0.5 ? '#7a5327' : '#f1d9ae'; g.fillRect(x, j * ph + r() * ph, w, 1 + r() * 1.5); }
        g.globalAlpha = 1; x += w;
      }
    }
  });
  T.birch = tex(512, 1, (g, s) => {
    const r = rng(5); fill(g, s, '#e6cfa3');
    g.globalAlpha = 0.09;
    for (let k = 0; k < 260; k++) { g.fillStyle = r() > 0.5 ? '#b48f55' : '#fff3d6'; g.fillRect(0, r() * s, s, 1 + r() * 2.5); }
    g.globalAlpha = 1;
  });
  T.terra = tex(512, 0.9, (g, s) => {
    const r = rng(6); fill(g, s, '#8c7a6a');
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const v = r(); g.fillStyle = `rgb(${(182 + v * 22) | 0},${(104 + v * 18) | 0},${(72 + v * 14) | 0})`;
      g.fillRect(i * s / 3 + 2.5, j * s / 3 + 2.5, s / 3 - 5, s / 3 - 5);
    }
    speckle(g, s, 900, ['#d99772', '#8f4f33'], 0.10, 1, 6, r);
  });
  T.concrete = tex(512, 3, (g, s) => {
    const r = rng(7); fill(g, s, '#b8b5ae'); speckle(g, s, 5000, ['#d2cfc8', '#96938c', '#a8a59e'], 0.16, 1, 7, r);
    g.strokeStyle = 'rgba(70,68,64,.55)'; g.lineWidth = 2.5; g.beginPath();
    g.moveTo(0, 1); g.lineTo(s, 1); g.moveTo(1, 0); g.lineTo(1, s); g.moveTo(0, s / 2); g.lineTo(s, s / 2); g.moveTo(s / 2, 0); g.lineTo(s / 2, s); g.stroke();
  });
  T.pavers = tex(512, 1.6, (g, s) => {
    const r = rng(8); fill(g, s, '#7d766c');
    const bw = s / 8, bh = s / 16;
    for (let j = 0; j < 16; j++) for (let i = -1; i < 8; i++) {
      const v = r(); g.fillStyle = `rgb(${(168 + v * 34) | 0},${(158 + v * 30) | 0},${(142 + v * 28) | 0})`;
      g.fillRect(i * bw + (j % 2) * bw / 2 + 1.5, j * bh + 1.5, bw - 3, bh - 3);
    }
  });
  T.asphalt = tex(512, 4, (g, s) => { const r = rng(9); fill(g, s, '#3d3e40'); speckle(g, s, 9000, ['#55575a', '#2b2c2e', '#6b6d70'], 0.35, 0.6, 2.4, r); speckle(g, s, 60, ['#2a2b2d', '#4c4e51'], 0.18, 20, 70, r); });
  T.grass = tex(512, 5, (g, s) => {
    const r = rng(10); fill(g, s, '#5f8a3c');
    speckle(g, s, 80, ['#557f35', '#6d9a44', '#4f7631'], 0.35, 25, 90, r);
    speckle(g, s, 14000, ['#7aa84c', '#4c7430', '#88b257', '#3f6628'], 0.5, 0.6, 2.2, r);
  });
  T.gravel = tex(512, 2, (g, s) => { const r = rng(11); fill(g, s, '#b9ad98'); speckle(g, s, 7000, ['#d8cfbe', '#8f8676', '#a39a88', '#e6dfd0'], 0.8, 1.5, 4.5, r); });
  T.rubber = tex(256, 1.5, (g, s) => { const r = rng(12); fill(g, s, '#ffffff'); speckle(g, s, 5000, ['#000', '#fff'], 0.07, 0.6, 1.8, r); });
  T.leaf = tex(512, 0.9, (g, s) => { const r = rng(13); fill(g, s, '#3c6b2e'); speckle(g, s, 60, ['#335f28', '#467a36'], 0.5, 30, 80, r); speckle(g, s, 9000, ['#5a9440', '#2f5a24', '#6aa64c', '#28501f', '#4b8438'], 0.7, 1.2, 4, r); });
  T.bark = tex(256, 0.8, (g, s) => { const r = rng(14); fill(g, s, '#6e5a48'); g.globalAlpha = 0.3; for (let k = 0; k < 120; k++) { g.fillStyle = r() > 0.5 ? '#4a3b2e' : '#8c7662'; g.fillRect(r() * s, 0, 1 + r() * 3, s); } g.globalAlpha = 1; });
  T.cork = tex(256, 0.6, (g, s) => { const r = rng(15); fill(g, s, '#c39a68'); speckle(g, s, 4000, ['#a67c4b', '#d9b382', '#8f6839'], 0.5, 0.8, 2.6, r); });
  T.fabric = tex(256, 0.4, (g, s) => { const r = rng(16); fill(g, s, '#fff'); g.globalAlpha = 0.08; g.fillStyle = '#000'; for (let k = 0; k < s; k += 4) { g.fillRect(k, 0, 1.5, s); g.fillRect(0, k, s, 1.5); } g.globalAlpha = 1; speckle(g, s, 800, ['#000', '#fff'], 0.05, 1, 3, r); });
  return T;
}

// ---------- Materiales ----------
export const M = {};
const colorCache = new Map();
/** Material de color liso (cacheado). */
export function K(hex, rough = 0.75, metal = 0) {
  const key = hex + '|' + rough + '|' + metal;
  let m = colorCache.get(key);
  if (!m) { m = new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal }); colorCache.set(key, m); }
  return m;
}
/** Material de tela/alfombra de color. */
export function KF(hex) {
  const key = 'f' + hex;
  let m = colorCache.get(key);
  if (!m) { m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.95, map: M._T.fabric }); colorCache.set(key, m); }
  return m;
}
/** Piso de caucho de color (áreas de juego). */
export function KR(hex) {
  const key = 'r' + hex;
  let m = colorCache.get(key);
  if (!m) { m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.92, map: M._T.rubber }); colorCache.set(key, m); }
  return m;
}

export const PAL = { sage: '#8fae8b', mustard: '#e3b04b', blue: '#6f9bb8', terra: '#d0785a', pink: '#e7a6a1', cream: '#f2e6d0', teal: '#4f9d94', lilac: '#a99bc9' };
export const PALV = Object.values(PAL);

export function makeMaterials() {
  const T = makeTextures(); M._T = T;
  const S = (o) => new THREE.MeshStandardMaterial(o);
  M.wall = S({ color: '#f3f0ea', map: T.plaster, bumpMap: T.plasterBump, bumpScale: 0.6, roughness: 0.93 });
  M.wallWarm = S({ color: '#f0dcc0', map: T.plaster, bumpMap: T.plasterBump, bumpScale: 0.6, roughness: 0.93 });
  M.lotWall = S({ color: '#e9e4d8', map: T.plaster, bumpMap: T.plasterBump, bumpScale: 0.8, roughness: 0.95 });
  M.roof = S({ color: '#f4f2ee', map: T.plaster, roughness: 0.95 });
  M.base = S({ color: '#e9e6df', roughness: 0.6 });
  M.frame = S({ color: '#33373b', roughness: 0.45, metalness: 0.6 });
  M.glass = new THREE.MeshPhysicalMaterial({ color: '#dff0f4', roughness: 0.03, metalness: 0, transparent: true, opacity: 0.09, envMapIntensity: 1.1, side: THREE.DoubleSide, depthWrite: false });
  M.glass.userData.noShadow = true;
  M.door = S({ color: '#ffffff', map: T.birch, roughness: 0.55 });
  M.doorFrame = S({ color: '#f6f4ef', roughness: 0.5 });
  M.tile = S({ color: '#ffffff', map: T.tile, roughness: 0.42, envMapIntensity: 0.45 });
  M.wood = S({ color: '#ffffff', map: T.wood, roughness: 0.5, envMapIntensity: 0.45 });
  M.terra = S({ color: '#ffffff', map: T.terra, roughness: 0.7 });
  M.concrete = S({ color: '#ffffff', map: T.concrete, roughness: 0.9 });
  M.polished = S({ color: '#d8d5cf', map: T.concrete, roughness: 0.55, envMapIntensity: 0.5 });
  M.pavers = S({ color: '#ffffff', map: T.pavers, roughness: 0.9 });
  M.asphalt = S({ color: '#ffffff', map: T.asphalt, roughness: 0.95 });
  M.grass = S({ color: '#ffffff', map: T.grass, roughness: 1 });
  M.gravel = S({ color: '#ffffff', map: T.gravel, roughness: 1 });
  M.birch = S({ color: '#ffffff', map: T.birch, roughness: 0.6 });
  M.oak = S({ color: '#c9a070', map: T.birch, roughness: 0.6 });
  M.white = S({ color: '#f7f6f2', roughness: 0.45 });
  M.ceramic = S({ color: '#ffffff', roughness: 0.12, envMapIntensity: 0.8 });
  M.steel = S({ color: '#c9ccd0', roughness: 0.3, metalness: 0.9 });
  M.dark = S({ color: '#2a2c2f', roughness: 0.6 });
  M.cork = S({ color: '#ffffff', map: T.cork, roughness: 0.95 });
  M.leaf = S({ color: '#ffffff', map: T.leaf, roughness: 0.95 });
  M.leaf2 = S({ color: '#b9d98a', map: T.leaf, roughness: 0.95 });
  M.leafDark = S({ color: '#3d6e36', roughness: 0.55 }); M.leafLight = S({ color: '#5c9148', roughness: 0.55 });
  M.palm = S({ color: '#4f8a3a', roughness: 0.85, side: THREE.DoubleSide });
  M.bark = S({ color: '#ffffff', map: T.bark, roughness: 1 });
  M.pot = S({ color: '#d9d4c8', roughness: 0.8 });
  M.soil = S({ color: '#4a3a2c', roughness: 1 });
  M.sand = S({ color: '#e2cfa0', map: T.gravel, roughness: 1 });
  M.mirror = S({ color: '#dfe7ea', roughness: 0.04, metalness: 1 });
  M.screen = S({ color: '#15181c', roughness: 0.15 });
  M.lamp = S({ color: '#ffffff', emissive: '#fff1d6', emissiveIntensity: 1.6, roughness: 0.6 });
  M.lamp.userData.noShadow = true;
  M.line = S({ color: '#e9e6dc', roughness: 0.9 });
  return M;
}

// ---------- Geometría ----------
/** Caja con UV en metros (la textura mantiene su escala real). */
export function boxGeo(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0], uv.getY(k) * dims[f][1]); }
  return g;
}

export class Batch {
  constructor() { this.m = new Map(); }
  add(geo, mat, matrix) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
    g.applyMatrix4(matrix);
    let l = this.m.get(mat); if (!l) this.m.set(mat, l = []);
    l.push(g);
  }
  build(parent) {
    for (const [mat, list] of this.m) {
      const mesh = new THREE.Mesh(mergeGeometries(list, false), mat);
      mesh.castShadow = !mat.userData.noShadow; mesh.receiveShadow = true;
      if (mat.transparent) mesh.renderOrder = 2;
      parent.add(mesh);
      list.forEach((g) => g.dispose());
    }
    this.m.clear();
  }
}

const _e = new THREE.Euler(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _m = new THREE.Matrix4(), _v = new THREE.Vector3();
const RAD = Math.PI / 180;

/** Contexto de dibujo: transforma coordenadas locales (metros o px del plano) al mundo. */
export class Ctx {
  constructor(world, matrix, s = 1, ox = 0, oy = 0) { this.w = world; this.M = matrix; this.s = s; this.ox = ox; this.oy = oy; }
  /** px del plano → metros locales */
  P(px, py) { return [(px - this.ox) * this.s, (py - this.oy) * this.s]; }
  at(x, z, deg = 0, y = 0) {
    const m = new THREE.Matrix4().makeRotationY(deg * RAD).setPosition(x, y, z);
    return new Ctx(this.w, this.M.clone().multiply(m));
  }
  atp(px, py, deg = 0) { const [x, z] = this.P(px, py); return this.at(x, z, deg); }
  /** local → mundo */
  toWorld(x, z, y = 0) { _v.set(x, y, z).applyMatrix4(this.M); return [_v.x, _v.z, _v.y]; }
  /** Ángulo (yaw) del eje local +Z en el mundo. */
  get yaw() { const e = this.M.elements; return Math.atan2(e[8], e[10]); }
  add(geo, mat, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) {
    _e.set(rx * RAD, ry * RAD, rz * RAD, 'YXZ'); _q.setFromEuler(_e); _p.set(x, y, z);
    _m.compose(_p, _q, _s);
    this.w.batch.add(geo, mat, _m.premultiply(this.M));
  }
  /** Caja apoyada en y (centro en x,z). */
  box(mat, w, h, d, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) { this.add(boxGeo(w, h, d), mat, x, y + h / 2, z, ry, rx, rz); }
  rbox(mat, w, h, d, x = 0, y = 0, z = 0, r = 0.03, ry = 0) { this.add(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.01, h / 2.01, d / 2.01)), mat, x, y + h / 2, z, ry); }
  cyl(mat, r, h, x = 0, y = 0, z = 0, o = {}) { this.add(new THREE.CylinderGeometry(o.rt ?? r, r, h, o.seg ?? 20), mat, x, y + h / 2, z, o.ry ?? 0, o.rx ?? 0, o.rz ?? 0); }
  sph(mat, r, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, seg = 14) { const g = new THREE.SphereGeometry(r, seg, Math.max(8, (seg * 0.7) | 0)); g.scale(sx, sy, sz); this.add(g, mat, x, y, z); }
  /** Colisionador AABB (coordenadas locales en metros). */
  col(x1, z1, x2, z2) {
    let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
    for (const [x, z] of [[x1, z1], [x2, z1], [x1, z2], [x2, z2]]) { const [wx, wz] = this.toWorld(x, z); a = Math.min(a, wx); b = Math.min(b, wz); c = Math.max(c, wx); d = Math.max(d, wz); }
    this.w.colliders.push([a, b, c, d]);
  }
  colBox(w, d, x = 0, z = 0) { this.col(x - w / 2, z - d / 2, x + w / 2, z + d / 2); }
}

/** Estado compartido del mundo. */
export function makeWorld() {
  return { batch: new Batch(), colliders: [], rooms: [], lamps: [], spots: [], dynamic: [] };
}
export { THREE };
