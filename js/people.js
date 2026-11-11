// Personajes que celebran: cuerpo estilizado y la cara tomada de la foto de cada persona.
import * as THREE from 'three';

// Para cambiar o agregar personas: nombre, foto recortada (assets/caras) y colores.
export const PEOPLE = [
  { name: 'José', face: 'assets/caras/jose.jpg', aspect: 330 / 535, shirt: '#f4f1ea', pants: '#2f3a4a', skin: '#a8714f', hair: '#17120f' },
  { name: 'Pamela', face: 'assets/caras/pamela.jpg', aspect: 436 / 462, shirt: '#f4f1ea', pants: '#3d4d60', skin: '#b97c5c', hair: '#7d5d3c' },
  { name: 'Laurita', face: 'assets/caras/laurita.jpg', aspect: 650 / 810, shirt: '#2f6b57', pants: '#3b3f46', skin: '#c58e6e', hair: '#5a3d2c', cap: '#1b1e1d' },
];

const loader = new THREE.TextureLoader();
const CONF = ['#e3b04b', '#d0785a', '#6f9bb8', '#8fae8b', '#e7a6a1', '#ffffff'];

function nameTag(text) {
  const c = document.createElement('canvas'); c.width = 384; c.height = 112;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(20,23,26,.82)'; g.beginPath(); g.roundRect(6, 14, 372, 84, 42); g.fill();
  g.fillStyle = '#f3efe8'; g.font = '600 50px system-ui, "Segoe UI", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 192, 59);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false }));
  s.scale.set(0.62, 0.18, 1);
  return s;
}

export function makePerson(def) {
  const g = new THREE.Group();
  const mat = (c, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const shirt = mat(def.shirt, 0.9), pants = mat(def.pants, 0.85), skin = mat(def.skin, 0.7), hair = mat(def.hair, 0.9), shoe = mat('#f1efe9', 0.6);
  const body = new THREE.Group(); g.add(body);
  const add = (geo, m, x, y, z, parent = body) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; };
  for (const s of [-1, 1]) {
    add(new THREE.CapsuleGeometry(0.075, 0.5, 4, 10), pants, s * 0.095, 0.4, 0);
    const sh = add(new THREE.SphereGeometry(0.09, 12, 8), shoe, s * 0.095, 0.05, 0.04); sh.scale.set(1, 0.6, 1.6);
  }
  const torso = add(new THREE.CapsuleGeometry(0.175, 0.34, 6, 14), shirt, 0, 1.0, 0); torso.scale.set(1.08, 1, 0.78);
  add(new THREE.CylinderGeometry(0.055, 0.06, 0.1, 10), skin, 0, 1.33, 0);
  const arms = [];
  for (const s of [-1, 1]) {
    const p = new THREE.Group(); p.position.set(s * 0.235, 1.22, 0); body.add(p);
    add(new THREE.CapsuleGeometry(0.052, 0.26, 4, 8), shirt, 0, 0.16, 0, p);
    add(new THREE.CapsuleGeometry(0.044, 0.24, 4, 8), skin, 0, 0.44, 0, p);
    add(new THREE.SphereGeometry(0.058, 10, 8), skin, 0, 0.62, 0, p);
    arms.push(p);
  }
  // cabeza: la foto se proyecta de frente sobre medio elipsoide
  const head = new THREE.Group(); head.position.set(0, 1.6, 0.01); body.add(head);
  const ry = 0.25, rx = ry * Math.min(1.0, Math.max(0.72, def.aspect * 1.12)), rz = 0.2;
  const front = new THREE.SphereGeometry(1, 36, 28, 0, Math.PI);
  const pos = front.attributes.position, uv = front.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) * 0.985 + 1) / 2, (pos.getY(i) * 0.985 + 1) / 2);
  const tex = loader.load(def.face); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const fm = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.22 });
  const f = new THREE.Mesh(front, fm); f.scale.set(rx, ry, rz); f.castShadow = true; head.add(f);
  const b = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20, Math.PI, Math.PI), hair); b.scale.set(rx, ry, rz); b.castShadow = true; head.add(b);
  if (def.cap) {
    const cm = mat(def.cap, 0.85);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.03, 28, 12, Math.PI, Math.PI, 0, Math.PI * 0.42), cm); dome.scale.set(rx, ry, rz); head.add(dome);
  }
  const tag = nameTag(def.name); tag.position.set(0, 2.08, 0); tag.userData.noAO = true; g.add(tag);
  // confeti
  const confetti = [];
  const cg = new THREE.PlaneGeometry(0.045, 0.07);
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ color: CONF[i % CONF.length], side: THREE.DoubleSide, roughness: 0.6 }));
    m.userData = { a: Math.random() * 6.28, r: 0.25 + Math.random() * 0.55, s: 0.35 + Math.random() * 0.4, o: Math.random(), noAO: true };
    g.add(m); confetti.push(m);
  }
  const ph = Math.random() * 6.28;
  g.userData.update = (t, cam) => {
    const hop = Math.abs(Math.sin(t * 4.2 + ph));
    body.position.y = hop * 0.11;
    body.rotation.z = Math.sin(t * 4.2 + ph) * 0.05;
    arms[0].rotation.z = 0.55 + Math.sin(t * 8.4 + ph) * 0.28; arms[1].rotation.z = -0.55 - Math.sin(t * 8.4 + ph + 1) * 0.28;
    head.rotation.z = Math.sin(t * 2.1 + ph) * 0.07;
    const dx = cam.x - g.position.x, dz = cam.z - g.position.z;
    if (dx * dx + dz * dz < 400) { const want = Math.atan2(dx, dz); let d = want - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); g.rotation.y += d * 0.06; }
    for (const m of confetti) {
      const u = m.userData, k = (t * u.s + u.o) % 1;
      m.position.set(Math.cos(u.a + t * 0.6) * u.r, 2.35 - k * 2.2, Math.sin(u.a + t * 0.6) * u.r);
      m.rotation.set(t * 3 + u.a, t * 2 + u.a, u.a);
    }
  };
  return g;
}

/** Coloca a las personas en lugares al azar de cada casa (una vez por casa). */
export function placePeople(scene, world) {
  for (const s of world.spots) {
    const pool = s.list.slice();
    for (const def of PEOPLE) {
      if (!pool.length) break;
      const [x, z] = pool.splice((Math.random() * pool.length) | 0, 1)[0];
      const p = makePerson(def); p.position.set(x, 0.03, z); p.rotation.y = Math.random() * 6.28;
      scene.add(p); world.dynamic.push(p);
      world.colliders.push([x - 0.2, z - 0.2, x + 0.2, z + 0.2]);
    }
  }
}
