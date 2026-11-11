// La calle sin salida, las aceras, los vecinos y los carteles de cada proyecto. Coordenadas en metros del mundo.
import { THREE, M, K } from './kit.js';
import { wallFree } from './build.js';
import * as F from './furniture.js';

const ROAD = 3.5, WALK = 1.6, EDGE = ROAD + WALK; // 5.1
const N_END = -35.2, S_END = 70, CUL = [0, -44], CUL_R = 9.5;

function signTexture(title, sub, accent) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 448;
  const g = c.getContext('2d');
  g.fillStyle = '#20262b'; g.fillRect(0, 0, 1024, 448);
  g.fillStyle = accent; g.fillRect(0, 0, 1024, 26);
  g.fillStyle = '#f3efe8'; g.textAlign = 'center'; g.textBaseline = 'middle';
  let size = 190; g.font = `700 ${size}px system-ui, "Segoe UI", Arial, sans-serif`;
  while (g.measureText(title).width > 920 && size > 60) { size -= 8; g.font = `700 ${size}px system-ui, "Segoe UI", Arial, sans-serif`; }
  g.fillText(title, 512, 200);
  g.fillStyle = accent; g.font = '500 58px system-ui, "Segoe UI", Arial, sans-serif'; g.fillText(sub, 512, 360);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Cartel grande de doble cara, perpendicular a la calle. */
export function sign(c, x, z, title, sub, accent) {
  const w = 3.3, h = 1.45, y = 2.5;
  const t = signTexture(title, sub, accent); t.repeat.set(1 / w, 1 / h);
  const mat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.55, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.12 });
  c.box(M.frame, w + 0.12, h + 0.12, 0.06, x, y - 0.06, z);
  c.box(mat, w, h, 0.1, x, y, z);
  for (const s of [-1, 1]) { c.cyl(M.frame, 0.06, y + h, x + s * (w / 2 - 0.15), 0, z, { seg: 10 }); c.w.colliders.push([x + s * (w / 2 - 0.15) - 0.1, z - 0.1, x + s * (w / 2 - 0.15) + 0.1, z + 0.1]); }
}

function nbWall(c, x, z1, z2, gateAt) {
  const len = Math.abs(z2 - z1), zc = (z1 + z2) / 2;
  c.box(M.lotWall, 0.18, 2.2, len, x, 0, zc); c.colBox(0.3, len, x, zc);
  const s = Math.sign(x);
  c.rbox(M.leaf, 0.5, 0.7, len - 0.4, x + s * 0.35, 1.9, zc, 0.15);
  for (const gz of gateAt || []) { c.box(K('#3a3f44', 0.5, 0.4), 0.06, 2.0, 3.2, x - s * 0.1, 0, gz); for (let i = 0; i < 6; i++) c.box(K('#4a5056', 0.5, 0.4), 0.02, 0.03, 3.2, x - s * 0.135, 0.25 + i * 0.33, gz); }
}

function nbHouse(c, x, z, w, d, h, roofCol) {
  c.box(M.wallWarm, w, h, d, x, 0, z);
  c.box(K(roofCol, 0.9), w + 0.7, 0.22, d + 0.7, x, h, z);
  const s = -Math.sign(x) || 1, fx = x + s * (w / 2 + 0.02);
  const floors = Math.round(h / 3);
  for (let f = 0; f < floors; f++) for (let i = 0; i < 3; i++) { c.box(M.frame, 0.06, 1.25, 1.5, fx, 0.95 + f * 3, z - d / 3 + (d / 3) * i); c.box(M.glass, 0.02, 1.1, 1.35, fx + s * 0.03, 1.02 + f * 3, z - d / 3 + (d / 3) * i); }
}

export function buildStreet(c, lots) {
  const [l1, l2] = lots; // rectángulos del mundo [x1,z1,x2,z2]
  // terreno
  c.box(M.grass, 500, 0.1, 500, 0, -0.16, 0);
  for (const l of lots) c.box(M.grass, l[2] - l[0], 0.1, l[3] - l[1], (l[0] + l[2]) / 2, -0.1, (l[1] + l[3]) / 2);
  // calzada y redondel final
  c.box(M.asphalt, ROAD * 2, 0.08, S_END - N_END, 0, -0.06, (S_END + N_END) / 2);
  c.cyl(M.asphalt, CUL_R, 0.08, CUL[0], -0.06, CUL[1], { seg: 56 });
  for (let z = N_END + 4; z < S_END; z += 5) c.box(M.line, 0.12, 0.004, 2, 0, 0.019, z);
  for (const s of [-1, 1]) {
    c.box(M.concrete, WALK, 0.16, S_END - N_END, s * (ROAD + WALK / 2), 0, (S_END + N_END) / 2);
    c.box(K("#a8a59e", 0.9), 0.14, 0.17, S_END - N_END, s * (ROAD + 0.07), 0, (S_END + N_END) / 2);
  }
  { // acera del redondel
    const g = new THREE.RingGeometry(CUL_R, CUL_R + WALK, 56, 1, 0, Math.PI * 2), uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 22, uv.getY(i) * 22);
    c.add(g, M.concrete, CUL[0], 0.16, CUL[1], 0, -90);
    const a1 = Math.asin(ROAD / CUL_R);
    for (let i = 0; i < 56; i++) { const a = a1 + ((2 * Math.PI - 2 * a1) * (i + 0.5)) / 56; c.box(K("#a8a59e", 0.9), (2 * Math.PI * CUL_R) / 56 + 0.05, 0.17, 0.14, CUL[0] + Math.sin(a) * (CUL_R + 0.07), 0, CUL[1] + Math.cos(a) * (CUL_R + 0.07), (a * 180) / Math.PI); }
  }
  // isla central con palma
  c.cyl(K("#a8a59e", 0.9), 2.3, 0.22, CUL[0], 0, CUL[1], { seg: 32 }); c.cyl(M.grass, 2.15, 0.02, CUL[0], 0.215, CUL[1], { seg: 32 });
  F.palm(c.at(CUL[0], CUL[1], 0, 0.2), 8.5); for (let i = 0; i < 5; i++) F.bush(c.at(CUL[0] + Math.cos(i * 1.257) * 1.4, CUL[1] + Math.sin(i * 1.257) * 1.4, 0, 0.2), 0.45);
  c.w.colliders.push([CUL[0] - 2.3, CUL[1] - 2.3, CUL[0] + 2.3, CUL[1] + 2.3]);
  // muro curvo del fondo
  const R = CUL_R + WALK + 0.1, a0 = Math.asin(EDGE / R), n = 16;
  for (let i = 0; i < n; i++) {
    const a = a0 + ((2 * Math.PI - 2 * a0) * i) / n, b = a0 + ((2 * Math.PI - 2 * a0) * (i + 1)) / n;
    wallFree(c, CUL[0] + Math.sin(a) * R, CUL[1] + Math.cos(a) * R, CUL[0] + Math.sin(b) * R, CUL[1] + Math.cos(b) * R, { h: 2.2, t: 0.18, mat: M.lotWall });
  }
  const zJoin = CUL[1] + Math.cos(a0) * R;
  // muros de vecinos a ambos lados
  const X = EDGE + 0.09;
  nbWall(c, -X, l1[1], zJoin, [-18]); nbWall(c, -X, l1[3], S_END, [26, 48]);
  nbWall(c, X, l2[1], zJoin); nbWall(c, X, l2[3], S_END, [10, 34, 56]);
  c.w.colliders.push([-EDGE - 1, 21, EDGE + 1, 22]); // límite sur del recorrido
  // casas y árboles de los vecinos
  nbHouse(c, -14, -20, 10, 13, 3.3, '#b8674a'); nbHouse(c, -14.5, 30, 11, 14, 6.3, '#e9e4d8'); nbHouse(c, -14, 52, 10, 13, 3.3, '#b8674a');
  nbHouse(c, 14.5, 14, 11, 13, 6.3, '#b8674a'); nbHouse(c, 14, 36, 10, 14, 3.3, '#e9e4d8'); nbHouse(c, 14.5, 56, 11, 12, 6.3, '#e9e4d8');
  nbHouse(c, -3, -60, 16, 10, 6.3, '#b8674a');
  for (const [x, z, h] of [[-7.4, -12, 8], [-7.6, -29, 7], [-8, 22, 8.5], [-7.6, 42, 7.5], [7.6, 6, 8], [7.8, 24, 7], [7.6, 46, 8.5], [-16, -44, 9], [15, -46, 8], [7.5, 64, 8]]) F.palm(c.at(x, z), h);
  for (const [x, z, h, r] of [[-22, -34, 7, 3.2], [24, -44, 7.5, 3.4], [-24, 44, 7, 3], [26, 26, 7, 3.2], [-2, -52, 6, 2.6], [10, -50, 6.5, 3], [-26, 20, 7, 3], [24, 60, 7, 3]]) F.tree(c.at(x, z), h, r);
  // farolas
  for (const [x, z, d] of [[-3.75, -22, 90], [3.75, -14, -90], [-3.75, 15, 90], [3.75, 19.5, -90], [-3.75, 34, 90], [3.75, 50, -90]]) F.streetLamp(c.at(x, z, d, 0.16));
}

export { EDGE };
