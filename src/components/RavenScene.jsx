import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import * as THREE from 'three';

const MODEL_URL   = '/game_ready_crow.glb';
const POINT_COUNT = 6000;

function buildPointCloud(gltfScene) {
  gltfScene.updateWorldMatrix(true, true);

  const meshes = [];
  gltfScene.traverse(child => {
    if ((child.isMesh || child.isSkinnedMesh) && child.geometry?.attributes?.position) {
      meshes.push(child);
    }
  });
  if (meshes.length === 0) return null;

  const primary = meshes.reduce((best, m) =>
    (m.geometry.attributes.position.count > best.geometry.attributes.position.count ? m : best),
    meshes[0]
  );

  primary.geometry.computeBoundingBox();
  const box    = primary.geometry.boundingBox.clone();
  const center = new THREE.Vector3();
  const size   = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale  = 2.6 / maxDim;

  const positions = new Float32Array(POINT_COUNT * 3);
  const tmpPos    = new THREE.Vector3();

  try {
    const sampler = new MeshSurfaceSampler(primary).build();
    for (let i = 0; i < POINT_COUNT; i++) {
      sampler.sample(tmpPos);
      positions[i * 3]     = (tmpPos.x - center.x) * scale;
      positions[i * 3 + 1] = (tmpPos.y - center.y) * scale;
      positions[i * 3 + 2] = (tmpPos.z - center.z) * scale;
    }
  } catch (_) {
    const attr  = primary.geometry.attributes.position;
    const total = attr.count;
    for (let i = 0; i < POINT_COUNT; i++) {
      const vi = Math.floor(Math.random() * total);
      tmpPos.fromBufferAttribute(attr, vi);
      positions[i * 3]     = (tmpPos.x - center.x) * scale + (Math.random() - 0.5) * 0.015;
      positions[i * 3 + 1] = (tmpPos.y - center.y) * scale + (Math.random() - 0.5) * 0.015;
      positions[i * 3 + 2] = (tmpPos.z - center.z) * scale + (Math.random() - 0.5) * 0.015;
    }
  }

  return positions;
}

export default function RavenScene() {
  const groupRef = useRef(null);
  const { scene: gltfScene } = useGLTF(MODEL_URL);

  const [geometry, material] = useMemo(() => {
    const positions = buildPointCloud(gltfScene);
    const geo = new THREE.BufferGeometry();
    if (positions) {
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    } else {
      return [new THREE.SphereGeometry(1, 16, 16), new THREE.PointsMaterial({ color: '#9D62FF', size: 0.03 })];
    }
    const mat = new THREE.PointsMaterial({
      color:           new THREE.Color('#9D62FF'),
      size:            0.026,
      sizeAttenuation: true,
      transparent:     true,
      opacity:         0.94,
      depthWrite:      false,
      blending:        THREE.AdditiveBlending,
    });
    return [geo, mat];
  }, [gltfScene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y  = t * 0.13;
    groupRef.current.position.y  = Math.sin(t * 0.48) * 0.11;
    const breathe = 1 + Math.sin(t * 0.9) * 0.018;
    groupRef.current.scale.setScalar(breathe);
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
