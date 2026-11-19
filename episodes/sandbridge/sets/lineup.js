export function build(THREE, scene, film, ctx) { const g = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), ctx.toon('#d8d2c4')); g.rotation.x = -Math.PI / 2; scene.add(g); return {}; }
