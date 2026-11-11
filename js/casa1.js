// Proyecto 1: planta arquitectónica digitalizada (casa existente adaptada a aulas). Coordenadas en px del plano (45 px = 1 m).
import { M, K, PAL } from './kit.js';
import { wall, wallFree, floor, roof, column, room, arcBench, lotWall } from './build.js';
import * as F from './furniture.js';

export const CASA1 = { s: 1 / 45, ox: 46, oy: 40, name: 'Proyecto 1' };

/** Sub-contexto apoyado en un muro del rectángulo (px). side: n|s|e|w, f: fracción a lo largo. */
export function onWall(c, r, side, f = 0.5, inset = 0.085) {
  const [ax, az] = c.P(r[0], r[1]), [bx, bz] = c.P(r[2], r[3]);
  const lx = ax + (bx - ax) * f, lz = az + (bz - az) * f;
  if (side === 'n') return c.at(lx, az + inset, 0);
  if (side === 's') return c.at(lx, bz - inset, 180);
  if (side === 'w') return c.at(ax + inset, lz, 90);
  return c.at(bx - inset, lz, -90);
}

/** Amueblado genérico de un aula infantil. */
export function aula(c, r, o = {}) {
  if (o.board) F.whiteboard(onWall(c, r, o.board[0], o.board[1]), o.board[2] ?? 1.8);
  if (o.pin) F.pinboard(onWall(c, r, o.pin[0], o.pin[1]), o.pin[2] ?? 1.4);
  if (o.shelf) F.cubby(onWall(c, r, o.shelf[0], o.shelf[1]), o.shelf[2] ?? 1.6, 0.86, 0.36, Math.round((o.shelf[2] ?? 1.6) / 0.4), 2);
  if (o.coat) F.coatRack(onWall(c, r, o.coat[0], o.coat[1]), o.coat[2] ?? 1.6);
  for (const t of o.tables || []) F.tableSet(c.atp(t[0], t[1], t[2] ?? 0), { n: t[3] ?? 2, w: (t[3] ?? 2) * 0.6 });
  for (const t of o.round || []) F.roundTable(c.atp(t[0], t[1]), t[2] ?? 0.5);
  if (o.rug) { const g = c.atp(o.rug[0], o.rug[1]); F.rug(g, o.rug[2] ?? 0.9, o.rug[3]); F.cushion(g.at(0.45, 0.2)); F.cushion(g.at(-0.4, 0.35)); F.cushion(g.at(-0.1, -0.5)); }
  for (const p of o.plants || []) F.plant(c.atp(p[0], p[1]), p[2] ?? 1.2);
}

export function buildCasa1(c) {
  const W = (...a) => wall(c, ...a), house = CASA1.name;
  const RM = (name, x1, y1, x2, y2, o = {}) => room(c, name, x1, y1, x2, y2, { house, ...o });

  // ---------- Muros: bloque de aulas (antiguos dormitorios) ----------
  W(230, 82, 607, 82, [[280, 370, 'win'], [458, 515, 'high']]);
  W(607, 82, 607, 115);
  W(230, 82, 230, 248, [[135, 200, 'win']]);
  W(160, 248, 411, 248, [[367, 405, 'door', { side: -1, hinge: 'b' }]]);
  W(411, 82, 411, 435, [[290, 330, 'door', { side: -1 }]]);
  W(411, 256, 550, 256);
  W(548, 82, 548, 256, [[92, 203, 'win'], [212, 250, 'door', { side: 1, hinge: 'b' }]]);
  W(550, 256, 550, 435, [[275, 320, 'high']]);
  W(411, 434, 550, 434, [[439, 475, 'door', { side: -1 }]]);
  W(160, 248, 160, 567, [[270, 345, 'win'], [475, 530, 'win']]);
  W(352, 248, 352, 660, [[258, 296, 'door', { side: 1 }], [405, 443, 'door', { side: 1 }], [580, 653, 'win']]);
  W(160, 399, 352, 399);
  W(160, 542, 235, 542, [[166, 229, 'win']]);
  W(235, 542, 235, 567); W(235, 567, 352, 567);
  W(352, 492, 549, 492, [[358, 398, 'door', { side: 1 }]]);
  W(549, 492, 549, 660);
  W(350, 660, 550, 660);
  W(550, 660, 718, 660, [[562, 706, 'arch']]); // paso amplio entre el hall y el área de exhibiciones (en el plano había un trozo de muro suelto)
  // ---------- Estar / terraza ----------
  W(550, 435, 718, 435, [[565, 705, 'slide']]);
  W(720, 345, 720, 382);
  // ---------- Bloque derecho ----------
  W(718, 442, 1157, 442, [[727, 807, 'ddoor', { side: 1 }], [818, 905, 'win'], [918, 948, 'door', { side: 1 }], [956, 1006, 'win'], [1043, 1093, 'win'], [1099, 1133, 'door', { side: 1 }]]);
  W(718, 442, 718, 601);
  W(718, 601, 1157, 601, [[1050, 1105, 'arch']]);
  W(914, 442, 914, 601);
  W(1028, 442, 1028, 710, [[640, 678, 'arch']]);
  W(855, 601, 855, 710, [[632, 668, 'arch']]);
  W(855, 710, 1108, 710, [[1038, 1096, 'arch']]);
  W(1108, 601, 1108, 710, [[668, 705, 'door', { side: -1 }]]);
  W(1157, 442, 1157, 710);
  // ---------- Oficina / WC ----------
  W(716, 677, 857, 677, [[723, 758, 'door', { side: 1 }], [766, 850, 'win']]);
  W(718, 677, 718, 804, [[686, 728, 'win']]);
  W(716, 804, 905, 804, [[738, 838, 'win']]);
  W(857, 677, 857, 804, [[742, 780, 'door', { side: -1 }]]);
  W(905, 710, 905, 804, [[722, 762, 'high']]);
  // ---------- Espera / recepción / galería ----------
  W(347, 660, 347, 823, [[672, 728, 'ddoor', { side: -1 }], [742, 778, 'win']]);
  W(347, 821, 537, 821, [[357, 412, 'win'], [430, 528, 'win']]);
  W(537, 790, 537, 823);
  wallFree(c, 603, 735, 537, 790);
  W(603, 735, 716, 735, [[610, 700, 'arch']]);
  W(277, 655, 277, 826, [[682, 728, 'open'], [760, 806, 'open']]);
  W(270, 826, 347, 826);
  W(915, 885, 915, 917);
  // columnas
  for (const x of [607, 660, 712]) column(c, x, 350, { h: 2.5 });
  for (const x of [779, 838, 887, 933, 980, 1083, 1135]) column(c, x, 353, { h: 2.5 });
  for (const x of [990, 1076, 1150]) column(c, x, 917, { h: 2.5 });
  for (const x of [640, 736, 829]) column(c, x, 888, { h: 2.5 });
  column(c, 240, 572, { h: 2.5 });

  // ---------- Pisos ----------
  const wood = [[230, 82, 411, 248], [411, 82, 548, 256], [160, 248, 352, 399], [160, 399, 352, 567], [352, 492, 549, 660], [718, 442, 914, 601]];
  for (const r of wood) floor(c, ...r, M.wood);
  const tile = [[352, 256, 411, 492], [411, 256, 550, 492], [550, 435, 718, 660], [347, 660, 716, 735], [347, 735, 537, 821], [537, 735, 603, 790], [718, 601, 855, 677], [718, 677, 905, 804], [855, 601, 1108, 710], [914, 442, 1157, 601]];
  for (const r of tile) floor(c, ...r, M.tile);
  floor(c, 550, 350, 720, 435, M.terra); floor(c, 277, 655, 347, 826, M.terra);
  floor(c, 720, 350, 1157, 442, M.polished); floor(c, 905, 710, 1157, 917, M.polished); floor(c, 1108, 601, 1157, 710, M.polished);
  floor(c, 716, 804, 905, 890, M.polished); floor(c, 550, 82, 607, 350, M.concrete);
  floor(c, 545, 738, 716, 890, M.terra, 0.026);
  floor(c, 46, 567, 277, 940, M.pavers); floor(c, 277, 567, 352, 655, M.pavers);
  floor(c, 625, 46, 1154, 320, M.gravel, 0.02);

  // ---------- Techos ----------
  for (const r of [[230, 82, 548, 256], [160, 248, 352, 567], [352, 256, 550, 660], [550, 435, 718, 735], [347, 660, 537, 823], [537, 660, 603, 790], [718, 442, 1157, 710], [716, 677, 905, 804]]) roof(c, ...r);
  roof(c, 550, 350, 720, 435, { y: 2.5, th: 0.15, over: 0.1 });
  roof(c, 720, 350, 1157, 442, { y: 2.5, th: 0.15, over: 0.1 });
  roof(c, 905, 710, 1157, 917, { y: 2.5, th: 0.15, over: 0.1 });
  roof(c, 603, 735, 905, 890, { y: 2.5, th: 0.15, over: 0.1 });
  roof(c, 235, 567, 352, 660, { y: 2.5, th: 0.15, over: 0.1 }); roof(c, 272, 655, 347, 828, { y: 2.5, th: 0.15, over: 0.1 });

  // ---------- Espacios ----------
  RM('Aula #5', 230, 82, 411, 248); RM('Aula #6', 411, 82, 548, 256); RM('Aula #4', 160, 248, 352, 399); RM('Aula #3', 160, 399, 352, 567);
  RM('Aula #2', 352, 492, 549, 660); RM('Pasillo', 352, 256, 411, 492); RM('Baños', 411, 256, 550, 434);
  RM('Área de exhibiciones', 550, 435, 718, 660); RM('Área de exhibiciones', 411, 434, 550, 492, { lamp: false });
  RM('Hall', 537, 660, 716, 735); RM('Área de espera · Recepción', 347, 660, 537, 821);
  RM('Aula #1 · Salón de reuniones', 718, 442, 914, 601); RM('Depósito', 914, 442, 1028, 601); RM('Área de profesores', 1028, 442, 1157, 601);
  RM('Cocina · Lavado', 855, 601, 1028, 710); RM('Cafetería', 1028, 601, 1108, 710); RM('Libros de consulta', 718, 601, 855, 677);
  RM('Oficina administrativa', 718, 677, 857, 804); RM('WC', 857, 710, 905, 804);
  RM('Terraza', 550, 350, 720, 435, { ext: true }); RM('Nuevo pasillo', 720, 350, 1157, 442, { ext: true }); RM('Marquesina · Área de juegos', 905, 710, 1157, 917, { ext: true });
  RM('Galería', 277, 655, 347, 826, { ext: true }); RM('Patio', 537, 735, 905, 890, { ext: true }); RM('Jardín', 46, 40, 1157, 1010, { ext: true });

  // ---------- Mobiliario ----------
  const A5 = [230, 82, 411, 248], A6 = [411, 82, 548, 256], A4 = [160, 248, 352, 399], A3 = [160, 399, 352, 567], A2 = [352, 492, 549, 660], A1 = [718, 442, 914, 601];
  aula(c, A5, { board: ['e', 0.42], shelf: ['n', 0.52, 2], pin: ['s', 0.3], tables: [[290, 150], [290, 205]], rug: [368, 135, 0.75], plants: [[245, 232]] });
  aula(c, A6, { board: ['w', 0.42, 1.6], shelf: ['n', 0.5, 2], tables: [[478, 150, 90]], rug: [455, 222, 0.65], plants: [[532, 240]] });
  aula(c, A4, { board: ['s', 0.45], shelf: ['n', 0.35, 2], pin: ['e', 0.62, 1.2], tables: [[230, 300], [230, 355]], rug: [312, 345, 0.7], plants: [[176, 262]] });
  aula(c, A3, { board: ['n', 0.45], shelf: ['s', 0.72, 1.6], pin: ['e', 0.7, 1.2], tables: [[232, 455], [232, 508]], rug: [308, 500, 0.7] });
  aula(c, A2, { board: ['e', 0.5], shelf: ['s', 0.5, 2.4], pin: ['n', 0.68, 1.6], tables: [[440, 560], [440, 612]], rug: [505, 540, 0.7], plants: [[366, 644]] });
  aula(c, A1, { board: ['e', 0.5], shelf: ['s', 0.5, 2.4], pin: ['w', 0.5, 1.6], tables: [[845, 505], [845, 558]], plants: [[735, 585], [898, 458]] });
  // Baños infantiles
  const BA = [411, 256, 550, 434];
  for (const f of [0.22, 0.5, 0.78]) F.toilet(onWall(c, BA, 'n', f), 0.75);
  for (const f of [0.36, 0.64]) { const p = onWall(c, BA, 'n', f); p.box(M.white, 0.03, 1.3, 0.9, 0, 0.15, 0.45); p.colBox(0.05, 0.9, 0, 0.45); }
  F.trough(onWall(c, BA, 'e', 0.72), 1.8);
  // Pasillo
  F.coatRack(onWall(c, [352, 256, 411, 492], 'e', 0.56), 1.6);
  // Exhibiciones / hall
  F.display(c.atp(612, 520, 90), 1.6); F.display(c.atp(600, 618, 0), 1.3);
  F.pedestal(c.atp(585, 505)); F.pedestal(c.atp(655, 520)); F.printerTable(onWall(c, [550, 435, 718, 660], 'w', 0.45));
  F.bench(c.atp(564, 590, 90), 1.2); F.plant(c.atp(565, 641), 1.6);
  F.rugRect(c.atp(640, 545), 2.2, 1.5, PAL.cream);
  // Espera y recepción
  F.reception(c.atp(470, 772, 180), 2.2);
  F.sofa(c.atp(351, 800, 90), 0.9, PAL.sage); F.sofa(onWall(c, [347, 660, 537, 821], 'n', 0.66), 1.9, PAL.blue);
  F.rugRect(c.atp(455, 712), 2.6, 1.3, PAL.cream); F.plant(c.atp(366, 676), 1.5);
  // Depósito
  const DE = [914, 442, 1028, 601];
  F.bookcase(onWall(c, DE, 'e', 0.55), 2.2, 1.9); F.bookcase(onWall(c, DE, 's', 0.45), 1.6, 1.9);
  c.atp(935, 560).box(M.cork, 0.5, 0.4, 0.4, 0, 0.03, 0); c.atp(937, 558).box(M.cork, 0.4, 0.3, 0.35, 0, 0.43, 0); c.atp(935, 560).colBox(0.5, 0.4);
  // Profesores
  const PR = [1028, 442, 1157, 601];
  F.tableSet(c.atp(1078, 520, 90), { k: 1, w: 1.5, n: 2, top: M.oak });
  F.lockers(onWall(c, PR, 'w', 0.15), 1.0, 1.8, 3);
  // Cocina · lavado
  const CO = [855, 601, 1028, 710];
  F.kitchen(onWall(c, CO, 's', 0.52), 3.2, { stove: true });
  F.fridge(c.atp(962, 605)); F.fridge(c.atp(1004, 605), M.white); F.washer(c.atp(884, 605));
  // Cafetería
  { const b = onWall(c, [1028, 601, 1108, 710], 'e', 0.26); b.box(M.oak, 1.1, 0.04, 0.36, 0, 1.0, 0.18); b.box(M.dark, 0.04, 1.0, 0.04, -0.5, 0.03, 0.3); b.box(M.dark, 0.04, 1.0, 0.04, 0.5, 0.03, 0.3); b.colBox(1.1, 0.38, 0, 0.19); }
  // Libros de consulta
  F.bookcase(onWall(c, [718, 601, 855, 677], 'n', 0.45), 2.4, 1.9, 0.28);
  // Oficina
  const OF = [718, 677, 857, 804];
  F.desk(onWall(c, OF, 's', 0.27), 1.2); F.desk(onWall(c, OF, 's', 0.73), 1.2); F.plant(c.atp(845, 692), 1.4);
  // WC
  F.toilet(onWall(c, [857, 710, 905, 804], 's', 0.5)); F.sink(onWall(c, [857, 710, 905, 804], 'n', 0.5));
  // Terraza y pasillo nuevo
  F.bench(c.atp(585, 420), 1.4); F.plant(c.atp(705, 422), 1.5); F.bench(c.atp(1146, 396, 90), 1.4);
  // Marquesina: merendar / manualidades / juegos
  for (const [x, y] of [[945, 760], [1010, 760], [952, 882], [1027, 882], [1102, 882]]) F.tableSet(c.atp(x, y), { w: 0.8, d: 0.8, n: 1, ends: true });
  F.cubby(onWall(c, [905, 710, 1157, 917], 'e', 0.4), 2, 0.86, 0.36, 5, 2);
  // Galería y patio
  F.bench(c.atp(292, 705, 90), 1.0); F.bench(c.atp(292, 783, 90), 1.0);
  F.bench(c.atp(575, 850, 60), 1.3); F.bench(c.atp(690, 876), 1.4); F.bench(c.atp(782, 876), 1.4); F.plant(c.atp(560, 770), 1.5);
  // Jardín norte (grava), bancos curvos y jardineras
  arcBench(c, 607, 345, 113, -90, -4, 9);
  arcBench(c, 1031, 350, 50, 188, 352, 7);
  F.planter(c.atp(616, 165, 90), 2.8, 0.4, 4);
  F.planter(c.atp(845, 334), 5.2, 0.55, 7); F.planter(c.atp(1118, 338), 1.1, 0.5, 2);
  F.tree(c.atp(930, 150), 5.5, 2.4);
  // Jardín frontal y sur
  F.palm(c.atp(110, 250), 7.5); F.palm(c.atp(120, 470), 6.5); F.tree(c.atp(200, 150), 4.5, 1.8);
  for (const [x, y] of [[262, 590], [300, 592], [190, 560]]) F.bush(c.atp(x, y), 0.5);
  F.hedge(c.atp(600, 52), 23, 1.3, 0.5); F.hedge(c.atp(60, 300, 90), 9, 1.3, 0.5);
  F.playFloor(c.atp(770, 950), 6.6, 2.3, PAL.teal);
  F.slide(c.atp(655, 952, 90)); F.sandbox(c.atp(835, 950), 2);
  F.pine(c.atp(960, 962), 6.5); F.tree(c.atp(430, 930), 4.5, 1.9); F.bush(c.atp(500, 880), 0.6); F.bush(c.atp(380, 870), 0.6);
  F.tree(c.atp(1090, 968), 4, 1.6);

  // ---------- Muro perimetral y portón ----------
  lotWall(c, 46, 40, 1157, 40); lotWall(c, 1157, 40, 1157, 1010); lotWall(c, 46, 1010, 1157, 1010);
  lotWall(c, 46, 40, 46, 1010, [[745, 930]]);
  { // portón corredizo abierto, recogido hacia el norte
    const g = c.atp(54, 585, -90);
    g.box(M.frame, 3.5, 0.06, 0.05, 1.75, 0.08, 0); g.box(M.frame, 3.5, 0.06, 0.05, 1.75, 1.95, 0);
    for (let i = 0; i <= 28; i++) g.box(M.frame, 0.03, 1.9, 0.03, i * 0.125, 0.1, 0);
  }

  // ---------- Lugares para personajes y recorrido guiado ----------
  const P = (x, y) => { const [lx, lz] = c.P(x, y); const [wx, wz] = c.toWorld(lx, lz); return [wx, wz]; };
  c.w.spots.push({ house, list: [[505, 744], [650, 585], [1105, 800], [760, 550], [610, 382], [590, 812], [170, 700], [305, 518]].map(([x, y]) => P(x, y)) });
  return {
    gate: P(20, 838), entry: P(120, 838),
    tour: [[20, 838], [200, 838], [240, 622], [312, 622], [312, 700], [400, 715], [560, 715], [690, 705], [690, 480], [480, 462], [372, 462], [372, 424], [300, 424], [372, 424], [372, 277], [300, 300], [372, 277], [386, 240], [386, 215], [345, 160], [386, 215], [386, 240], [372, 277], [372, 462], [480, 462], [640, 470], [672, 470], [672, 395], [745, 400], [767, 400], [767, 490], [767, 400], [1000, 400], [1116, 400], [1116, 465], [1136, 500], [1136, 583], [1078, 583], [1078, 655], [1000, 655], [880, 650], [830, 648], [741, 645], [741, 722], [741, 645], [690, 645], [690, 705], [655, 705], [655, 790], [780, 850], [888, 850], [905, 824], [1068, 818], [1068, 760], [1068, 818]].map(([x, y]) => P(x, y)),
  };
}
