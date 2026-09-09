import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

const VIOLET = '#7C3AED';
const N = 3000;

// ── Amostra N pontos uniformes da superfície de uma geometry ──────────────────
export function sampleShape(geometry, n) {
  const dummy = new THREE.Mesh(geometry);
  const sampler = new MeshSurfaceSampler(dummy).build();
  const arr = new Float32Array(n * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    sampler.sample(v);
    arr[i * 3] = v.x;
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
/* Exportado (era local): reaproveitado por `PillarsCanvas.jsx` pra morfar
   entre os 4 conceitos do Ato "Pilares" com a MESMA física, sem duplicar
   ~90 linhas de integração de mola/repulsão. A única mudança pra permitir
   isso foi tirar a dependência da constante `N` do módulo (3000, calibrada
   pro objeto grande da home) — os buffers agora nascem do tamanho real de
   `shapes[0]`, então quem chama decide a contagem de partículas passando
   shapes já amostrados no tamanho que quiser (ver `sampleShape` acima). */
export function ParticleMorpher({ shapes, activeIndex }) {
  const groupRef = useRef(null);
  const activeRef = useRef(activeIndex);
  const count = shapes[0].length; // já é n×3 (Float32Array plano)

  // ── Buffers Float32Array ──────────────────────────────────────────────────
  const renderBuf = useRef(null);
  const morphPos = useRef(null);
  const dispPos = useRef(null);
  const dispVel = useRef(null);

  if (!renderBuf.current) renderBuf.current = shapes[0].slice();
  if (!morphPos.current) morphPos.current = shapes[0].slice();
  if (!dispPos.current) dispPos.current = new Float32Array(count); // zeros
  if (!dispVel.current) dispVel.current = new Float32Array(count); // zeros

  // ── Objetos THREE pré-alocados — sem `new` dentro do loop de frame ────────
  const _plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)); // XY plane (z=0)
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

  /* Repulsão só vale quando o ponteiro está REALMENTE sobre o canvas.
     `state.pointer` do R3F nasce em (0,0) — que em NDC é o centro da tela, não
     "nenhum lugar". Como o raio da câmera sempre acerta o plano XY, a repulsão
     ficava ligada no centro do objeto desde o primeiro frame e só saía de lá se
     o visitante passasse o mouse por cima: a forma aparecia inflada e oca (um
     balão) em vez do desenho real. Sem mouse (mobile inclusive), o padrão certo
     é não ter repulsão nenhuma. */
  const domElement = useThree((s) => s.gl.domElement);
  const pointerOver = useRef(false);

  useEffect(() => {
    const enable = () => {
      pointerOver.current = true;
    };
    const disable = () => {
      pointerOver.current = false;
    };
    domElement.addEventListener('pointermove', enable);
    domElement.addEventListener('pointerleave', disable);
    domElement.addEventListener('pointercancel', disable);
    return () => {
      domElement.removeEventListener('pointermove', enable);
      domElement.removeEventListener('pointerleave', disable);
      domElement.removeEventListener('pointercancel', disable);
    };
  }, [domElement]);

  useFrame((state, dt) => {
    const cap = Math.min(dt, 0.05); // cap de segurança: evita explosão de física em tabs hidden

    // ── 1. Atualiza rotação do group primeiro para ter a matrixWorld correta ─
    if (groupRef.current) {
      groupRef.current.rotation.y += cap * 0.45;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.1;
      groupRef.current.updateMatrixWorld(false);
    }

    // ── 2. Posição do mouse em local space do group ───────────────────────────
    //   state.raycaster é atualizado automaticamente pelo R3F com state.pointer
    //   Intersecta o raio com o plano XY (z=0) em world space,
    //   depois transforma para o espaço local do group (que rotaciona).
    let mx = 1e6,
      my = 1e6,
      mz = 0; // padrão: longe de tudo → sem repulsão

    const hit =
      pointerOver.current && state.raycaster.ray.intersectPlane(_plane.current, _mouseW.current);
    if (hit && groupRef.current) {
      _invMat.current.copy(groupRef.current.matrixWorld).invert();
      _mouseL.current.copy(_mouseW.current).applyMatrix4(_invMat.current);
      mx = _mouseL.current.x;
      my = _mouseL.current.y;
      mz = _mouseL.current.z;
    }

    const target = shapes[activeRef.current];
    const rBuf = renderBuf.current;
    const mPos = morphPos.current;
    const dPos = dispPos.current;
    const dVel = dispVel.current;

    // ── Constantes de física ──────────────────────────────────────────────────
    const MORPH_K = 1 - Math.exp(-cap * 4.5); // lerp de morfing (≈ 4.5 × dt)
    const SPRING_K = 12; // rigidez da mola de retorno (Hz²)
    const VEL_DAMP = 7; // amortecimento viscoso — SPRING_K=12, crit=2√12≈6.9 → ligeiramente overdamped
    const RADIUS = 1.5; // raio de influência do mouse (unidades world)
    const R2 = RADIUS * RADIUS;
    const STRENGTH = 45; // intensidade da repulsão (aceleração × dt)

    // ── 3. Loop de partículas ─────────────────────────────────────────────────
    let i = 0;
    const len = count;

    while (i < len) {
      // a) Lerp morphPos → target (shape atual do acordeão)
      mPos[i] += (target[i] - mPos[i]) * MORPH_K;
      mPos[i + 1] += (target[i + 1] - mPos[i + 1]) * MORPH_K;
      mPos[i + 2] += (target[i + 2] - mPos[i + 2]) * MORPH_K;

      // b) Forças de mola + amortecimento sobre o deslocamento (F = -k·x - c·v)
      dVel[i] += (-SPRING_K * dPos[i] - VEL_DAMP * dVel[i]) * cap;
      dVel[i + 1] += (-SPRING_K * dPos[i + 1] - VEL_DAMP * dVel[i + 1]) * cap;
      dVel[i + 2] += (-SPRING_K * dPos[i + 2] - VEL_DAMP * dVel[i + 2]) * cap;

      // c) Repulsão: posição atual = morphPos + dispPos
      const px = mPos[i] + dPos[i];
      const py = mPos[i + 1] + dPos[i + 1];
      const pz = mPos[i + 2] + dPos[i + 2];

      const dx = px - mx;
      const dy = py - my;
      const dz = pz - mz;
      const d2 = dx * dx + dy * dy + dz * dz;

      if (d2 < R2 && d2 > 1e-6) {
        const d = Math.sqrt(d2); // sqrt apenas quando necessário
        const factor = (1 - d / RADIUS) * STRENGTH * cap; // falloff linear × dt
        dVel[i] += (dx / d) * factor;
        dVel[i + 1] += (dy / d) * factor;
        dVel[i + 2] += (dz / d) * factor;
      }

      // d) Integração Euler: posição += velocidade × dt
      dPos[i] += dVel[i] * cap;
      dPos[i + 1] += dVel[i + 1] * cap;
      dPos[i + 2] += dVel[i + 2] * cap;

      // e) Escreve posição final no buffer de render
      rBuf[i] = mPos[i] + dPos[i];
      rBuf[i + 1] = mPos[i + 1] + dPos[i + 1];
      rBuf[i + 2] = mPos[i + 2] + dPos[i + 2];

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

// ── Builders: formas customizadas por serviço ─────────────────────────────────
// `sampleWeighted` distribui o orçamento de N partículas por PESO em vez de
// área de superfície pura — numa forma composta (torre em degraus, flecha
// com aletas, núcleo com dendritos), a peça fina perde feio numa amostragem
// por área e desaparece do ponto de vista. Cada peça declara seu peso
// relativo e recebe uma fatia proporcional de pontos, garantindo que ela
// permaneça legível na nuvem de partículas.
function sampleWeighted(parts, n) {
  const total = parts.reduce((s, p) => s + p.weight, 0);
  const out = new Float32Array(n * 3);
  let offset = 0;
  parts.forEach((p, idx) => {
    const isLast = idx === parts.length - 1;
    const count = isLast ? n - offset : Math.round((n * p.weight) / total);
    if (count > 0) out.set(sampleShape(p.geometry, count), offset * 3);
    offset += count;
  });
  return out;
}

// Recentraliza uma geometry no eixo Y — perfis de Lathe assimétricos (mais
// "massa" numa ponta que na outra) nascem descentrados; sem isso o objeto
// parece derivar pro canto durante o morph em vez de girar no próprio eixo.
function centerY(geometry) {
  geometry.computeBoundingBox();
  const c = new THREE.Vector3();
  geometry.boundingBox.getCenter(c);
  geometry.translate(0, -c.y, 0);
  return geometry;
}

// Regras de desenho descobertas testando no navegador — o material dos pontos
// não tem sombreamento e usa `depthWrite: false`, então a nuvem é vista "em
// raio-X" (pontos de trás não são ocultados pelos da frente). Consequências:
//   • degrau/quina em parede lisa NÃO aparece — vira borrão. Detalhe interno
//     é perdido; só silhueta global e elementos separados por VAZIO se leem.
//   • anel/toro fino lê muito bem (contorno limpo, interior vazio).
//   • ponta densa (esfera pequena com muitos pontos) vira um "nó" nítido.
//   • seção quadrada (radialSegments: 4) muda de largura ao girar em Y, então
//     a peça "respira" e mostra o giro; um Lathe redondo fica visualmente
//     estático porque é simétrico no eixo de rotação.

// 01 Sites Institucionais — obelisco: base, fuste afunilado e pirâmide, tudo
// de seção quadrada. Monumento = autoridade e permanência, que é a promessa
// do serviço ("presença que impõe respeito antes da primeira reunião").
function buildObelisk(n) {
  const plinth = new THREE.CylinderGeometry(0.6, 0.64, 0.28, 4);
  plinth.translate(0, -1.41, 0);

  const shaft = new THREE.CylinderGeometry(0.27, 0.45, 2.3, 4);
  shaft.translate(0, -0.12, 0);

  const pyramidion = new THREE.ConeGeometry(0.27, 0.5, 4);
  pyramidion.translate(0, 1.28, 0);

  return sampleWeighted(
    [
      { geometry: plinth, weight: 0.7 },
      { geometry: shaft, weight: 2.6 },
      { geometry: pyramidion, weight: 0.7 },
    ],
    n,
  );
}

// 02 Landing Pages — funil literal: boca muito aberta que despenca num gargalo
// fino e reto. O gargalo é o que faz ler como "funil" e não como taça, e é
// exatamente a metáfora do serviço (tráfego entra largo, sai convertido).
function buildFunnel(n) {
  const profile = [
    new THREE.Vector2(0.07, -1.45),
    new THREE.Vector2(0.07, -0.9),
    new THREE.Vector2(0.15, -0.72),
    new THREE.Vector2(0.45, -0.32),
    new THREE.Vector2(0.88, 0.28),
    new THREE.Vector2(1.28, 0.88),
    new THREE.Vector2(1.48, 1.22),
  ];
  return sampleShape(centerY(new THREE.LatheGeometry(profile, 44)), n);
}

// 03 Sites Experienciais — nó toroidal, a forma-assinatura de demo WebGL/
// Three.js (que é literalmente o que o serviço vende). Fita bem fina pros
// laços do nó se cruzarem visivelmente em vez de fundirem numa bola.
function buildKnot(n) {
  return sampleShape(new THREE.TorusKnotGeometry(0.95, 0.1, 260, 12, 2, 3), n);
}

// 04 Lojas Virtuais — gema lapidada (mesa plana no topo, coroa e pavilhão em
// ponta). Vitrine e valor do produto; a mesa plana é o que denuncia "pedra
// lapidada" em vez de losango genérico.
function buildGem(n) {
  const pavilion = new THREE.ConeGeometry(1.3, 1.5, 8);
  pavilion.rotateX(Math.PI); // ponta pra baixo
  pavilion.translate(0, -0.35, 0);

  const girdle = new THREE.CylinderGeometry(1.3, 1.3, 0.12, 8);
  girdle.translate(0, 0.46, 0);

  const crown = new THREE.CylinderGeometry(0.52, 1.3, 0.56, 8);
  crown.translate(0, 0.8, 0);

  return sampleWeighted(
    [
      { geometry: pavilion, weight: 1.7 },
      { geometry: girdle, weight: 0.35 },
      { geometry: crown, weight: 1.15 },
    ],
    n,
  );
}

// 05 Google Ads — mira/giroscópio: três anéis ortogonais em torno de um núcleo
// denso. Segmentação e alvo certeiro, e como dois anéis ficam de pé, eles
// varrem de frente pra perfil enquanto o grupo gira — o ícone mais "vivo" do
// conjunto, que combina com o serviço mais dinâmico.
function buildReticle(n) {
  const ringXY = new THREE.TorusGeometry(1.25, 0.035, 8, 120);
  const ringYZ = new THREE.TorusGeometry(1.25, 0.035, 8, 120).rotateY(Math.PI / 2);
  const ringXZ = new THREE.TorusGeometry(1.25, 0.035, 8, 120).rotateX(Math.PI / 2);
  const core = new THREE.SphereGeometry(0.2, 16, 16);

  return sampleWeighted(
    [
      { geometry: ringXY, weight: 1 },
      { geometry: ringYZ, weight: 1 },
      { geometry: ringXZ, weight: 1 },
      { geometry: core, weight: 0.5 },
    ],
    n,
  );
}

// 06 Agentes de IA — rede neural: núcleo, axônios finos saindo pros 12 vértices
// de um icosaedro e um nó sináptico denso na ponta de cada um (direções fixas,
// sem Math.random — visual determinístico). As pontas densas são o que faz
// isso ler como "rede" e não como bola espinhenta.
function buildNeuralNet(n) {
  const coreR = 0.58;
  const t = (1 + Math.sqrt(5)) / 2;
  const rawDirs = [
    [-1, t, 0],
    [1, t, 0],
    [-1, -t, 0],
    [1, -t, 0],
    [0, -1, t],
    [0, 1, t],
    [0, -1, -t],
    [0, 1, -t],
    [t, 0, -1],
    [t, 0, 1],
    [-t, 0, -1],
    [-t, 0, 1],
  ];
  const UP = new THREE.Vector3(0, 1, 0);
  const parts = [{ geometry: new THREE.IcosahedronGeometry(coreR, 3), weight: 2.6 }];

  rawDirs.forEach(([x, y, z], i) => {
    const dir = new THREE.Vector3(x, y, z).normalize();
    const len = 0.62 + 0.22 * Math.sin(i * 2.4);
    const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir);

    const axon = new THREE.CylinderGeometry(0.025, 0.025, len, 6);
    axon.translate(0, len / 2, 0);
    axon.applyQuaternion(quat);
    axon.translate(dir.x * coreR, dir.y * coreR, dir.z * coreR);
    parts.push({ geometry: axon, weight: 0.3 });

    const tip = coreR + len;
    const node = new THREE.SphereGeometry(0.095, 12, 12);
    node.translate(dir.x * tip, dir.y * tip, dir.z * tip);
    parts.push({ geometry: node, weight: 0.42 });
  });

  return sampleWeighted(parts, n);
}

// ── Scene: pré-computa as 6 geometrias de partículas ──────────────────────────
// Uma shape por serviço de CapabilitiesSection.SERVICES, na mesma ordem —
// activeIndex é o índice do array, então as duas listas precisam ter o
// mesmo tamanho (era a causa do "congelamento" no último serviço: só
// havia 5 shapes para 6 serviços, e shapes[5] ficava undefined).
function Scene({ activeIndex }) {
  const shapes = useMemo(
    () => [
      buildObelisk(N), // 01 Sites Institucionais — monumento/autoridade
      buildFunnel(N), // 02 Landing Pages — funil de conversão
      buildKnot(N), // 03 Sites Experienciais — nó toroidal (assinatura WebGL)
      buildGem(N), // 04 Lojas Virtuais — gema lapidada (vitrine/valor)
      buildReticle(N), // 05 Google Ads — mira de três anéis
      buildNeuralNet(N), // 06 Agentes de IA — rede neural com nós
    ],
    [],
  );

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
