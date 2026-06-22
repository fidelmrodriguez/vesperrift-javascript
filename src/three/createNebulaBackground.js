import * as THREE from 'three';

export function createNebulaBackground(root) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 1000);
  camera.position.z = 80;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  root.appendChild(renderer.domElement);

  const geometry = new THREE.BufferGeometry();
  const count = 900;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 160;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 90;
    positions[index * 3 + 2] = (Math.random() - 0.5) * 120;

    const blue = 0.55 + Math.random() * 0.45;
    colors[index * 3] = 0.2 + Math.random() * 0.3;
    colors[index * 3 + 1] = 0.55 + Math.random() * 0.4;
    colors[index * 3 + 2] = blue;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.7,
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  function resize() {
    const width = root.clientWidth || 1;
    const height = root.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function update(time) {
    points.rotation.z = time * 0.000045;
    points.rotation.x = Math.sin(time * 0.00018) * 0.08;
    renderer.render(scene, camera);
  }

  resize();
  window.addEventListener('resize', resize);

  return {
    update,
    resize,
    destroy() {
      window.removeEventListener('resize', resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}
