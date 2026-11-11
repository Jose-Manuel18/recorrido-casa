// Mobiliario y vegetación. Origen en el piso; el frente mira a +Z; lo que va contra un muro tiene el respaldo en z=0.
import { M, K, KF, KR, PALV, rng, THREE } from './kit.js';

const R = rng(77);
const pick = (a) => a[(R() * a.length) | 0];
const FL = 0.03; // nivel de piso terminado

export function chair(c, col = pick(PALV), k = 0.62) {
  const sh = 0.46 * k, w = 0.42 * k, d = 0.42 * k, l = 0.028;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) c.box(M.birch, l, sh + (sz < 0 ? 0.42 * k : 0), l, sx * (w / 2 - l), FL, sz * (d / 2 - l));
  c.rbox(K(col), w, 0.035, d, 0, FL + sh - 0.02, 0, 0.012);
  c.rbox(K(col), w, 0.2 * k + 0.04, 0.025, 0, FL + sh + 0.2 * k, -d / 2 + l, 0.01);
}

/** Mesa con sillas a ambos lados largos. */
export function tableSet(c, o = {}) {
  const k = o.k ?? 0.62, w = o.w ?? 1.2, d = o.d ?? 0.65, h = (o.h ?? 0.74) * (k < 0.9 ? 0.74 : 1), n = o.n ?? 2;
  const top = o.top ?? M.birch, l = 0.045;
  c.rbox(top, w, 0.035, d, 0, FL + h - 0.035, 0, 0.015);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) c.box(o.legs ?? M.birch, l, h - 0.035, l, sx * (w / 2 - 0.07), FL, sz * (d / 2 - 0.07));
  const off = d / 2 + 0.1 * k + 0.06;
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (w * (i + 0.5)) / n;
    chair(c.at(x, off, 180), o.cols ? o.cols[i % o.cols.length] : undefined, k);
    chair(c.at(x, -off, 0), o.cols ? o.cols[(i + 1) % o.cols.length] : undefined, k);
  }
  if (o.ends) { chair(c.at(w / 2 + off - d / 2 + 0.05, 0, -90), undefined, k); chair(c.at(-w / 2 - off + d / 2 - 0.05, 0, 90), undefined, k); }
  c.colBox(w + (o.ends ? 0.9 * k : 0.05), d + 0.95 * k);
}

export function roundTable(c, r = 0.55, o = {}) {
  const k = o.k ?? 0.62, h = 0.74 * (k < 0.9 ? 0.74 : 1), n = o.n ?? 4;
  c.cyl(o.top ?? M.birch, r, 0.035, 0, FL + h - 0.035, 0, { seg: 36 });
  c.cyl(M.white, 0.04, h - 0.035, 0, FL, 0); c.cyl(M.white, r * 0.55, 0.02, 0, FL, 0, { seg: 24 });
  for (let i = 0; i < n; i++) { const a = (i / n) * 360 + 45; const rr = r + 0.12 * k + 0.05; chair(c.at(Math.sin(a * Math.PI / 180) * rr, Math.cos(a * Math.PI / 180) * rr, a + 180), undefined, k); }
  c.colBox(2 * r + 0.8 * k, 2 * r + 0.8 * k);
}

/** Estante de casilleros abiertos (respaldo en z=0). */
export function cubby(c, w = 1.6, h = 0.9, d = 0.36, cols = 4, rows = 2, bins = 0.55) {
  const t = 0.02, cw = (w - t) / cols, ch = (h - t) / rows;
  c.box(M.birch, w, h, 0.01, 0, FL, 0.005);
  for (let i = 0; i <= cols; i++) c.box(M.birch, t, h, d, -w / 2 + t / 2 + i * cw, FL, d / 2);
  for (let j = 0; j <= rows; j++) c.box(M.birch, w, t, d, 0, FL + j * ch, d / 2);
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = -w / 2 + t / 2 + (i + 0.5) * cw, y = FL + j * ch + t;
    const v = R();
    if (v < bins) c.rbox(K(pick(PALV), 0.6), cw - 0.05, ch * 0.62, d - 0.06, x, y, d / 2 + 0.01, 0.015);
    else if (v < bins + 0.3) books(c.at(x, d / 2, 0, y - 0), cw - 0.06, ch - 0.06);
  }
  c.colBox(w, d, 0, d / 2);
}
function books(c, w, hmax) {
  let x = -w / 2;
  while (x < w / 2 - 0.05) { const bw = 0.018 + R() * 0.03, bh = Math.min(hmax, 0.17 + R() * 0.1); c.box(K(pick(['#c9553f', '#3f6f8f', '#e0b34c', '#6f9a6a', '#f1ece0', '#8e6fa8', '#d98a5a']), 0.7), bw, bh, 0.16 + R() * 0.04, x + bw / 2, 0, 0); x += bw + 0.002; if (R() < 0.08) x += 0.06; }
}

export function whiteboard(c, w = 2, h = 1.1, y = 0.85) {
  c.box(M.steel, w + 0.05, h + 0.05, 0.02, 0, y, 0.012);
  c.box(K('#fbfbf7', 0.25), w, h, 0.012, 0, y + 0.025, 0.022);
  c.box(M.steel, w * 0.8, 0.018, 0.07, 0, y - 0.01, 0.05);
  for (let i = 0; i < 3; i++) c.box(K(pick(PALV)), 0.1, 0.025, 0.025, -0.2 + i * 0.2, y + 0.008, 0.06);
}
export function pinboard(c, w = 1.6, h = 1, y = 0.95) {
  c.box(M.birch, w + 0.06, h + 0.06, 0.02, 0, y, 0.012);
  c.box(M.cork, w, h, 0.012, 0, y + 0.03, 0.02);
  const n = Math.max(3, Math.round(w / 0.32));
  for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) if (R() < 0.85)
    c.box(K(pick([...PALV, '#ffffff', '#fdf3d0']), 0.9), 0.2, 0.27, 0.004, -w / 2 + (w * (i + 0.5)) / n, y + 0.12 + j * (h * 0.45) + R() * 0.05, 0.03, 0, 0, (R() - 0.5) * 10);
}
export function rug(c, r = 1.1, col = pick(PALV)) { c.cyl(KF(col), r, 0.012, 0, FL, 0, { seg: 44 }); c.cyl(KF('#f4eee2'), r * 0.72, 0.014, 0, FL, 0, { seg: 44 }); c.cyl(KF(col), r * 0.42, 0.016, 0, FL, 0, { seg: 44 }); }
export function rugRect(c, w, d, col = pick(PALV)) { c.rbox(KF(col), w, 0.014, d, 0, FL, 0, 0.006); }
export function cushion(c, col = pick(PALV)) { c.sph(KF(col), 0.24, 0, FL + 0.07, 0, 1, 0.32, 1); }
export function beanbag(c, col = pick(PALV)) { c.sph(KF(col), 0.42, 0, FL + 0.24, 0, 1, 0.62, 1, 18); c.sph(KF(col), 0.26, 0, FL + 0.48, -0.1, 1, 0.8, 0.9); c.colBox(0.7, 0.7); }

export function plant(c, h = 1.3) {
  c.cyl(M.pot, 0.17, 0.36, 0, FL, 0, { rt: 0.22 }); c.cyl(M.soil, 0.2, 0.02, 0, FL + 0.35, 0);
  c.cyl(M.bark, 0.018, h - 0.5, 0, FL + 0.36, 0, { seg: 6 });
  for (let i = 0; i < 16; i++) { const a = i * 137.5, t = i / 16, tilt = 20 + t * 55, len = 0.3 + R() * 0.16, y = FL + 0.5 + (h - 0.6) * (1 - t * 0.75); const lf = new THREE.SphereGeometry(1, 8, 6); lf.scale(0.11, 0.012, len / 2); lf.translate(0, 0, len / 2 + 0.02); c.add(lf, i % 3 ? M.leafDark : M.leafLight, 0, y, 0, a, tilt - 60); }
  c.colBox(0.4, 0.4);
}

export function sofa(c, w = 1.9, col = '#8fae8b') {
  const m = KF(col);
  c.box(M.birch, w, 0.12, 0.82, 0, FL, 0.43);
  c.rbox(m, w, 0.26, 0.8, 0, FL + 0.12, 0.44, 0.05);
  c.rbox(m, w, 0.5, 0.22, 0, FL + 0.3, 0.13, 0.06);
  for (const s of [-1, 1]) c.rbox(m, 0.2, 0.34, 0.8, s * (w / 2 - 0.1), FL + 0.3, 0.44, 0.06);
  const n = Math.round((w - 0.4) / 0.72);
  for (let i = 0; i < n; i++) c.rbox(m, (w - 0.44) / n - 0.02, 0.14, 0.56, -w / 2 + 0.22 + ((w - 0.44) * (i + 0.5)) / n, FL + 0.36, 0.54, 0.05);
  c.rbox(KF('#e3b04b'), 0.4, 0.36, 0.12, w / 2 - 0.45, FL + 0.5, 0.3, 0.05);
  c.colBox(w, 0.86, 0, 0.43);
}
export function coffeeTable(c, w = 0.9, d = 0.5) { c.rbox(M.birch, w, 0.03, d, 0, FL + 0.36, 0, 0.012); for (const sx of [-1, 1]) for (const sz of [-1, 1]) c.box(M.dark, 0.025, 0.36, 0.025, sx * (w / 2 - 0.06), FL, sz * (d / 2 - 0.06)); c.box(K('#c9553f'), 0.2, 0.025, 0.27, 0.1, FL + 0.39, 0, 12); c.colBox(w, d); }

/** Mostrador de recepción en L (frente hacia +Z). */
export function reception(c, w = 2.4) {
  c.box(M.birch, w, 1.05, 0.12, 0, FL, 0.3); c.box(M.white, w + 0.06, 0.04, 0.42, 0, FL + 1.05, 0.2);
  c.box(M.white, w - 0.1, 0.03, 0.62, 0, FL + 0.72, -0.08);
  c.box(M.birch, 0.12, 1.05, 1.0, w / 2 - 0.06, FL, -0.2); c.box(M.white, 0.42, 0.04, 1.0, w / 2 - 0.2, FL + 1.05, -0.2);
  monitor(c.at(-0.3, -0.1, 0, FL + 0.75));
  officeChair(c.at(-0.3, -0.7, 180));
  c.box(K('#8fae8b'), w * 0.6, 0.5, 0.01, -0.1, FL + 0.3, 0.366);
  c.colBox(w, 0.5, 0, 0.2); c.colBox(0.45, 1.0, w / 2 - 0.2, -0.2);
}
function monitor(c) { c.cyl(M.dark, 0.09, 0.012, 0, 0, 0); c.box(M.dark, 0.03, 0.14, 0.03, 0, 0, 0); c.box(M.dark, 0.56, 0.34, 0.02, 0, 0.12, 0.01); c.box(M.screen, 0.53, 0.31, 0.004, 0, 0.135, -0.002); c.box(M.white, 0.42, 0.012, 0.13, 0, 0, -0.26); }
export function officeChair(c, col = '#33373b') {
  c.cyl(M.dark, 0.03, 0.4, 0, FL + 0.06, 0); for (let i = 0; i < 5; i++) c.box(M.dark, 0.05, 0.03, 0.3, Math.sin(i * 1.257) * 0.15, FL + 0.03, Math.cos(i * 1.257) * 0.15, i * 72);
  c.rbox(KF(col), 0.46, 0.07, 0.46, 0, FL + 0.44, 0, 0.03); c.rbox(KF(col), 0.42, 0.5, 0.05, 0, FL + 0.56, 0.22, 0.03);
}
/** Escritorio contra el muro (respaldo z=0); la silla queda en +Z. */
export function desk(c, w = 1.4, o = {}) {
  c.rbox(M.birch, w, 0.03, 0.7, 0, FL + 0.71, 0.36, 0.012);
  for (const sx of [-1, 1]) { c.box(M.white, 0.04, 0.71, 0.04, sx * (w / 2 - 0.05), FL, 0.06); c.box(M.white, 0.04, 0.71, 0.04, sx * (w / 2 - 0.05), FL, 0.66); }
  c.box(M.white, 0.4, 0.5, 0.55, w / 2 - 0.27, FL + 0.18, 0.36);
  if (o.monitor !== false) monitor(c.at(-0.1, 0.2, 180, FL + 0.74));
  const ch = c.at(-0.1, 1.0, 180); officeChair(ch.at(0, 0, 180));
  c.colBox(w, 0.75, 0, 0.37);
}
export function bookcase(c, w = 1.2, h = 1.9, d = 0.32) { cubby(c, w, h, d, Math.max(2, Math.round(w / 0.5)), Math.round(h / 0.38), 0.12); }
export function lockers(c, w = 1.8, h = 1.8, n = 4) {
  for (let i = 0; i < n; i++) { const x = -w / 2 + (w * (i + 0.5)) / n; c.box(K(i % 2 ? '#f2e6d0' : '#8fae8b', 0.5), w / n - 0.012, h, 0.45, x, FL, 0.225); c.box(M.dark, 0.012, 0.1, 0.02, x + w / n / 2 - 0.05, FL + h * 0.55, 0.46); }
  c.colBox(w, 0.46, 0, 0.23);
}
export function kitchen(c, w = 2.4, o = {}) {
  c.box(M.white, w, 0.84, 0.58, 0, FL + 0.06, 0.3); c.box(M.dark, w, 0.06, 0.52, 0, FL, 0.28);
  c.box(K('#3d4043', 0.35), w + 0.02, 0.04, 0.62, 0, FL + 0.9, 0.31);
  const n = Math.round(w / 0.6);
  for (let i = 0; i < n; i++) c.box(M.steel, 0.14, 0.012, 0.02, -w / 2 + (w * (i + 0.5)) / n, FL + 0.82, 0.6);
  if (o.upper !== false) { c.box(M.white, w, 0.6, 0.34, 0, FL + 1.45, 0.17); c.box(K('#e9e4d8', 0.6), w, 0.5, 0.012, 0, FL + 0.94, 0.008); }
  if (o.sink !== false) { c.box(M.steel, 0.5, 0.012, 0.4, -w / 4, FL + 0.935, 0.33); c.box(M.dark, 0.42, 0.01, 0.32, -w / 4, FL + 0.94, 0.33); c.cyl(M.steel, 0.014, 0.24, -w / 4, FL + 0.94, 0.12, { seg: 8 }); c.box(M.steel, 0.02, 0.02, 0.16, -w / 4, FL + 1.17, 0.19); }
  if (o.stove) { c.box(M.screen, 0.58, 0.012, 0.5, w / 4, FL + 0.94, 0.32); for (const [x, z] of [[-0.14, -0.1], [0.14, -0.1], [-0.14, 0.12], [0.14, 0.12]]) c.cyl(M.dark, 0.08, 0.006, w / 4 + x, FL + 0.95, 0.32 + z); }
  c.colBox(w, 0.62, 0, 0.31);
}
export function fridge(c, col = M.steel) { c.rbox(col, 0.72, 1.82, 0.7, 0, FL, 0.36, 0.02); c.box(M.dark, 0.7, 0.008, 0.01, 0, FL + 0.62, 0.715); c.box(M.dark, 0.02, 0.5, 0.03, -0.28, FL + 0.9, 0.725); c.box(M.dark, 0.02, 0.3, 0.03, -0.28, FL + 0.22, 0.725); c.colBox(0.74, 0.74, 0, 0.36); }
export function washer(c) { c.rbox(M.white, 0.6, 0.86, 0.6, 0, FL, 0.31, 0.02); c.cyl(M.steel, 0.19, 0.02, 0, FL + 0.42, 0.615, { rx: 90, seg: 28 }); c.cyl(M.screen, 0.15, 0.022, 0, FL + 0.42, 0.617, { rx: 90, seg: 28 }); c.box(M.dark, 0.5, 0.07, 0.01, 0, FL + 0.74, 0.612); c.colBox(0.62, 0.64, 0, 0.31); }
export function toilet(c, k = 1) {
  c.cyl(M.ceramic, 0.17 * k, 0.36 * k, 0, FL, 0.42 * k, { rt: 0.2 * k }); c.cyl(M.ceramic, 0.2 * k, 0.05, 0, FL + 0.36 * k, 0.42 * k, { seg: 24 }); c.cyl(M.white, 0.21 * k, 0.02, 0, FL + 0.41 * k, 0.42 * k, { seg: 24 });
  c.rbox(M.ceramic, 0.4 * k, 0.36 * k, 0.17, 0, FL + 0.36 * k, 0.09, 0.02); c.box(M.steel, 0.05, 0.012, 0.03, 0, FL + 0.73 * k, 0.09);
  c.colBox(0.45 * k, 0.66 * k, 0, 0.33 * k);
}
export function sink(c, k = 1) {
  const y = FL + 0.82 * k; c.rbox(M.ceramic, 0.52, 0.15, 0.42, 0, y - 0.15, 0.21, 0.04); c.box(K('#cfd5d6', 0.2), 0.4, 0.01, 0.28, 0, y, 0.22);
  c.cyl(M.steel, 0.013, 0.14, 0, y, 0.06, { seg: 8 }); c.box(M.steel, 0.02, 0.02, 0.13, 0, y + 0.13, 0.11); c.cyl(M.steel, 0.02, 0.5, 0, y - 0.62 * k, 0.2, { seg: 8 });
  c.box(M.mirror, 0.5, 0.6, 0.01, 0, y + 0.3, 0.008);
  c.colBox(0.54, 0.44, 0, 0.21);
}
/** Lavamanos corrido para niños (típico de kita alemana). */
export function trough(c, w = 1.8) {
  const y = FL + 0.56; c.rbox(M.ceramic, w, 0.2, 0.4, 0, y - 0.2, 0.2, 0.05); c.box(K('#cfd5d6', 0.2), w - 0.1, 0.01, 0.28, 0, y, 0.21);
  const n = Math.round(w / 0.55);
  for (let i = 0; i < n; i++) { const x = -w / 2 + (w * (i + 0.5)) / n; c.cyl(M.steel, 0.012, 0.12, x, y, 0.05, { seg: 8 }); c.box(M.steel, 0.018, 0.018, 0.12, x, y + 0.11, 0.1); c.cyl(K(pick(PALV)), 0.035, 0.07, x + 0.15, y + 0.01, 0.06, { seg: 10 }); }
  for (const s of [-1, 1]) c.box(M.white, 0.05, 0.36, 0.36, s * (w / 2 - 0.15), FL, 0.2);
  c.box(M.mirror, w, 0.5, 0.01, 0, y + 0.3, 0.008);
  c.colBox(w, 0.42, 0, 0.2);
}
export function bench(c, w = 1.5, top = M.oak) { c.rbox(top, w, 0.05, 0.4, 0, FL + 0.38, 0, 0.015); for (const s of [-1, 1]) { c.box(M.dark, 0.04, 0.38, 0.36, s * (w / 2 - 0.12), FL, 0); } c.colBox(w, 0.42); }
/** Garderobe: banco con perchas y mochilas (respaldo z=0). */
export function coatRack(c, w = 2) {
  c.box(M.birch, w, 1.35, 0.02, 0, FL, 0.01); c.box(M.birch, w, 0.03, 0.34, 0, FL + 0.3, 0.18); c.box(M.birch, w, 0.03, 0.3, 0, FL + 0.1, 0.16); c.box(M.birch, w, 0.03, 0.26, 0, FL + 1.35, 0.13);
  for (const s of [-1, 1]) c.box(M.birch, 0.02, 1.38, 0.34, s * (w / 2 - 0.01), FL, 0.17);
  const n = Math.round(w / 0.28);
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (w * (i + 0.5)) / n; c.cyl(M.steel, 0.008, 0.06, x, FL + 1.12, 0.05, { rx: 90, seg: 6 });
    if (R() < 0.7) c.rbox(KF(pick(PALV)), 0.2, 0.28, 0.1, x, FL + 0.8, 0.08, 0.04);
    if (R() < 0.6) c.rbox(K(pick(PALV), 0.6), 0.16, 0.07, 0.24, x, FL + 0.13, 0.17, 0.02);
    c.box(K(pick(PALV)), 0.07, 0.07, 0.004, x, FL + 1.22, 0.024);
  }
  c.colBox(w, 0.36, 0, 0.18);
}
/** Panel de exposición de dos caras. */
export function display(c, w = 1.6) {
  c.box(M.white, w, 1.7, 0.06, 0, FL + 0.12, 0); for (const s of [-1, 1]) c.box(M.birch, 0.06, 0.12, 0.5, s * (w / 2 - 0.2), FL, 0);
  for (const f of [-1, 1]) { const n = Math.round(w / 0.5); for (let i = 0; i < n; i++) { const x = -w / 2 + (w * (i + 0.5)) / n; c.box(M.birch, 0.38, 0.5, 0.012, x, FL + 0.95, f * 0.037); c.box(K(pick(PALV), 0.9), 0.3, 0.42, 0.004, x, FL + 0.99, f * 0.045); c.sph(K(pick(PALV), 0.9), 0.07, x + (R() - 0.5) * 0.1, FL + 1.2 + (R() - 0.5) * 0.15, f * 0.047, 1, 1, 0.05, 10); } }
  c.colBox(w, 0.3);
}
export function pedestal(c) { c.box(M.white, 0.4, 0.95, 0.4, 0, FL, 0); c.sph(K(pick(PALV), 0.5), 0.13, 0, FL + 1.09, 0, 1, 1.15, 1, 18); c.colBox(0.44, 0.44); }
export function wallBars(c, w = 1) {
  for (const s of [-1, 1]) c.box(M.birch, 0.045, 2.3, 0.1, s * w / 2, FL, 0.05);
  for (let i = 0; i < 12; i++) c.cyl(M.oak, 0.016, w, 0, FL + 0.15 + i * 0.18 - w / 2, 0.07 + (i === 11 ? 0.06 : 0), { rz: 90, seg: 8 });
  c.colBox(w, 0.16, 0, 0.08);
}
export function gymMat(c, col = '#6f9bb8', w = 1.8, d = 0.9) { c.rbox(KF(col), w, 0.06, d, 0, FL, 0, 0.025); }
export function beam(c, w = 2.2) { c.rbox(M.birch, w, 0.08, 0.1, 0, FL + 0.16, 0, 0.02); for (const s of [-1, 1]) c.box(M.birch, 0.08, 0.16, 0.4, s * (w / 2 - 0.25), FL, 0); c.colBox(w, 0.4); }
/** Triángulo Pikler. */
export function pikler(c) {
  for (const s of [-1, 1]) for (const f of [-1, 1]) c.box(M.birch, 0.04, 1.0, 0.06, s * 0.4, FL, f * 0.24, 0, -f * 28, 0);
  for (const f of [-1, 1]) for (let i = 0; i < 5; i++) { const t = (i + 0.6) / 5.5; c.cyl(M.oak, 0.015, 0.84, 0, FL + t * 0.88 - 0.42, f * 0.47 * (1 - t), { rz: 90, seg: 8 }); }
  c.colBox(0.9, 1.0);
}
export function printerTable(c) { c.box(M.white, 0.7, 0.6, 0.55, 0, FL, 0.28); c.rbox(K('#e9e9e6', 0.5), 0.5, 0.3, 0.42, 0, FL + 0.6, 0.28, 0.03); c.box(M.dark, 0.36, 0.02, 0.2, 0, FL + 0.9, 0.3); c.colBox(0.72, 0.56, 0, 0.28); }

// ---------- Exterior ----------
export function tree(c, h = 5, r = 2, mat = M.leaf) {
  c.cyl(M.bark, 0.16, h * 0.55, 0, 0, 0, { rt: 0.1, seg: 10 });
  for (let i = 0; i < 4; i++) c.cyl(M.bark, 0.05, r * 0.9, Math.cos(i * 1.7) * r * 0.25, h * 0.45, Math.sin(i * 1.7) * r * 0.25, { rz: Math.cos(i * 1.7) * -32, rx: Math.sin(i * 1.7) * 32, seg: 6 });
  for (let i = 0; i < 22; i++) { const a = i * 2.4, rr = i === 0 ? 0 : r * (0.25 + R() * 0.6), y = h * 0.6 + R() * h * 0.34; c.add(lump(r * (0.26 + R() * 0.2), i), i % 4 === 1 ? M.leaf2 : mat, Math.cos(a) * rr, y, Math.sin(a) * rr, R() * 360); }
  c.colBox(0.4, 0.4);
}
export function pine(c, h = 6) { c.cyl(M.bark, 0.14, h * 0.3, 0, 0, 0, { rt: 0.1, seg: 8 }); for (let i = 0; i < 5; i++) c.cyl(K('#35603a', 0.95), 1.5 - i * 0.26, h * 0.24, 0, h * 0.2 + i * h * 0.16, 0, { rt: 0.02, seg: 12 }); c.colBox(0.4, 0.4); }
export function palm(c, h = 7) {
  const lean = (R() - 0.5) * 0.6;
  for (let i = 0; i < 8; i++) { const t = i / 8; c.cyl(K('#9a8f7c', 0.95), 0.17 - t * 0.05, h / 8 + 0.03, lean * t * t, t * h, 0, { rt: 0.165 - (t + 0.125) * 0.05, seg: 10 }); }
  const top = c.at(lean, 0, 0, h);
  top.sph(K('#6b8f45', 0.8), 0.22, 0, 0, 0, 1, 1.4, 1, 8);
  for (let f = 0; f < 11; f++) {
    const fr = top.at(0, 0, f * (360 / 11) + R() * 14, 0), up = 28 - (f % 3) * 16;
    let z = 0.1, y = 0.1;
    for (let k = 0; k < 6; k++) { const pitch = -up + k * 17, L = 0.62, pr = pitch * Math.PI / 180; const cz = z + Math.cos(pr) * L / 2, cy = y - Math.sin(pr) * L / 2; fr.box(M.palm, 0.72 - k * 0.11, 0.015, L + 0.04, 0, cy, cz, 0, pitch); z += Math.cos(pr) * L; y -= Math.sin(pr) * L; }
  }
  c.colBox(0.4, 0.4);
}
function lump(r, seed) { const g = new THREE.IcosahedronGeometry(r, 2), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + 0.16 * Math.sin(x * 9 / r + seed) * Math.cos(z * 8 / r + seed * 1.7) + 0.1 * Math.sin(y * 11 / r + seed * 0.6); p.setXYZ(i, x * n, y * n * 0.82, z * n); } const nn = g.attributes.normal; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i) / 0.6, z = p.getZ(i), l = Math.hypot(x, y, z) || 1; nn.setXYZ(i, x / l, y / l, z / l); } return g; }
export function bush(c, r = 0.5) { for (let i = 0; i < 6; i++) c.add(lump(r * (0.45 + R() * 0.25), i), i % 3 === 1 ? M.leaf2 : M.leaf, Math.cos(i * 2.1) * r * 0.5, r * (0.4 + R() * 0.3), Math.sin(i * 2.1) * r * 0.5, R() * 360); }
export function hedge(c, w, h = 1.2, d = 0.6) { c.rbox(M.leaf, w, h, d, 0, 0, 0, 0.12); c.colBox(w, d); }
export function planter(c, w, d, n = 3) { c.box(M.wall, w, 0.45, d, 0, 0, 0); c.box(M.soil, w - 0.12, 0.02, d - 0.12, 0, 0.44, 0); for (let i = 0; i < n; i++) bush(c.at(-w / 2 + (w * (i + 0.5)) / n, 0, 0, 0.4), Math.min(d, w / n) * 0.55); c.colBox(w, d); }
export function slide(c) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) c.box(M.birch, 0.08, 1.9, 0.08, sx * 0.5, 0, sz * 0.5);
  c.box(M.birch, 1.1, 0.06, 1.1, 0, 1.1, 0); c.box(K('#d0785a'), 1.3, 0.06, 1.3, 0, 1.9, 0);
  for (let i = 0; i < 5; i++) c.cyl(M.oak, 0.02, 0.9, -0.62 - i * 0.07, 0.18 + i * 0.2 - 0.45, 0, { rx: 90, seg: 8 });
  for (const s of [-1, 1]) c.box(M.birch, 0.05, 1.25, 0.05, -0.76, 0, s * 0.45, 0, 0, -17);
  c.box(K('#e3b04b', 0.35), 0.6, 0.04, 2.4, 0, 0.55, 1.62, 0, 27); for (const s of [-1, 1]) c.box(K('#e3b04b', 0.35), 0.04, 0.16, 2.4, s * 0.3, 0.6, 1.62, 0, 27);
  c.colBox(1.6, 1.2); c.colBox(0.7, 2.2, 0, 1.6);
}
export function sandbox(c, w = 2.4) { for (const s of [-1, 1]) { c.box(M.birch, w, 0.24, 0.14, 0, 0, s * (w / 2 - 0.07)); c.box(M.birch, 0.14, 0.24, w, s * (w / 2 - 0.07), 0, 0); } c.box(M.sand, w - 0.2, 0.14, w - 0.2, 0, 0, 0); c.sph(K('#d0785a'), 0.1, 0.4, 0.2, -0.3, 1, 0.8, 1); c.cyl(K('#6f9bb8'), 0.09, 0.14, -0.5, 0.14, 0.4, { rt: 0.11 }); c.colBox(w, w); }
export function playFloor(c, w, d, col) { c.rbox(KR(col), w, 0.03, d, 0, 0.005, 0, 0.014); }
export function streetLamp(c) { c.cyl(M.frame, 0.07, 5.2, 0, 0, 0, { rt: 0.045, seg: 10 }); c.box(M.frame, 0.08, 0.06, 1.2, 0, 5.15, 0.55); c.box(M.lamp, 0.16, 0.03, 0.42, 0, 5.12, 0.95); c.colBox(0.2, 0.2); }
