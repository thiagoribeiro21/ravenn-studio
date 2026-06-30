import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import * as THREE from 'three';
import { scrollStore } from '../scrollStore';

const MODEL_URL   = '/game_ready_crow.glb';
const POINT_COUNT = 6000;

function buildPointCloud(gltfScene) {
  gltfScene.updateWorldMatrix(true, true);

  const meshes = [];
  gltfScene.traverse((child) => {
    if ((child.isMesh || child.isSkinnedMesh) && child.geometry?.attributes?.position) {
      meshes.push(child);
    }
  });
  if (!meshes.length) return null;

  // Pick largest mesh by vertex count
  const primary = meshes.reduce((best, m) =>
    m.geometry.attributes.position.count > best.geometry.attributes.position.count ? m : best,
    meshes[0]
  );

  primary.geometry.computeBoundingBox();
  const box    = primary.geometry.boundingBox.clone();
  const center = new THREE.Vector3();
  const size   = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);
  const scale = 2.6 / Math.max(size.x, size.y, size.z);

  const positions = new Float32Array(POINT_COUNT * 3);
  const tmp = new THREE.Vector3();

  try {
    const sampler = new MeshSurfaceSampler(primary).build();
    for (let i = 0; i < POINT_COUNT; i++) {
      sampler.sample(tmp);
      positions[i * 3]     = (tmp.x - center.x) * scale;
      positions[i * 3 + 1] = (tmp.y - center.y) * scale;
      positions[i * 3 + 2] = (tmp.z - center.z) * scale;
    }
  } catch {
    const attr = primary.geometry.attributes.position;
    for (let i = 0; i < POINT_COUNT; i++) {
      const vi = Math.floor(Math.random() * attr.count);
      tmp.fromBufferAttribute(attr, vi);
      positions[i * 3]     = (tmp.x - center.x) * scale;
      positions[i * 3 + 1] = (tmp.y - center.y) * scale;
      positions[i * 3 + 2] = (tmp.z - center.z) * scale;
    }
  }

  return positions;
}

export default function CrowCloud() {
  const groupRef = useRef(null);
  const { scene } = useGLTF(MODEL_URL);

  const { geometry, material } = useMemo(() => {
    const positions = buildPointCloud(scene);
    const geo = new THREE.BufferGeometry();
    if (positions) {
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }

    const mat = new THREE.PointsMaterial({
      color:           new THREE.Color('#7C3AED'),
      size:            0.026,
      sizeAttenuation: true,
      transparent:     true,
      opacity:         0,         // starts invisible, fades in via scroll
      depthWrite:      false,
      blending:        THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // ── Opacity: lerp to target based on section visibility ───────
    const targetOpacity = scrollStore.capabilitiesVisible ? 0.92 : 0;
    material.opacity += (targetOpacity - material.opacity) * 0.07;

    groupRef.current.visible = material.opacity > 0.004;
    if (!groupRef.current.visible) return;

    // ── Gentle float + rotation ───────────────────────────────────
    groupRef.current.position.y  = Math.sin(t * 0.42) * 0.1;
    groupRef.current.rotation.y  = t * 0.1 + Math.sin(t * 0.28) * 0.15;
    groupRef.current.rotation.x  = Math.sin(t * 0.18) * 0.06;
  });

  // Position x = -1.4 places crow in the left half of the viewport.
  // With camera at z=5 and fov=55: half-width at z=0 ≈ 2.56 world units.
  // x=-1.4 is roughly the left-quadrant center.
  return (
    <group ref={groupRef} position={[-1.4, 0, 0]}>
      <points geometry={geometry} material={material} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
