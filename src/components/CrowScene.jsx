import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import * as THREE from 'three';

const MODEL_URL   = '/game_ready_crow.glb';
const POINT_COUNT = 4000;

export default function CrowScene() {
  const groupRef = useRef(null);
  const tmpVec   = useRef(new THREE.Vector3());

  // Load model + native animations
  const { scene, animations } = useGLTF(MODEL_URL);

  // useAnimations v9 already calls mixer.update(delta) in its own useFrame —
  // we only need it here for the actions ref. Do NOT call mixer.update manually.
  const { actions, names } = useAnimations(animations, scene);

  // Play the first clip (wing-flap rig) once it's ready
  useEffect(() => {
    if (!names.length) return;
    const action = actions[names[0]];
    if (action) action.reset().play();
  }, [actions, names]);

  // ── Build point cloud from the primary mesh (rest-pose baseline) ────────
  const pointData = useMemo(() => {
    let sm = null;
    let maxVerts = 0;
    scene.traverse((child) => {
      const count = child.geometry?.attributes?.position?.count ?? 0;
      if ((child.isSkinnedMesh || child.isMesh) && count > maxVerts) {
        maxVerts = count;
        sm = child;
      }
    });
    if (!sm) return null;

    // Center + scale from rest-pose bounding box
    sm.geometry.computeBoundingBox();
    const box    = sm.geometry.boundingBox.clone();
    const center = new THREE.Vector3();
    const size   = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const scale = 2.6 / Math.max(size.x, size.y, size.z);

    // Sample positions using MeshSurfaceSampler (same approach as the working old code)
    const positions = new Float32Array(POINT_COUNT * 3);
    const tv = new THREE.Vector3();
    try {
      const sampler = new MeshSurfaceSampler(sm).build();
      for (let i = 0; i < POINT_COUNT; i++) {
        sampler.sample(tv);
        positions[i * 3]     = (tv.x - center.x) * scale;
        positions[i * 3 + 1] = (tv.y - center.y) * scale;
        positions[i * 3 + 2] = (tv.z - center.z) * scale;
      }
    } catch {
      const attr  = sm.geometry.attributes.position;
      const total = attr.count;
      for (let i = 0; i < POINT_COUNT; i++) {
        tv.fromBufferAttribute(attr, Math.floor(Math.random() * total));
        positions[i * 3]     = (tv.x - center.x) * scale;
        positions[i * 3 + 1] = (tv.y - center.y) * scale;
        positions[i * 3 + 2] = (tv.z - center.z) * scale;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color:           new THREE.Color('#7C3AED'),
      size:            0.028,
      sizeAttenuation: true,
      transparent:     true,
      opacity:         0.92,
      depthWrite:      false,
      blending:        THREE.AdditiveBlending,
    });

    // Pre-compute vertex indices for applyBoneTransform (Three r167 API)
    // applyBoneTransform(index, vector): reads skinIndex/skinWeight at [index],
    // takes rest-pose position via vector, returns skinned world position.
    const canAnimate = sm.isSkinnedMesh && !!sm.geometry.attributes.skinIndex;
    let indices = null;
    if (canAnimate) {
      const total = sm.geometry.attributes.position.count;
      indices = new Uint32Array(POINT_COUNT);
      for (let i = 0; i < POINT_COUNT; i++) {
        indices[i] = Math.floor(Math.random() * total);
      }
    }

    return { geo, mat, sm, indices, center, scale, canAnimate };
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current || !pointData) return;
    const t = state.clock.elapsedTime;

    // Gentle float + yaw
    groupRef.current.position.y = Math.sin(t * 0.42) * 0.08;
    groupRef.current.rotation.y = t * 0.08 + Math.sin(t * 0.22) * 0.12;
    groupRef.current.rotation.x = Math.sin(t * 0.17) * 0.05;

    // Drive point positions from the animated SkinnedMesh every frame
    if (pointData.canAnimate && pointData.indices) {
      // Recompute bone world matrices after the mixer update
      // (useAnimations already advanced the mixer via its own useFrame)
      scene.updateWorldMatrix(true, true);

      const { geo, sm, indices, center, scale } = pointData;
      const arr     = geo.attributes.position.array;
      const posAttr = sm.geometry.attributes.position;
      const v       = tmpVec.current;

      // applyBoneTransform(index, vector) — Three.js r167 API
      // vector must be set to the rest-pose position first, then it becomes skinned.
      for (let i = 0; i < POINT_COUNT; i++) {
        const vi = indices[i];
        v.fromBufferAttribute(posAttr, vi);     // rest-pose position
        sm.applyBoneTransform(vi, v);           // modifies v → skinned position
        arr[i * 3]     = (v.x - center.x) * scale;
        arr[i * 3 + 1] = (v.y - center.y) * scale;
        arr[i * 3 + 2] = (v.z - center.z) * scale;
      }
      geo.attributes.position.needsUpdate = true;
    }
  });

  if (!pointData) return null;

  return (
    <group ref={groupRef}>
      <points geometry={pointData.geo} material={pointData.mat} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
