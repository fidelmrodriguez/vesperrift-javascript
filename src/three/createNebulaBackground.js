import * as THREE from 'three';

// GPU-only cloud motion; instanced debris and a half-resolution background keep
// fill-rate bounded. The full-resolution Pixi canvas remains crisp above it.
export function createNebulaBackground(root) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 500);
  camera.position.z = 80;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x030714);
  root.appendChild(renderer.domElement);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 767px)');
  const resources = [];
  const keep = (resource) => { resources.push(resource); return resource; };
  const uniforms = { uTime: { value: 0 }, uAspect: { value: 1 }, uDrift: { value: new THREE.Vector2() } };
  const clouds = new THREE.Mesh(keep(new THREE.PlaneGeometry(2, 2)), keep(new THREE.ShaderMaterial({
    uniforms,
    depthWrite: false,
    depthTest: false,
    vertexShader: `varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }`,
    fragmentShader: `precision mediump float;
      varying vec2 vUv; uniform float uTime; uniform float uAspect; uniform vec2 uDrift;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
      float fbm(vec2 p){ float n=0.0, a=0.5; for(int i=0;i<4;i++){ n+=a*noise(p); p=mat2(1.6,1.2,-1.2,1.6)*p+3.1; a*=0.5; } return n; }
      void main(){
        vec2 p=(vUv-0.5)*vec2(uAspect,1.0)*3.0+uDrift;
        float t=uTime*0.025;
        float warp=fbm(p+vec2(t,-t*0.5));
        float gas=fbm(p*1.7+warp*2.2+vec2(-t*0.4,t*0.3));
        float ribbon=exp(-abs(p.y+p.x*0.37+sin(p.x*1.8+t)*0.28)*2.6);
        vec3 col=vec3(0.009,0.018,0.043);
        col+=mix(vec3(0.14,0.045,0.24),vec3(0.025,0.24,0.32),smoothstep(-1.0,1.0,p.x))*gas*gas*ribbon*1.8;
        col+=vec3(0.14,0.19,0.25)*pow(gas,5.0)*ribbon;
        float vignette=1.0-smoothstep(0.25,0.9,length(vUv-0.5));
        gl_FragColor=vec4(col*(0.55+0.45*vignette),1.0);
      }`
  })));
  clouds.frustumCulled = false;
  clouds.renderOrder = -10;
  scene.add(clouds);

  // Round stellar points at several depths, with gentle GPU scintillation.
  let seed = 819;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const starCount = compact.matches ? 420 : 850;
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    positions.set([(random() - 0.5) * 280, (random() - 0.5) * 170, -random() * 140], i * 3);
    sizes[i] = 1 + random() * 2;
  }
  const starGeometry = keep(new THREE.BufferGeometry());
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  const starMaterial = keep(new THREE.ShaderMaterial({
    uniforms: { uTime: uniforms.uTime }, transparent: true, depthWrite: false,
    vertexShader: `attribute float aSize; uniform float uTime; varying float vLight;
      void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*p;
        gl_PointSize=clamp(aSize*100.0/-p.z,1.0,3.5); vLight=0.45+0.2*sin(uTime*0.7+position.x); }`,
    fragmentShader: `varying float vLight; void main(){ float r=length(gl_PointCoord-0.5); gl_FragColor=vec4(0.68,0.83,1.0,(1.0-smoothstep(0.05,0.5,r))*vLight); }`
  }));
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // A physically lit planet, atmospheric limb and inclined orbital rings.
  scene.add(new THREE.AmbientLight(0x7389bf, 0.6));
  const sun = new THREE.DirectionalLight(0x9de8ff, 3);
  sun.position.set(-45, 35, 35);
  scene.add(sun);
  const planetGroup = new THREE.Group();
  planetGroup.position.set(36, 16, -50);
  planetGroup.rotation.z = -0.42;
  scene.add(planetGroup);
  const planetMaterial = keep(new THREE.MeshStandardMaterial({ color: 0x2b536b, roughness: 0.95, metalness: 0.12 }));
  planetMaterial.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float bands=sin(vViewPosition.y*1.5+sin(vViewPosition.x*0.55)*2.0)*0.5+0.5;
      diffuseColor.rgb*=mix(vec3(0.32,0.46,0.65),vec3(0.85,1.0,1.0),bands);`);
  };
  const planet = new THREE.Mesh(keep(new THREE.SphereGeometry(15, 48, 32)), planetMaterial);
  planetGroup.add(planet);
  const atmosphere = new THREE.Mesh(keep(new THREE.SphereGeometry(15.65, 40, 24)), keep(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vNormal; varying vec3 vView;
      void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal); vView=normalize(-p.xyz); gl_Position=projectionMatrix*p; }`,
    fragmentShader: `varying vec3 vNormal; varying vec3 vView; void main(){ float rim=pow(1.0-max(dot(normalize(vNormal),normalize(vView)),0.0),4.0); gl_FragColor=vec4(0.12,0.55,0.9,rim*0.33); }`
  })));
  planetGroup.add(atmosphere);
  const ringGroup = new THREE.Group();
  ringGroup.rotation.x = 1.12;
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(keep(new THREE.RingGeometry(20 + i * 2.7, 21.3 + i * 2.7, 96)), keep(new THREE.MeshBasicMaterial({
      color: [0x698fa7, 0x8b82ad, 0x48657f][i], side: THREE.DoubleSide, transparent: true, opacity: 0.18 - i * 0.03, depthWrite: false
    })));
    ringGroup.add(ring);
  }
  planetGroup.add(ringGroup);

  const debrisCount = compact.matches ? 22 : 48;
  const debris = new THREE.InstancedMesh(keep(new THREE.IcosahedronGeometry(1, 0)), keep(new THREE.MeshStandardMaterial({ color: 0x35445a, roughness: 1, flatShading: true })), debrisCount);
  const rockData = Array.from({ length: debrisCount }, () => ({
    x: (random() - 0.5) * 200, y: (random() - 0.5) * 110, z: -15 - random() * 75,
    size: 0.25 + random() * 1.1, phase: random() * 6.28
  }));
  const dummy = new THREE.Object3D();
  debris.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(debris);
  let lastFrame = -Infinity;
  let clock = 0;
  function resize() {
    const width = root.clientWidth || 1;
    const height = root.clientHeight || 1;
    const scale = compact.matches ? 0.6 : 0.75;
    renderer.setSize(Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)), false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    uniforms.uAspect.value = camera.aspect;
    lastFrame = -Infinity;
  }
  function update(time, player, active = true) {
    if (document.hidden || time - lastFrame < 1000 / 30) return;
    const dt = Number.isFinite(lastFrame) ? Math.min((time - lastFrame) / 1000, 0.1) : 0;
    lastFrame = time;
    if (active && !reducedMotion.matches) clock += dt;
    uniforms.uTime.value = clock;
    const x = player ? (player.x - 1200) / 1200 : 0;
    const y = player ? (player.y - 800) / 800 : 0;
    camera.position.x += (x * 3 - camera.position.x) * 0.04;
    camera.position.y += (-y * 2 - camera.position.y) * 0.04;
    uniforms.uDrift.value.set(camera.position.x * 0.008, camera.position.y * 0.008);
    stars.rotation.z = Math.sin(clock * 0.018) * 0.035;
    planet.rotation.y = clock * 0.025;
    ringGroup.rotation.z = clock * 0.018;
    rockData.forEach((rock, i) => {
      dummy.position.set(rock.x + Math.sin(clock * 0.025 + rock.phase) * 4, rock.y + Math.cos(clock * 0.03 + rock.phase) * 3, rock.z);
      dummy.rotation.set(clock * 0.06 + rock.phase, clock * 0.04, rock.phase);
      dummy.scale.set(rock.size, rock.size * 0.7, rock.size * 1.25);
      dummy.updateMatrix();
      debris.setMatrixAt(i, dummy.matrix);
    });
    debris.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(root);
  return { update, resize, destroy() {
    observer.disconnect();
    resources.forEach(resource => resource.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  } };
}
