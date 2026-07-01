import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import * as THREE from 'three';

const VIOLET = '#7C3AED';
const N      = 3000;

// ── Amostra N pontos uniformes da superfície de uma geometry ──────────────────
function sampleShape(geometry, n) {
  const dummy   = new THREE.Mesh(geometry);
  const sampler = new MeshSurfaceSampler(dummy).build();
  const arr = new Float32Array(n * 3);
  const v   = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    sampler.sample(v);
    arr[i * 3]     = v.x;
    arr[i * 3 + 1] = v.y;
    arr[i * 3 + 2] = v.z;
  }
  return arr;
}

// ── Sistema de partículas: morfing + repulsão de mouse ────────────────────────
//
//  Três buffers separados, zero allocations por frame:
//
//   morphPos  — posição "em repouso" atual (lerp contínuo → shape alvo)
//   dispPos   — deslocamento causado pela repulsão do mouse
//   dispVel   — velocidade de dispPos (integração Euler de mola + amortecimento)
//   renderBuf — morphPos + dispPos → atribuído ao BufferAttribute
//
//  Física por partícula (por frame):
//   1. Lerp morphPos → target (morfing de shape)
//   2. F_spring  = −k · disp   (Hooke — retorno ao repouso)
//   3. F_damping = −c · vel    (amortecimento viscoso)
//   4. F_repulse = dir · STRENGTH · (1 − d/R)   (se d < R)
//   5. Integração Euler: vel += ΣF·dt,  disp += vel·dt
//   6. renderBuf = morphPos + disp
//
function ParticleMorpher({ shapes, activeIndex }) {
  const groupRef  = useRef(null);
  const activeRef = useRef(activeIndex);

  // ── Buffers Float32Array ──────────────────────────────────────────────────
  const renderBuf = useRef(null);
  const morphPos  = useRef(null);
  const dispPos   = useRef(null);
  const dispVel   = useRef(null);

  if (!renderBuf.current) renderBuf.current = shapes[0].slice();
  if (!morphPos.current)  morphPos.current  = shapes[0].slice();
  if (!dispPos.current)   dispPos.current   = new Float32Array(N * 3); // zeros
  if (!dispVel.current)   dispVel.current   = new Float32Array(N * 3); // zeros

  // ── Objetos THREE pré-alocados — sem `new` dentro do loop de frame ────────
  const _plane  = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)); // XY plane (z=0)
  const _invMat = useRef(new THREE.Matrix4());
  const _mouseW = useRef(new THREE.Vector3()); // posição do mouse em world space
  const _mouseL = useRef(new THREE.Vector3()); // posição do mouse em local space do group

  // ── BufferGeometry: aponta direto para renderBuf (sem cópia) ─────────────
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(renderBuf.current, 3));
    return g;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    activeRef.current = activeIndex;
  }, [activeIndex]);

  useFrame((state, dt) => {
    const cap = Math.min(dt, 0.05); // cap de segurança: evita explosão de física em tabs hidden

    // ── 1. Atualiza rotação do group primeiro para ter a matrixWorld correta ─
    if (groupRef.current) {
      groupRef.current.rotation.y += cap * 0.45;
      groupRef.current.rotation.x  = Math.sin(state.clock.elapsedTime * 0.22) * 0.10;
      groupRef.current.updateMatrixWorld(false);
    }

    // ── 2. Posição do mouse em local space do group ───────────────────────────
    //   state.raycaster é atualizado automaticamente pelo R3F com state.pointer
    //   Intersecta o raio com o plano XY (z=0) em world space,
    //   depois transforma para o espaço local do group (que rotaciona).
    let mx = 1e6, my = 1e6, mz = 0; // padrão: longe de tudo → sem repulsão

    const hit = state.raycaster.ray.intersectPlane(_plane.current, _mouseW.current);
    if (hit && groupRef.current) {
      _invMat.current.copy(groupRef.current.matrixWorld).invert();
      _mouseL.current.copy(_mouseW.current).applyMatrix4(_invMat.current);
      mx = _mouseL.current.x;
      my = _mouseL.current.y;
      mz = _mouseL.current.z;
    }

    const target = shapes[activeRef.current];
    const rBuf   = renderBuf.current;
    const mPos   = morphPos.current;
    const dPos   = dispPos.current;
    const dVel   = dispVel.current;

    // ── Constantes de física ──────────────────────────────────────────────────
    const MORPH_K  = 1 - Math.exp(-cap * 4.5); // lerp de morfing (≈ 4.5 × dt)
    const SPRING_K = 12;    // rigidez da mola de retorno (Hz²)
    const VEL_DAMP = 7;     // amortecimento viscoso — SPRING_K=12, crit=2√12≈6.9 → ligeiramente overdamped
    const RADIUS   = 1.5;   // raio de influência do mouse (unidades world)
    const R2       = RADIUS * RADIUS;
    const STRENGTH = 45;    // intensidade da repulsão (aceleração × dt)

    // ── 3. Loop de partículas ─────────────────────────────────────────────────
    let i = 0;
    const len = N * 3;

    while (i < len) {
      // a) Lerp morphPos → target (shape atual do acordeão)
      mPos[i]   += (target[i]   - mPos[i])   * MORPH_K;
      mPos[i+1] += (target[i+1] - mPos[i+1]) * MORPH_K;
      mPos[i+2] += (target[i+2] - mPos[i+2]) * MORPH_K;

      // b) Forças de mola + amortecimento sobre o deslocamento (F = -k·x - c·v)
      dVel[i]   += (-SPRING_K * dPos[i]   - VEL_DAMP * dVel[i])   * cap;
      dVel[i+1] += (-SPRING_K * dPos[i+1] - VEL_DAMP * dVel[i+1]) * cap;
      dVel[i+2] += (-SPRING_K * dPos[i+2] - VEL_DAMP * dVel[i+2]) * cap;

      // c) Repulsão: posição atual = morphPos + dispPos
      const px = mPos[i]   + dPos[i];
      const py = mPos[i+1] + dPos[i+1];
      const pz = mPos[i+2] + dPos[i+2];

      const dx = px - mx;
      const dy = py - my;
      const dz = pz - mz;
      const d2 = dx * dx + dy * dy + dz * dz;

      if (d2 < R2 && d2 > 1e-6) {
        const d      = Math.sqrt(d2);             // sqrt apenas quando necessário
        const factor = (1 - d / RADIUS) * STRENGTH * cap; // falloff linear × dt
        dVel[i]   += (dx / d) * factor;
        dVel[i+1] += (dy / d) * factor;
        dVel[i+2] += (dz / d) * factor;
      }

      // d) Integração Euler: posição += velocidade × dt
      dPos[i]   += dVel[i]   * cap;
      dPos[i+1] += dVel[i+1] * cap;
      dPos[i+2] += dVel[i+2] * cap;

      // e) Escreve posição final no buffer de render
      rBuf[i]   = mPos[i]   + dPos[i];
      rBuf[i+1] = mPos[i+1] + dPos[i+1];
      rBuf[i+2] = mPos[i+2] + dPos[i+2];

      i += 3;
    }

    geo.attributes.position.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points geometry={geo}>
        <pointsMaterial
          color={VIOLET}
          size={0.022}
          sizeAttenuation
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// ── Scene: pré-computa as 6 geometrias de partículas ──────────────────────────
// Uma shape por serviço de CapabilitiesSection.SERVICES, na mesma ordem —
// activeIndex é o índice do array, então as duas listas precisam ter o
// mesmo tamanho (era a causa do "congelamento" no último serviço: só
// havia 5 shapes para 6 serviços, e shapes[5] ficava undefined).
function Scene({ activeIndex }) {
  const shapes = useMemo(() => [
    sampleShape(new THREE.IcosahedronGeometry(1.5, 1), N),              // 01 Sites Institucionais
    sampleShape(new THREE.TorusGeometry(1.2, 0.45, 16, 64), N),         // 02 Landing Pages
    sampleShape(new THREE.TorusKnotGeometry(0.85, 0.28, 200, 32), N),   // 03 Sites Experienciais
    sampleShape(new THREE.DodecahedronGeometry(1.4, 0), N),             // 04 Cardápios Digitais
    sampleShape(new THREE.TetrahedronGeometry(1.6, 1), N),              // 05 Google Ads
    sampleShape(new THREE.OctahedronGeometry(1.5, 0), N),               // 06 Agentes de IA
  ], []);

  return <ParticleMorpher shapes={shapes} activeIndex={activeIndex} />;
}

// ── Canvas exportado ───────────────────────────────────────────────────────────
export default function ThreeServicesCanvas({ activeIndex = 0 }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 52 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Scene activeIndex={activeIndex} />
    </Canvas>
  );
}
