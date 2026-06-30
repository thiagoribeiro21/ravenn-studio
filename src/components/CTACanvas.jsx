import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 11500;

function NebulaField() {
  const ref      = useRef();
  const baseRotY = useRef(0);
  const { pointer } = useThree();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);

    const cCore  = new THREE.Color('#e9d5ff');
    const cMid   = new THREE.Color('#a855f7');
    const cOuter = new THREE.Color('#6d28d9');
    const cHalo  = new THREE.Color('#4c1d95');
    const coreCount = Math.floor(PARTICLE_COUNT * 0.70);
    const tmp = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x, y, z, t;

      if (i < coreCount) {
        const r     = Math.pow(Math.random(), 0.55) * 2.8;
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta) * 0.28;
        z = r * Math.cos(phi);
        t = r / 2.8;
      } else {
        const r     = 2.8 + Math.pow(Math.random(), 0.40) * 2.7;
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta) * 0.55;
        z = r * Math.cos(phi);
        t = 1;
      }

      pos[i * 3]     = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      if (t < 0.25)      tmp.lerpColors(cCore,  cMid,   t / 0.25);
      else if (t < 0.65) tmp.lerpColors(cMid,   cOuter, (t - 0.25) / 0.40);
      else               tmp.lerpColors(cOuter, cHalo,  (t - 0.65) / 0.35);

      col[i * 3]     = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }

    return [pos, col];
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    baseRotY.current += 0.00045;
    ref.current.rotation.z += 0.00012;
    ref.current.rotation.y = baseRotY.current + pointer.x * 0.18;
    ref.current.rotation.x += (-pointer.y * 0.14 - ref.current.rotation.x) * 0.03;
  });

  return (
    <points ref={ref} scale={[3.5, 3.5, 3.5]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors,    3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.38}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export default function CTACanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 75 }}
      gl={{ antialias: false, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <NebulaField />
    </Canvas>
  );
}
