// Proyecto 2: propuesta del taller de arranque (croquis en Miro). Coordenadas en px de la imagen (43 px ≈ 1 m, escala estimada por las puertas).
import { M, K, PAL } from './kit.js';
import { wall, floor, roof, column, room, lotWall } from './build.js';
import * as F from './furniture.js';
import { onWall, aula } from './casa1.js';

export const CASA2 = { s: 1 / 43, ox: 45, oy: 65, name: 'Proyecto 2' };

export function buildCasa2(c) {
  const W = (...a) => wall(c, ...a), house = CASA2.name;
  const RM = (name, x1, y1, x2, y2, o = {}) => room(c, name, x1, y1, x2, y2, { house, ...o });

  // ---------- Muros horizontales ----------
  W(90, 159, 739, 159, [[292, 330, 'door', { side: 1 }], [450, 560, 'win'], [600, 700, 'win']]);
  W(90, 335, 739, 335, [[376, 406, 'arch'], [548, 588, 'door', { side: -1 }]]);
  W(354, 388, 545, 388);
  W(90, 480, 354, 480, [[150, 290, 'win']]);
  W(354, 670, 545, 670, [[380, 515, 'win']]);
  W(592, 410, 739, 410);
  W(592, 695, 1260, 695, [[608, 646, 'door', { side: -1 }], [876, 914, 'door', { side: -1, hinge: 'b' }], [932, 970, 'door', { side: -1 }]]);
  W(548, 757, 1135, 757, [[606, 700, 'arch'], [893, 933, 'door', { side: 1, hinge: 'b' }], [952, 992, 'door', { side: 1 }]]);
  W(1135, 792, 1300, 792, [[1252, 1292, 'door', { side: 1, hinge: 'b' }]]);
  W(740, 972, 1135, 972, [[765, 925, 'big', { sill: 0.45 }], [960, 1120, 'big', { sill: 0.45 }]]);
  W(1135, 1005, 1390, 1005, [[1160, 1272, 'win'], [1310, 1378, 'ddoor', { side: -1 }]]);
  W(548, 920, 740, 920, [[575, 722, 'big', { sill: 0.45 }]]);
  W(739, 518, 1390, 518, [[795, 865, 'slide'], [955, 1100, 'big', { sill: 0.45 }], [1265, 1320, 'ddoor', { side: 1, glass: true }]]);
  W(739, 305, 947, 305, [[775, 905, 'win']]);
  W(915, 432, 947, 432);
  // ---------- Muros verticales ----------
  W(90, 159, 90, 480, [[212, 252, 'door', { side: -1 }], [392, 432, 'door', { side: -1 }]]);
  W(337, 159, 337, 335); W(412, 159, 412, 335);
  W(739, 159, 739, 695, [[185, 300, 'win']]);
  W(354, 335, 354, 670, [[345, 381, 'door', { side: 1 }], [525, 640, 'win']]);
  W(545, 388, 545, 757, [[622, 662, 'door', { side: 1 }], [703, 748, 'door', { side: -1 }]]);
  W(592, 335, 592, 695, [[350, 388, 'door', { side: -1 }]]);
  W(947, 305, 947, 432, [[325, 415, 'win']]);
  W(915, 432, 915, 518);
  W(922, 518, 922, 695, [[590, 660, 'slide']]);
  W(1132, 518, 1132, 695);
  W(1260, 518, 1260, 695, [[600, 640, 'door', { side: 1 }]]);
  W(1390, 518, 1390, 1005);
  W(740, 757, 740, 972); W(942, 757, 942, 972);
  W(1135, 757, 1135, 1005);
  W(1300, 792, 1300, 1005, [[840, 960, 'big', { sill: 0.6 }]]);
  W(548, 757, 548, 920, [[800, 880, 'ddoor', { side: 1 }]]);
  // porche de llegada (D) y cobertizo existente
  column(c, 496, 766, { h: 2.5 }); column(c, 496, 916, { h: 2.5 });
  W(1177, 100, 1385, 100); W(1177, 220, 1385, 220, [[1230, 1270, 'door', { side: -1 }]]); W(1177, 100, 1177, 220); W(1385, 100, 1385, 220);

  // ---------- Pisos ----------
  const wood = [[412, 159, 739, 335], [354, 388, 545, 670], [739, 305, 947, 518], [922, 518, 1132, 695], [740, 757, 942, 972], [942, 757, 1135, 972], [1135, 792, 1300, 1005], [90, 335, 354, 480], [739, 518, 922, 695]];
  for (const r of wood) floor(c, ...r, M.wood);
  const tile = [[90, 159, 412, 335], [354, 335, 545, 388], [545, 335, 592, 695], [592, 335, 739, 695], [1132, 518, 1260, 695], [1260, 518, 1390, 792], [545, 695, 1260, 757], [1135, 757, 1260, 792], [1300, 792, 1390, 1005], [548, 757, 740, 920]];
  for (const r of tile) floor(c, ...r, M.tile);
  floor(c, 492, 757, 548, 920, M.terra); floor(c, 1135, 1005, 1392, 1290, M.pavers); floor(c, 1177, 100, 1385, 220, M.concrete);
  floor(c, 440, 700, 545, 757, M.concrete); // acceso secundario
  floor(c, 1255, 440, 1330, 518, M.concrete);

  // ---------- Techos ----------
  for (const r of [[90, 159, 739, 335], [90, 335, 354, 480], [354, 335, 739, 695], [739, 305, 947, 518], [739, 518, 1390, 695], [545, 695, 1390, 792], [740, 757, 1135, 972], [1135, 792, 1390, 1005], [548, 757, 740, 920]]) roof(c, ...r);
  roof(c, 492, 757, 548, 920, { y: 2.5, th: 0.15, over: 0.1 });
  roof(c, 1177, 100, 1385, 220, { y: 2.4, th: 0.15, over: 0.15 });
  roof(c, 1230, 1005, 1392, 1120, { y: 2.5, th: 0.15, over: 0 }); column(c, 1240, 1112, { h: 2.5 });

  // ---------- Escalera (cerrada al paso) ----------
  { const [x, z] = c.P(356, 318); for (let i = 0; i < 14; i++) c.box(M.concrete, 0.72, 0.19 * (i + 1), 0.25, x, 0.03, z - i * 0.25); c.col(x - 0.4, z - 3.6, x + 0.4, z + 0.13); }

  // ---------- Espacios ----------
  RM('Servicios', 90, 159, 337, 335); RM('Escalera', 337, 159, 412, 335, { lamp: false }); RM('Aula 7 · Consultorio', 412, 159, 739, 335);
  RM('Consultorio 3', 90, 335, 354, 480); RM('Pasillo', 354, 335, 545, 388, { lamp: false }); RM('Aula 6 · Multifuncional', 354, 388, 545, 670);
  RM('Pasillo', 545, 335, 592, 695); RM('Baños', 592, 335, 739, 410); RM('Cocina', 592, 410, 739, 695);
  RM('Aula 5', 739, 305, 947, 518); RM('Mini gym · Comedor', 739, 518, 922, 695); RM('Aula 4', 922, 518, 1132, 695); RM('Baño de niños', 1132, 518, 1260, 695);
  RM('Sala de llegada · Espera · Juego libre', 1260, 518, 1390, 792); RM('Lobby', 545, 695, 1260, 757); RM('Lobby', 1135, 757, 1300, 792, { lamp: false });
  RM('Entrada principal', 1300, 792, 1390, 1005); RM('Aula 3', 740, 757, 942, 972); RM('Aula 2', 942, 757, 1135, 972); RM('Aula 1', 1135, 792, 1300, 1005);
  RM('Sala de llegada · Juego libre', 548, 757, 740, 920);
  RM('Porche de llegada', 492, 757, 548, 920, { ext: true }); RM('Play area', 950, 230, 1392, 518, { ext: true }); RM('Play area', 45, 485, 350, 720, { ext: true }); RM('Play area · Patio interior', 742, 975, 1132, 1290, { ext: true });
  RM('Acceso principal', 1135, 1005, 1392, 1290, { ext: true }); RM('Jardín', 45, 65, 1392, 1290, { ext: true });

  // ---------- Mobiliario (ligero: el croquis no lo define) ----------
  const A7 = [412, 159, 739, 335], A6 = [354, 388, 545, 670], A5 = [739, 305, 947, 518], A4 = [922, 518, 1132, 695], A3 = [740, 757, 942, 972], A2 = [942, 757, 1135, 972], A1 = [1135, 792, 1300, 1005];
  aula(c, A7, { board: ['e', 0.3], shelf: ['n', 0.9, 1.2], pin: ['s', 0.22, 1.6], tables: [[480, 230], [480, 285], [650, 240, 90]], rug: [668, 290, 0.8], plants: [[428, 320]] });
  aula(c, A6, { board: ['n', 0.5], shelf: ['e', 0.35, 2], pin: ['e', 0.66, 1.2], tables: [[420, 470], [420, 525]], round: [[450, 615, 0.5]], plants: [[370, 404]] });
  aula(c, A5, { board: ['w', 0.4], shelf: ['n', 0.2, 0.9], pin: ['w', 0.78, 1.2], tables: [[880, 360, 90], [800, 440]], rug: [790, 360, 0.75] });
  aula(c, A4, { board: ['e', 0.45], shelf: ['s', 0.72, 2], tables: [[1010, 590], [1010, 645, 0]], rug: [1082, 560, 0.7] });
  aula(c, A3, { board: ['w', 0.5], shelf: ['e', 0.6, 2], pin: ['n', 0.3, 1.6], tables: [[800, 850], [800, 905]], rug: [885, 930, 0.7] });
  aula(c, A2, { board: ['e', 0.5], shelf: ['w', 0.6, 2], pin: ['n', 0.72, 1.6], tables: [[1065, 850], [1065, 905]], rug: [985, 930, 0.7] });
  aula(c, A1, { board: ['w', 0.55], shelf: ['s', 0.7, 1.2], tables: [[1205, 900], [1205, 955]], rug: [1195, 835, 0.6] });
  // Consultorio 3
  const C3 = [90, 335, 354, 480];
  F.desk(onWall(c, C3, 's', 0.72), 1.4); F.sofa(onWall(c, C3, 'n', 0.3), 1.8, PAL.sage); F.bookcase(onWall(c, C3, 'e', 0.7), 1.2, 1.9); F.rugRect(c.atp(175, 400), 2, 1.4, PAL.cream); F.plant(c.atp(108, 462), 1.4);
  // Servicios
  const SV = [90, 159, 337, 335];
  F.washer(onWall(c, SV, 's', 0.2)); F.washer(onWall(c, SV, 's', 0.36)); F.bookcase(onWall(c, SV, 'e', 0.5), 2.4, 1.9, 0.4); F.kitchen(onWall(c, SV, 'n', 0.42), 2, { upper: false });
  // Baños y cocina
  const BN = [592, 335, 739, 410];
  for (const f of [0.55, 0.8]) F.toilet(onWall(c, BN, 'n', f), 0.75);
  { const p = onWall(c, BN, 'n', 0.675); p.box(M.white, 0.03, 1.3, 0.9, 0, 0.15, 0.45); p.colBox(0.05, 0.9, 0, 0.45); }
  F.sink(onWall(c, BN, 's', 0.75), 0.75);
  const CK = [592, 410, 739, 695];
  F.kitchen(onWall(c, CK, 'e', 0.45), 3.6, { stove: true }); F.fridge(onWall(c, CK, 'n', 0.72, 0.1)); F.tableSet(c.atp(640, 560, 90), { k: 1, w: 1.2, n: 2, top: M.oak });
  // Baño de niños
  const BK = [1132, 518, 1260, 695];
  for (const f of [0.2, 0.5, 0.8]) F.toilet(onWall(c, BK, 'n', f), 0.75);
  for (const f of [0.35, 0.65]) { const p = onWall(c, BK, 'n', f); p.box(M.white, 0.03, 1.3, 0.9, 0, 0.15, 0.45); p.colBox(0.05, 0.9, 0, 0.45); }
  F.trough(onWall(c, BK, 'w', 0.68), 1.8);
  // Mini gym · comedor
  const MG = [739, 518, 922, 695];
  F.wallBars(onWall(c, MG, 'w', 0.35), 1); F.wallBars(onWall(c, MG, 'w', 0.65), 1);
  F.gymMat(c.atp(782, 572, 90), PAL.blue); F.gymMat(c.atp(782, 650, 90), PAL.terra, 1.2, 0.9); F.pikler(c.atp(812, 655, 90));
  // Lobby, sala de llegada (derecha) y entrada
  const LZ = [1260, 518, 1390, 792];
  F.sofa(onWall(c, LZ, 'e', 0.3), 1.9, PAL.blue); F.coatRack(onWall(c, LZ, 'e', 0.74), 2.2); F.rug(c.atp(1318, 600), 0.9, PAL.mustard); F.beanbag(c.atp(1290, 560), PAL.terra); F.plant(c.atp(1376, 532), 1.6);
  F.coatRack(onWall(c, [1300, 792, 1390, 1005], 'e', 0.45), 2.4); F.plant(c.atp(1316, 990), 1.4);
  F.plant(c.atp(1152, 778), 1.4); F.pinboard(onWall(c, [545, 695, 1260, 757], 's', 0.44), 2.2, 0.9);
  // Sala de llegada · juego libre (izquierda)
  const SL = [548, 757, 740, 920];
  F.coatRack(onWall(c, SL, 'e', 0.5), 2.4); F.rug(c.atp(620, 870), 1.0, PAL.sage); F.beanbag(c.atp(585, 895), PAL.mustard); F.beanbag(c.atp(672, 898), PAL.pink); F.cubby(onWall(c, SL, 'n', 0.14), 1.0, 0.86, 0.36, 2, 2);
  F.bench(c.atp(520, 780, 90), 1.0);

  // ---------- Exterior ----------
  // play area noreste (patio exterior)
  F.tree(c.atp(1090, 165), 6.5, 3); F.slide(c.atp(1075, 300, 180));
  F.playFloor(c.atp(1170, 400), 7, 4.2, PAL.teal); F.sandbox(c.atp(1310, 330), 2.4); F.pikler(c.atp(1200, 420)); F.beam(c.atp(1100, 470), 2.2); F.bench(c.atp(1010, 500), 1.6);
  // play area suroeste
  F.playFloor(c.atp(215, 600), 5.4, 3.6, PAL.mustard); F.sandbox(c.atp(160, 600), 2.2); F.pikler(c.atp(275, 610)); F.bush(c.atp(95, 530), 0.9); F.bush(c.atp(95, 630), 0.9);
  // patio interior sur
  F.playFloor(c.atp(935, 1085), 8.4, 4.4, PAL.terra); F.slide(c.atp(800, 1070, 90)); F.beam(c.atp(1000, 1150), 2.4); F.bench(c.atp(935, 992), 2); F.roundTable(c.atp(1060, 1070), 0.55);
  // jardín: árboles, seto y sendero de piedras hacia el acceso secundario
  for (const [x, y, h, r] of [[190, 1010, 5.5, 2.4], [300, 1130, 5, 2.2], [530, 1235, 5, 2], [860, 1245, 4.5, 1.8], [640, 110, 4.5, 1.8]]) F.tree(c.atp(x, y), h, r);
  F.palm(c.atp(110, 880), 7.5); F.palm(c.atp(420, 1040), 6.5);
  F.hedge(c.atp(640, 76), 6, 1.3, 0.5); F.hedge(c.atp(1000, 76), 6, 1.3, 0.5);
  for (let i = 0; i <= 12; i++) { const t = i / 12, x = (1 - t) * (1 - t) * 470 + 2 * t * (1 - t) * 480 + t * t * 1120, y = (1 - t) * (1 - t) * 728 + 2 * t * (1 - t) * 1180 + t * t * 1215; c.atp(x, y).cyl(M.concrete, 0.3 + (i % 2) * 0.08, 0.03, 0, 0, 0, { seg: 18 }); }

  // ---------- Muro perimetral ----------
  lotWall(c, 45, 65, 1392, 65); lotWall(c, 1392, 65, 1392, 1290); lotWall(c, 45, 65, 45, 1290);
  lotWall(c, 45, 1290, 1392, 1290, [[1160, 1380]]);
  { const g = c.atp(1000, 1282, 0); g.box(M.frame, 3.6, 0.06, 0.05, 1.8, 0.08, 0); g.box(M.frame, 3.6, 0.06, 0.05, 1.8, 1.95, 0); for (let i = 0; i <= 29; i++) g.box(M.frame, 0.03, 1.9, 0.03, i * 0.124, 0.1, 0); }

  const P = (x, y) => { const [lx, lz] = c.P(x, y); const [wx, wz] = c.toWorld(lx, lz); return [wx, wz]; };
  c.w.spots.push({ house, list: [[1295, 625], [690, 845], [1215, 330], [880, 860], [960, 1030], [1270, 1160], [1085, 640], [505, 570]].map(([x, y]) => P(x, y)) });
  return {
    gate: P(1270, 1320), entry: P(1270, 1220),
    tour: [[1270, 1320], [1344, 1100], [1344, 900], [1344, 772], [1335, 640], [1280, 724], [1272, 772], [1272, 840], [1272, 772], [1200, 722], [972, 722], [972, 800], [972, 722], [913, 722], [913, 800], [913, 722], [951, 722], [951, 660], [951, 722], [895, 722], [895, 660], [870, 600], [850, 560], [850, 480], [850, 560], [870, 600], [895, 660], [895, 722], [653, 724], [653, 810], [653, 724], [568, 724], [568, 642], [500, 642], [568, 642], [568, 362], [568, 300], [540, 250]].map(([x, y]) => P(x, y)),
  };
}
