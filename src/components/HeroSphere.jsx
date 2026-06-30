import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollStore } from '../scrollStore';

const COUNT  = 2400;
const RADIUS = 1.85;

function buildSphere(count, radius) {
  const pos  = new Float32Array(count * 3);
  const orig = new Float32Array(count * 3);
  const phi  = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y  = 1 - (i / (count - 1)) * 2;
    const r  = Math.sqrt(Math.max(0, 1 - y * y));
    const θ  = phi * i;
    const x  = Math.cos(θ) * r * radius;
    const z  = Math.sin(θ) * r * radius;
    const yy = y * radius;
    orig[i * 3] = pos[i * 3] = x;
    orig[i * 3 + 1] = pos[i * 3 + 1] = yy;
    orig[i * 3 + 2] = pos[i * 3 + 2] = z;
  }
  return { pos, orig };
}

export default function HeroSphere() {
  const groupRef = useRef(null);

  const { geometry, material, orig, phases } = useMemo(() => {
    const { pos, orig } = buildSphere(COUNT, RADIUS);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color:           new THREE.Color('#7C3AED'),
      size:            0.019,
      sizeAttenuation: true,
      transparent:     true,
      opacity:         1,
      depthWrite:      false,
      blending:        THREE.AdditiveBlending,
    });

    const phases = Float32Array.from({ length: COUNT }, () => Math.random() * Math.PI * 2);
    return { geometry: geo, material: mat, orig, phases };
  }, []);

  // Smoothed animation state — all live in refs to avoid re-renders
  const lean    = useRef({ x: 0, y: 0 });
  const smooth  = useRef({ scale: 1, xOff: 0, opacity: 1 });

  useFrame((state) => {
    if (!groupRef.current) return;
    const t  = state.clock.elapsedTime;
    const vh = window.innerHeight;
    const sy = scrollStore.y;
    const mx = scrollStore.mouseX;
    const my = scrollStore.mouseY;

    // ── Scroll phases ────────────────────────────────────────────────────
    // phase1: 0 → 1 as user scrolls from hero into manifesto
    const p1Start = vh * 0.55;
    const p1End   = vh * 1.5;
    const phase1  = sy < p1Start ? 0 : sy > p1End ? 1 : (sy - p1Start) / (p1End - p1Start);

    // phase2: 0 → 1 as user continues from manifesto into capabilities
    const p2Start = vh * 1.5;
    const p2End   = vh * 2.4;
    const phase2  = sy < p2Start ? 0 : sy > p2End ? 1 : (sy - p2Start) / (p2End - p2Start);

    // Target values driven by scroll
    const desiredScale   = 1 - phase1 * 0.5;            // 1.0 → 0.5
    const desiredXOff    = phase1 * 1.6;                 // 0 → +1.6 (drifts right)
    const desiredOpacity = (1 - phase1 * 0.8) * (1 - phase2); // 1 → 0.2 → 0

    // ── Lerp to smooth out jitter from scroll events ─────────────────────
    const lf = 0.07;
    smooth.current.scale   += (desiredScale   - smooth.current.scale)   * lf;
    smooth.current.xOff    += (desiredXOff    - smooth.current.xOff)    * lf;
    smooth.current.opacity += (desiredOpacity - smooth.current.opacity) * lf;

    material.opacity          = smooth.current.opacity;
    groupRef.current.visible  = smooth.current.opacity > 0.005;
    if (!groupRef.current.visible) return;

    // ── Mouse lean ───────────────────────────────────────────────────────
    lean.current.x += (mx * 0.3 - lean.current.x) * 0.04;
    lean.current.y += (my * 0.2 - lean.current.y) * 0.04;

    groupRef.current.scale.setScalar(smooth.current.scale);
    groupRef.current.position.x = 0.9 + lean.current.x + smooth.current.xOff;
    groupRef.current.position.y =       lean.current.y;

    // ── Slow rotation ────────────────────────────────────────────────────
    groupRef.current.rotation.y = t * 0.1;
    groupRef.current.rotation.x = Math.sin(t * 0.07) * 0.18;

    // ── Per-vertex wave + mouse distortion ───────────────────────────────
    const posArr = geometry.attributes.position.array;
    const invR   = 1 / RADIUS;

    for (let i = 0; i < COUNT; i++) {
      const b  = i * 3;
      const ox = orig[b], oy = orig[b + 1], oz = orig[b + 2];
      const nx = ox * invR, ny = oy * invR;
      const wave       = Math.sin(t * 1.4 + phases[i]) * 0.028;
      const mouseAlign = nx * mx + ny * my;
      const mousePush  = Math.max(0, mouseAlign) * 0.09;
      const d          = wave + mousePush;
      posArr[b]     = ox + nx * d;
      posArr[b + 1] = oy + ny * d;
      posArr[b + 2] = oz + (oz * invR) * d;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[0.9, 0, 0]}>
      <points geometry={geometry} material={material} />
    </group>
  );
}
