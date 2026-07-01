import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 11500;

// Sprite radial em memória — sem isso, PointsMaterial renderiza cada
// partícula como um quadrado sólido em vez de um ponto de luz suave.
function useGlowSprite() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0,    'rgba(255,255,255,1)');
    gradient.addColorStop(0.4,  'rgba(255,255,255,0.55)');
    gradient.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

function NebulaField() {
  const ref      = useRef();
  const baseRotY = useRef(0);
  const { pointer } = useThree();
  const glowSprite = useGlowSprite();

  // ── Buffers de repulsão do mouse — mola + amortecimento em torno da posição
  //    de repouso (basePos), mesmo princípio físico do morph dos ícones de
  //    Serviços (ThreeServicesCanvas), só que sem alvo de morfing: aqui as
  //    partículas só se afastam do cursor e retornam ao lugar.
  const renderBuf = useRef(null);
  const dispVel   = useRef(null);
  const _plane    = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const _invMat   = useRef(new THREE.Matrix4());
  const _mouseW   = useRef(new THREE.Vector3());
  const _mouseL   = useRef(new THREE.Vector3());

  const [basePos, colors] = useMemo(() => {
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

  if (!renderBuf.current) renderBuf.current = basePos.slice();
  if (!dispVel.current)   dispVel.current   = new Float32Array(PARTICLE_COUNT * 3);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(renderBuf.current, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    return g;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, dt) => {
    if (!ref.current) return;
    const cap = Math.min(dt, 0.05); // cap de segurança: evita explosão de física em tabs hidden

    // ── 1. Rotação de paralaxe (existente) ────────────────────────────────
    baseRotY.current += 0.00045;
    ref.current.rotation.z += 0.00012;
    ref.current.rotation.y = baseRotY.current + pointer.x * 0.18;
    ref.current.rotation.x += (-pointer.y * 0.14 - ref.current.rotation.x) * 0.03;
    ref.current.updateMatrixWorld(false);

    // ── 2. Posição do mouse em espaço local (mesma técnica do morph de
    //    Serviços: intersecta o raio com o plano XY e desfaz a matrixWorld,
    //    já compensando a rotação e a escala 3.5× do grupo) ───────────────
    let mx = 1e6, my = 1e6, mz = 0; // padrão: longe de tudo → sem repulsão
    const hit = state.raycaster.ray.intersectPlane(_plane.current, _mouseW.current);
    if (hit) {
      _invMat.current.copy(ref.current.matrixWorld).invert();
      _mouseL.current.copy(_mouseW.current).applyMatrix4(_invMat.current);
      mx = _mouseL.current.x;
      my = _mouseL.current.y;
      mz = _mouseL.current.z;
    }

    const rBuf = renderBuf.current;
    const bPos = basePos;
    const dVel = dispVel.current;

    const SPRING_K = 9;     // rigidez da mola de retorno ao repouso
    const VEL_DAMP = 6;     // amortecimento viscoso
    const RADIUS   = 2.4;   // raio de influência do mouse (unidades locais, pré-escala)
    const R2       = RADIUS * RADIUS;
    const STRENGTH = 30;    // intensidade da repulsão

    let i = 0;
    const len = PARTICLE_COUNT * 3;
    while (i < len) {
      let dx = rBuf[i]   - bPos[i];
      let dy = rBuf[i+1] - bPos[i+1];
      let dz = rBuf[i+2] - bPos[i+2];

      // a) Mola + amortecimento — puxa a partícula de volta ao repouso
      dVel[i]   += (-SPRING_K * dx - VEL_DAMP * dVel[i])   * cap;
      dVel[i+1] += (-SPRING_K * dy - VEL_DAMP * dVel[i+1]) * cap;
      dVel[i+2] += (-SPRING_K * dz - VEL_DAMP * dVel[i+2]) * cap;

      // b) Repulsão do mouse
      const px = bPos[i]   + dx;
      const py = bPos[i+1] + dy;
      const pz = bPos[i+2] + dz;
      const ddx = px - mx;
      const ddy = py - my;
      const ddz = pz - mz;
      const d2  = ddx * ddx + ddy * ddy + ddz * ddz;

      if (d2 < R2 && d2 > 1e-6) {
        const d      = Math.sqrt(d2);
        const factor = (1 - d / RADIUS) * STRENGTH * cap;
        dVel[i]   += (ddx / d) * factor;
        dVel[i+1] += (ddy / d) * factor;
        dVel[i+2] += (ddz / d) * factor;
      }

      // c) Integração Euler
      dx += dVel[i]   * cap;
      dy += dVel[i+1] * cap;
      dz += dVel[i+2] * cap;

      rBuf[i]   = bPos[i]   + dx;
      rBuf[i+1] = bPos[i+1] + dy;
      rBuf[i+2] = bPos[i+2] + dz;

      i += 3;
    }

    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} scale={[3.5, 3.5, 3.5]}>
      <primitive object={geo} attach="geometry" />
      <pointsMaterial
        map={glowSprite}
        size={0.16}
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
