// Constructor arquitectónico: muros con huecos, puertas, ventanas, pisos, losas y registro de espacios.
import { M, K } from './kit.js';

export const H = 2.7;   // altura libre
const T = 0.15;         // espesor de muro

/**
 * Muro ortogonal en px del plano, con huecos.
 * ops: [desde, hasta, tipo, opciones] a lo largo del eje del muro (px).
 * tipos: door, ddoor, arch, slide, win, high, open, big
 */
export function wall(c, x1, y1, x2, y2, ops = [], o = {}) {
  const h = o.h ?? H, t = o.t ?? T, mat = o.mat ?? M.wall;
  const [ax, az] = c.P(x1, y1), [bx, bz] = c.P(x2, y2);
  const horiz = Math.abs(bz - az) < Math.abs(bx - ax);
  const u0 = horiz ? Math.min(ax, bx) : Math.min(az, bz), u1 = horiz ? Math.max(ax, bx) : Math.max(az, bz);
  const v = horiz ? az : ax;
  // sub-contexto: +X local corre a lo largo del muro; el espesor queda en Z
  const sub = horiz ? c.at(u0, v, 0) : c.at(v, u0, -90);
  const L = u1 - u0;
  const cv = (p) => (horiz ? c.P(p, 0)[0] : c.P(0, p)[1]) - u0;
  const list = ops.map(([a, b, type, opt]) => ({ a: Math.min(cv(a), cv(b)), b: Math.max(cv(a), cv(b)), type, ...(opt || {}) })).sort((p, q) => p.a - q.a);
  const base = o.base !== false;
  const solid = (a, b, y0, y1, block = true) => {
    if (b - a < 0.005 || y1 - y0 < 0.005) return;
    sub.box(mat, b - a, y1 - y0, t, (a + b) / 2, y0, 0);
    if (block) sub.col(a, -t / 2, b, t / 2);
    if (base && y0 === 0) for (const s of [-1, 1]) sub.box(M.base, b - a, 0.08, 0.012, (a + b) / 2, 0, s * (t / 2 + 0.006));
  };
  let cur = -t / 2;
  for (const op of list) {
    solid(cur, op.a, 0, h);
    opening(sub, op, t, h, solid);
    cur = op.b;
  }
  solid(cur, L + t / 2, 0, h);
}

function opening(s, op, t, h, solid) {
  const { a, b, type } = op, L = b - a, mid = (a + b) / 2;
  if (type === 'gate') return;
  const sx = s.at(a, 0, 0); // origen en el inicio del hueco
  if (type === 'win' || type === 'high' || type === 'open' || type === 'big') {
    const sill = op.sill ?? (type === 'high' ? 1.55 : type === 'big' ? 0.12 : 0.9), head = op.head ?? (type === 'big' ? 2.4 : 2.15);
    solid(a, b, 0, sill); solid(a, b, head, h, false);
    sx.box(M.white, L + 0.06, 0.035, t + 0.08, L / 2, sill - 0.005, 0);
    if (type !== 'open') windowFrame(sx, L, sill + 0.03, head);
    return;
  }
  const head = op.head ?? (type === 'arch' ? 2.3 : 2.1);
  solid(a, b, head, h, false);
  if (type === 'arch') return;
  if (type === 'slide') {
    // corredera de vidrio: dos hojas recogidas a un lado
    const pw = L * 0.42;
    for (const [x0, z0] of [[0.02, -0.035], [0.1, 0.035]]) panel(sx, x0, pw, 0.03, head, z0);
    sx.box(M.frame, L, 0.05, t * 0.8, L / 2, head - 0.05, 0);
    sx.col(0, -t / 2, pw + 0.12, t / 2);
    return;
  }
  // marco
  const fm = M.doorFrame, fw = 0.045, fd = t + 0.03;
  sx.box(fm, fw, head, fd, fw / 2, 0, 0); sx.box(fm, fw, head, fd, L - fw / 2, 0, 0); sx.box(fm, L, fw, fd, L / 2, head - fw, 0);
  const side = op.side ?? 1, ang = op.ang ?? 96;
  const leaf = (hinge, w) => {
    const hx = hinge === 'a' ? fw : L - fw, sgn = hinge === 'a' ? 1 : -1;
    const dx = sgn * Math.cos(ang * Math.PI / 180), dz = side * Math.sin(ang * Math.PI / 180);
    const ry = hinge === 'a' ? -side * ang : 180 + side * ang;
    const cx = hx + dx * w / 2, cz = dz * w / 2;
    sx.box(op.glass ? M.frame : M.door, w, head - fw - 0.01, 0.04, cx, 0.005, cz, ry);
    // manija
    const hxp = hx + dx * (w - 0.09), hzp = dz * (w - 0.09);
    sx.box(M.steel, 0.12, 0.02, 0.07, hxp, 1.0, hzp, ry);
  };
  if (type === 'ddoor') { leaf('a', (L - 2 * fw) / 2); leaf('b', (L - 2 * fw) / 2); }
  else leaf(op.hinge === 'b' ? 'b' : 'a', L - 2 * fw);
}

function panel(s, x0, w, y0, y1, z) {
  const f = 0.045, d = 0.04, fr = M.frame;
  s.box(fr, w, f, d, x0 + w / 2, y0, z); s.box(fr, w, f, d, x0 + w / 2, y1 - f, z);
  s.box(fr, f, y1 - y0, d, x0 + f / 2, y0, z); s.box(fr, f, y1 - y0, d, x0 + w - f / 2, y0, z);
  s.box(M.glass, w - 2 * f, y1 - y0 - 2 * f, 0.008, x0 + w / 2, y0 + f, z);
}

function windowFrame(s, L, y0, y1) {
  const f = 0.045, d = 0.06, fr = M.frame;
  s.box(fr, L, f, d, L / 2, y0, 0); s.box(fr, L, f, d, L / 2, y1 - f, 0);
  s.box(fr, f, y1 - y0, d, f / 2, y0, 0); s.box(fr, f, y1 - y0, d, L - f / 2, y0, 0);
  const n = Math.max(1, Math.round(L / 1.0));
  for (let i = 1; i < n; i++) s.box(fr, f, y1 - y0, d, (L * i) / n, y0, 0);
  s.box(M.glass, L - 2 * f, y1 - y0 - 2 * f, 0.008, L / 2, y0 + f, 0);
}

/** Muro en cualquier dirección (sin huecos); colisión escalonada. */
export function wallFree(c, x1, y1, x2, y2, o = {}) {
  const h = o.h ?? H, t = o.t ?? T, mat = o.mat ?? M.wall;
  const [ax, az] = c.P(x1, y1), [bx, bz] = c.P(x2, y2);
  const len = Math.hypot(bx - ax, bz - az), deg = -Math.atan2(bz - az, bx - ax) * 180 / Math.PI;
  c.box(mat, len + t, h, t, (ax + bx) / 2, 0, (az + bz) / 2, deg);
  const n = Math.ceil(len / 0.15);
  for (let i = 0; i <= n; i++) { const x = ax + ((bx - ax) * i) / n, z = az + ((bz - az) * i) / n; c.col(x - t / 2, z - t / 2, x + t / 2, z + t / 2); }
}

/** Piso (rectángulo en px). */
export function floor(c, x1, y1, x2, y2, mat, y = 0.03, th = 0.03) {
  const [ax, az] = c.P(Math.min(x1, x2), Math.min(y1, y2)), [bx, bz] = c.P(Math.max(x1, x2), Math.max(y1, y2));
  c.box(mat, bx - ax, th, bz - az, (ax + bx) / 2, y - th, (az + bz) / 2);
}

/** Losa de techo (rectángulo en px). */
export function roof(c, x1, y1, x2, y2, o = {}) {
  const y = o.y ?? H, th = o.th ?? 0.2, ov = o.over ?? 0.3;
  const [ax, az] = c.P(Math.min(x1, x2), Math.min(y1, y2)), [bx, bz] = c.P(Math.max(x1, x2), Math.max(y1, y2));
  c.box(o.mat ?? M.roof, bx - ax + 2 * ov, th, bz - az + 2 * ov, (ax + bx) / 2, y, (az + bz) / 2);
  if (o.parapet) {
    const p = 0.35, pt = 0.12;
    c.box(M.roof, bx - ax + 2 * ov, p, pt, (ax + bx) / 2, y + th, az - ov + pt / 2); c.box(M.roof, bx - ax + 2 * ov, p, pt, (ax + bx) / 2, y + th, bz + ov - pt / 2);
    c.box(M.roof, pt, p, bz - az + 2 * ov, ax - ov + pt / 2, y + th, (az + bz) / 2); c.box(M.roof, pt, p, bz - az + 2 * ov, bx + ov - pt / 2, y + th, (az + bz) / 2);
  }
}

/** Columna cuadrada. */
export function column(c, px, py, o = {}) {
  const [x, z] = c.P(px, py), w = o.w ?? 0.2, h = o.h ?? H;
  c.box(o.mat ?? M.wall, w, h, w, x, 0, z); c.colBox(w, w, x, z);
}

/** Registra un espacio (nombre para el HUD, luz de techo). */
export function room(c, name, x1, y1, x2, y2, o = {}) {
  const [ax, az] = c.P(Math.min(x1, x2), Math.min(y1, y2)), [bx, bz] = c.P(Math.max(x1, x2), Math.max(y1, y2));
  const [wx1, wz1] = c.toWorld(ax, az), [wx2, wz2] = c.toWorld(bx, bz);
  c.w.rooms.push({ name, house: o.house, ext: !!o.ext, box: [Math.min(wx1, wx2), Math.min(wz1, wz2), Math.max(wx1, wx2), Math.max(wz1, wz2)] });
  if (o.lamp === false || o.ext) return;
  const y = o.y ?? H, cx = (ax + bx) / 2, cz = (az + bz) / 2;
  const pts = (bx - ax > 6 || bz - az > 6) ? (bx - ax > bz - az ? [[(ax * 3 + bx) / 4, cz], [(ax + bx * 3) / 4, cz]] : [[cx, (az * 3 + bz) / 4], [cx, (az + bz * 3) / 4]]) : [[cx, cz]];
  for (const [x, z] of pts) {
    c.cyl(M.dark, 0.008, 0.35, x, y - 0.35, z, { seg: 6 });
    c.cyl(M.lamp, 0.2, 0.09, x, y - 0.44, z, { rt: 0.07, seg: 24 });
    const [wx, wz] = c.toWorld(x, z);
    c.w.lamps.push([wx, y - 0.5, wz]);
  }
}

/** Banco curvo o recto siguiendo un arco (centro px, radio px, ángulos en grados de pantalla). */
export function arcBench(c, cxp, cyp, rpx, a0, a1, n = 9) {
  const [cx, cz] = c.P(cxp, cyp), r = rpx * c.s;
  for (let i = 0; i < n; i++) {
    const a = ((a0 + ((a1 - a0) * (i + 0.5)) / n) * Math.PI) / 180;
    const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, seg = (Math.abs(a1 - a0) * Math.PI / 180 * r) / n + 0.03;
    const deg = -(a * 180 / Math.PI) - 90;
    c.box(M.wall, seg, 0.4, 0.42, x, 0, z, deg);
    c.box(M.oak, seg, 0.04, 0.46, x, 0.4, z, deg);
    c.col(x - 0.22, z - 0.22, x + 0.22, z + 0.22);
  }
}

/** Muro perimetral del lote con huecos de portón. sides: lista de [x1,y1,x2,y2, [[desde,hasta]...]] en px */
export function lotWall(c, x1, y1, x2, y2, gaps = []) {
  wall(c, x1, y1, x2, y2, gaps.map(([a, b]) => [a, b, 'gate']), { h: 2.2, t: 0.18, mat: M.lotWall, base: false });
}
export { K };
