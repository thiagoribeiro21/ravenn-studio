import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three';

const VIOLET = '#7C3AED';

/* ══════════════════════════════════════════════════════════════════════════
   Morph entre os 4 pilares — v2. Por que NÃO são 4 geometrias trocadas.

   Um `TorusKnotGeometry` tem um buraco no meio — em topologia, GÊNERO 1 (uma
   alça). Um icosaedro, um cubo arredondado e um octaedro são todos GÊNERO 0
   (superfície fechada sem alça, deformável até virar uma esfera sem nunca
   precisar "furar" nada). Não existe caminho contínuo de deslocamento de
   vértice que leve de gênero 1 pra gênero 0 — em algum ponto do meio do
   caminho a superfície teria que se auto-intersectar ou rasgar pra fechar o
   buraco. Ou seja: um morph de vértice-a-vértice de verdade entre um
   TorusKnot literal e os outros 3 é matematicamente impossível, não é uma
   limitação de implementação.

   A resolução: os 4 pilares moram na MESMA malha-base (um `IcosahedronGeo-
   metry` de alta subdivisão, ~642 vértices) e cada pilar é uma FUNÇÃO de
   deslocamento de raio aplicada a essa base — não uma geometria própria.
   3 delas são fórmulas matemáticas exatas (superfícies implícitas):

     Pilar 03 Arquitetura — mistura esfera↔cubo via norma L∞
       (max(|x|,|y|,|z|)) — cubo arredondado de verdade, não aproximação.
     Pilar 04 Autoridade  — norma L1 (|x|+|y|+|z|) reproduz um octaedro
       EXATO a partir dos mesmos vértices — não é parecido, é o mesmo sólido.
     Pilar 02 Performance — ruído multi-frequência de baixa amplitude
       ("facetado") + uma ondulação viva contínua enquanto está ativo, pra
       ler como "precisão/vibração" — mais próximo do pedido "wireframe
       distortion" do que um icosaedro estático.
     Pilar 01 Design — a única sem fórmula implícita exata possível (é
       justamente a que TEM o buraco): vira um blob orgânico multi-lobado
       (soma de senos em frequências diferentes) — mantém o espírito
       "escultura orgânica abstrata" do brief, mesmo não sendo literalmente
       um nó de toro.

   Todos os 4 são a MESMA malha, só o raio por vértice muda — por isso dá
   pra fazer `THREE.MathUtils.lerp` vértice-a-vértice de verdade (pedido
   explícito do brief) entre qualquer par deles, inclusive saindo do Pilar 01
   pros outros: o morph nunca precisa saber que "era" um nó de toro, só que
   era uma malha com esses raios específicos.
   ══════════════════════════════════════════════════════════════════════════ */

/* Raio-alvo por pilar, em função da DIREÇÃO do vértice (já normalizada, raio
   1 na base) — não da posição atual. `t` só é usado pelos pilares "vivos"
   (0 e 1), que continuam ondulando mesmo depois de convergir; os outros dois
   são fórmulas estáticas (convergem e ficam paradas, coerente com "estrutura/
   arquitetura" e "polimento premium" serem os conceitos mais "sólidos" dos
   4). */
function pillarRadius(x, y, z, pillarIndex, t) {
  switch (pillarIndex) {
    case 0: {
      // Design — blob orgânico multi-lobado, sem fórmula implícita exata
      // possível (ver nota acima: é o único pilar com "buraco" no conceito
      // original, gênero 1 não alcançável por deslocamento de vértice).
      return (
        1 +
        0.14 * Math.sin(x * 3.2 + y * 2.1 + t * 0.6) * Math.cos(y * 2.6 - z * 3.4 + t * 0.4) +
        0.05 * Math.sin(z * 6 + x * 4 - t * 0.8)
      );
    }
    case 1: {
      // Performance — facetado (padrão fixo) + ondulação viva (só quando
      // ativo, ver `useFrame`) — "distorção dinâmica" de verdade, não um
      // icosaedro parado.
      const facet = Math.sin(x * 9) * Math.sin(y * 9) * Math.sin(z * 9);
      const ripple = Math.sin(x * 5 + y * 5 + z * 5 + t * 2.4);
      return 1 + 0.05 * facet + 0.035 * ripple;
    }
    case 2: {
      // Arquitetura — superfície implícita da norma L∞: o "unit ball" de
      // max(|x|,|y|,|z|)≤1 É um cubo. Misturado 82% com a esfera original
      // pra chanfrar as arestas (cubo puro, 90° exatos, combina mal com
      // realce especular de vidro — lê como plástico, não como vidro).
      const m = Math.max(Math.abs(x), Math.abs(y), Math.abs(z), 1e-4);
      const cube = 1 / m;
      return 1 * 0.18 + cube * 0.82;
    }
    case 3: {
      // Autoridade — superfície implícita da norma L1 (octaedro exato),
      // misturada 92%/8% com a esfera pelo mesmo motivo do cubo (Pilar 03):
      // a aresta 100% pura da norma L1 é uma quina matemática exata — linda
      // em wireframe, mas em `clearcoat` uma quina sem nenhum raio de
      // curvatura concentra o specular numa linha infinitamente fina que ou
      // desaparece ou vira alias, nunca lê como "vidro biselado". 8% de
      // esfera já basta pra dar aos vértices/arestas um raio de curvatura
      // perceptível sem amolecer a leitura de "octaedro" (92% ainda domina
      // a silhueta).
      const l1 = Math.max(Math.abs(x) + Math.abs(y) + Math.abs(z), 1e-4);
      const octa = 1 / l1;
      return 1 * 0.08 + octa * 0.92;
    }
    default:
      return 1;
  }
}

/*
  `<Environment>` do drei, sem `preset`/`files` — deliberado, não esquecido:
  `preset="city"`/`"studio"` busca um HDRI remoto do CDN da pmndrs (algumas
  centenas de KB a poucos MB) toda vez que este componente monta. O projeto
  inteiro evita qualquer asset de rede pra decoração (ver `NOISE_URI` em
  config/_base.js — até o grão de ruído é um data-URI só por causa disso), e
  esse ícone em especial acabou de ganhar todo um trabalho de lazy-loading
  pra não pesar o carregamento inicial da LP (ver o `lazy()` em
  PillarsShaped.jsx) — puxar um HDRI externo jogaria fora metade desse
  ganho. `<Environment>` aceita `children` como cena procedural pra bakear
  um mapa de reflexo LOCAL (`EnvironmentPortal`, ver node_modules/
  @react-three/drei/core/Environment); `frames={1}` bakeia uma vez só e
  para — o glass não precisa refletir uma cena que muda, só precisa ter
  ALGO rico pra refletir (glass sem env map fica achatado/preto morto, que
  é exatamente o "flat e plasticky" reportado).

  v2 — cena procedural mais rica que a v1 (eram só 2 esferas lisas, pouca
  informação de alta frequência pra o clearcoat quebrar em specular). Agora:
  um plano grande e claro simulando um "softbox" de estúdio de produto (o
  truque clássico de fotografia de vidro/joia — uma faixa de luz reta que
  vira um highlight alongado na superfície), mais 3 esferas em posições e
  tamanhos variados pra criar transições de reflexo em vários raios de
  curvatura. `resolution` subiu de 64→128: custo ÚNICO (baked, não por
  frame), compensa em nitidez do reflexo.
*/
function ProceduralEnvironment() {
  return (
    <Environment resolution={128} frames={1}>
      <color attach="background" args={['#050109']} />

      {/* "softbox" — a faixa de luz reta que dá aquele highlight alongado
          clássico de still de produto em vidro/metal escuro. */}
      <mesh position={[2.4, 3.2, 1.5]} rotation={[0, -0.4, 0.15]}>
        <planeGeometry args={[5, 2.2]} />
        <meshBasicMaterial color="#F8F9FA" toneMapped={false} />
      </mesh>

      <mesh position={[3, 2, -2]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color={VIOLET} />
      </mesh>
      <mesh position={[-4, -1, 2]}>
        <sphereGeometry args={[1.6, 16, 16]} />
        <meshBasicMaterial color="#F8F9FA" />
      </mesh>
      <mesh position={[-1.5, -3.5, -1]}>
        <sphereGeometry args={[2.4, 16, 16]} />
        <meshBasicMaterial color="#4C1D95" />
      </mesh>
    </Environment>
  );
}

/* Subdivisão da base (fórmula de esferas geodésicas, 10×4^detail+2).
   Subiu de detail 3 (~642 vértices) pra 4 (~2562): com poucos vértices, o
   `clearcoat` reflete o ambiente rico da v2 (ver `ProceduralEnvironment`)
   em manchas grandes e chapadas — luz de alta frequência (a faixa do
   "softbox") precisa de amostragem geométrica fina pra virar highlight
   contínuo em vez de degrau visível, é a maior causa isolada do "flat e
   plasticky" reportado.

   ~2562 vértices por frame (posição + normal recalculadas no loop do morph,
   ver `useFrame` abaixo) ainda fica ABAIXO do teto de custo que este mesmo
   projeto já aceita em `ThreeServicesCanvas.jsx` (3000 partículas
   recalculadas por frame) — não é um orçamento novo, é o mesmo teto já
   validado alhures. Única ressalva real: diferente de ThreeServicesCanvas,
   este componente também monta no layout MOBILE (`StaticPillars`, canvas
   menor mas mesma malha) — se algum aparelho de entrada real mostrar jank,
   o primeiro dial a girar de volta é este número, não os outros ajustes. */
const ICOSA_DETAIL = 4;

/* Tempo de convergência do morph — pedido do brief é "0.6s". `MORPH_TAU` é a
   constante de tempo de um lerp exponencial (`k = 1 - e^(-dt/tau)`); com
   tau=0.2s, ~95% do caminho já foi percorrido aos 3×tau=0.6s (regra prática
   de decaimento exponencial) — não é o mesmo formato de curva que uma
   easing cúbica do Framer, mas converge no mesmo tempo alvo. */
const MORPH_TAU = 0.2;

/* ── Pulso "liquid metal" da troca de pilar ──────────────────────────────
   O pedido original era trocar geometria via `framer-motion-3d`
   (scale→0 → troca → scale→1 + spin). Aqui não HÁ troca de geometria pra
   animar em torno dela (é a mesma malha o tempo todo, ver nota no topo do
   arquivo) — mas o efeito desejado ("parece metal líquido se reformando")
   é inteiramente reproduzível como um pulso transiente de escala + giro,
   sobreposto ao morph contínuo que já está rodando, sem framer-motion-3d e
   sem tocar na geometria. `PULSE_DURATION` curto e `SCALE_DIP` raso —
   é um acento, não o movimento principal (esse continua sendo o morph). */
const PULSE_DURATION = 0.42;
const SCALE_DIP = 0.12;
const SPIN_KICK = 5.5;

/*
  Objeto principal — a MESMA malha (icosaedro-base) pros 4 pilares; o que
  muda é o raio-alvo por vértice (`pillarRadius`, ver topo do arquivo).
  `MeshPhysicalMaterial` com os parâmetros exatos pedidos, mais dois que o
  brief não especificou mas que `transmission` exige pra não ficar
  invisível: `thickness` (profundidade "óptica" usada no cálculo de
  refração — sem isso, transmission>0 quase não se nota) e `ior` (índice de
  refração; 1.5 é vidro comum).
*/
function ObsidianKnot({ velocityRef, reduceMotion, activeIndex = 0 }) {
  const meshRef = useRef(null);
  const wireRef = useRef(null);
  const lightRef = useRef(null);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  // `lastIdxRef` é o índice que o `useFrame` VIU da última vez — comparado
  // contra `activeIndexRef.current` a cada frame pra detectar o instante
  // exato da troca (React re-renderiza em resposta a `activeIndex` mudar,
  // mas o loop de render roda fora desse ciclo; ler a mudança dentro do
  // próprio `useFrame`, sem `useEffect`, evita um frame de atraso entre "o
  // índice mudou" e "o pulso começou"). `pulsePhaseRef` é 0→1 ao longo de
  // `PULSE_DURATION`; nasce em 1 (sem pulso pendente no mount).
  const lastIdxRef = useRef(activeIndex);
  const pulsePhaseRef = useRef(1);

  // `directions` é a base FIXA (posição original do icosaedro — já é a
  // própria direção, porque o raio de partida é 1). `current` é o buffer
  // que de fato é escrito na geometria a cada frame, mutado in-place (sem
  // alocar um array novo por frame). `wireOpacity` é um número simples (não
  // MotionValue/estado do React) porque só o `useFrame` lê e escreve nele —
  // um ref bastaria, mas como é um valor primitivo mutável entre frames, um
  // objeto-caixa (`{ current: 0 }`) evita recriar o objeto a cada render.
  const { geometry, directions, current, wireOpacityRef } = useMemo(() => {
    /* `IcosahedronGeometry` (via `PolyhedronGeometry`) sai da fábrica NÃO
       INDEXADA — "triangle soup": cada triângulo carrega 3 vértices só
       seus, nenhum compartilhado com o vizinho, mesmo que ocupem a MESMA
       posição no espaço (confirmado lendo `node_modules/three/src/
       geometries/PolyhedronGeometry.js`, comentário "build non-indexed
       geometry"). Isso não dava pra perceber na v1 porque a forma de
       repouso (esfera) tem um atalho: `normalizeNormals()` só normaliza a
       própria posição como normal — funciona de graça NUMA esfera, onde
       normal e direção são a mesma coisa por definição.

       No instante em que os vértices deformam pra qualquer forma que não
       seja esfera, esse atalho não vale mais, e o código já chamava
       `computeVertexNormals()` a cada frame pra corrigir isso — só que sem
       índice, `computeVertexNormals()` (ver node_modules/three/src/core/
       BufferGeometry.js) cai no branch "non-indexed elements (unconnected
       triangle soup)": cada triângulo recebe SÓ a própria normal de face,
       sem média nenhuma com os vizinhos. Resultado: sombreamento
       inteiramente FACETADO — cada triângulo visível como uma faceta dura,
       nunca uma superfície lisa — em vez de morph "feio"/"quebrado" era
       literalmente vidro liso virando bijuteria facetada a cada frame.

       `mergeVertices` (mesmo addon já usado em ThreeServicesCanvas.jsx)
       funde os vértices espacialmente coincidentes num buffer indexado de
       verdade ANTES do primeiro frame — dali em diante `computeVertexNor-
       mals()` cai no branch indexado, que faz a média de normais entre
       todos os triângulos que dividem aquele vértice: sombreamento liso de
       verdade, em qualquer forma. Bônus: o buffer indexado também é MENOR
       (vértices únicos, não 3× por triângulo) — o loop de morph por frame
       processa menos números, não mais. */
    const raw = new THREE.IcosahedronGeometry(1, ICOSA_DETAIL);
    const geo = mergeVertices(raw);
    geo.computeVertexNormals();

    const pos = geo.attributes.position;
    const dirs = new Float32Array(pos.array); // radius=1 na base ⇒ posição já é direção
    const cur = new Float32Array(pos.array);
    return { geometry: geo, directions: dirs, current: cur, wireOpacityRef: { current: 0 } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, dt) => {
    const mesh = meshRef.current;
    const light = lightRef.current;
    if (!mesh || !light) return;

    const cap = Math.min(dt, 0.05); // trava de segurança — tab em background não deveria "explodir" o lerp num único frame gigante
    const t = state.clock.elapsedTime;
    const idx = activeIndexRef.current;

    // ── Pulso de troca — dispara no INSTANTE em que `idx` muda ──────────────
    if (idx !== lastIdxRef.current) {
      lastIdxRef.current = idx;
      if (!reduceMotion) pulsePhaseRef.current = 0;
    }
    // `Math.sin(phase·π)`: 0 no início, pico em phase=0.5, 0 de volta em
    // phase=1 — um envelope liso de ida-e-volta com UMA linha, sem precisar
    // de duas animações encadeadas (scale-down então scale-up) nem de spring
    // externa. Já cravado em 0 fora da janela (phase≥1), então não precisa
    // de guarda extra depois de convergir.
    pulsePhaseRef.current = Math.min(1, pulsePhaseRef.current + cap / PULSE_DURATION);
    const pulse = Math.sin(Math.min(pulsePhaseRef.current, 1) * Math.PI);

    // ── Morph vértice-a-vértice ────────────────────────────────────────────
    // `reduceMotion`: converge instantâneo (k=1), sem transição animada —
    // mesmo princípio já aplicado ao giro/velocidade abaixo, consistente
    // com o resto do arquivo.
    const k = reduceMotion ? 1 : 1 - Math.exp(-cap / MORPH_TAU);
    const posAttr = mesh.geometry.attributes.position;

    for (let i = 0; i < directions.length; i += 3) {
      const dx = directions[i];
      const dy = directions[i + 1];
      const dz = directions[i + 2];
      const targetR = pillarRadius(dx, dy, dz, idx, t);

      current[i] = THREE.MathUtils.lerp(current[i], dx * targetR, k);
      current[i + 1] = THREE.MathUtils.lerp(current[i + 1], dy * targetR, k);
      current[i + 2] = THREE.MathUtils.lerp(current[i + 2], dz * targetR, k);
    }

    posAttr.array.set(current);
    posAttr.needsUpdate = true;
    mesh.geometry.computeVertexNormals(); // normais precisam refletir a forma NOVA a cada frame, senão o clearcoat ilumina errado

    // ── Overlay de wireframe do Pilar 02 (Performance) ─────────────────────
    // Mesma malha, `wireframe:true` — não é uma segunda geometria, é a
    // MESMA referência (`geometry`), então herda o morph automaticamente
    // sem custo extra. Só a opacidade reage a qual pilar está ativo.
    // 0.4→0.26: no material mais reflexivo desta rodada (metalness 1,
    // roughness 0.05) o contorno de wireframe ficava forte demais por cima
    // do specular mais aceso — lia como "malha exposta", não como acento.
    const wireTarget = idx === 1 ? 0.26 : 0;
    wireOpacityRef.current = THREE.MathUtils.lerp(wireOpacityRef.current, wireTarget, k);
    if (wireRef.current) wireRef.current.material.opacity = wireOpacityRef.current;

    // Giro base contínuo + boost proporcional à VELOCIDADE do scroll (não à
    // posição) — `useVelocity` no componente React já faz essa derivada;
    // aqui só se lê o último valor publicado (`velocityRef.current`, um
    // ref simples, sem re-render) e se converte em radianos/segundo extra.
    // `pulse * SPIN_KICK` soma um giro extra que só existe durante a janela
    // do pulso — é o "spin rápido" da troca, sobreposto ao giro contínuo em
    // vez de substituí-lo (o objeto nunca para de girar, só acelera).
    const idle = reduceMotion ? 0 : 0.12;
    const boost = Math.min(Math.abs(velocityRef.current) * 0.9, 2.2);
    mesh.rotation.y += (idle + boost + pulse * SPIN_KICK) * cap;
    mesh.rotation.x += idle * 0.5 * cap;

    // Escala respira pra dentro e volta durante o pulso — "reforma líquida"
    // em cima do morph, que continua rodando por baixo (a forma NOVA já
    // está convergindo enquanto o objeto "encolhe"; quando a escala volta a
    // 1 a forma já avançou visivelmente, reforçando a leitura de metal se
    // recompondo, não só um zoom vazio). `mesh` e `wireRef` são dois meshes
    // IRMÃOS (mesma geometria, materiais diferentes) — sem um pai comum pra
    // herdar a escala, então os dois recebem o mesmo `s` explicitamente,
    // senão o contorno de wireframe descolaria do sólido durante o pulso.
    const s = 1 - SCALE_DIP * pulse;
    mesh.scale.setScalar(s);
    if (wireRef.current) wireRef.current.scale.setScalar(s * 1.008);

    // Luz violeta orbitando devagar — não amarrada ao scroll, um movimento
    // de "vitrine" contínuo e independente, pra sempre ter alguma face
    // pegando reflexo por especular direto (além do env map de fundo).
    light.position.set(Math.cos(t * 0.35) * 2.6, Math.sin(t * 0.5) * 1.4, Math.sin(t * 0.35) * 2.6);
  });

  return (
    <>
      <ambientLight intensity={0.12} />
      {/* rim light neutro, fixo — dá uma borda de luz fria constante pro
          objeto nunca desaparecer totalmente contra o fundo preto entre um
          passe e outro da luz violeta. */}
      <pointLight position={[-2.5, 1.5, -2]} intensity={8} color="#F8F9FA" distance={9} decay={2} />
      <pointLight ref={lightRef} intensity={14} color={VIOLET} distance={8} decay={2} />

      {/* `frustumCulled={false}`: o raio máximo entre as 4 formas varia
          (ex.: cantos do cubo chegam a ~1.2), e recalcular
          `computeBoundingSphere()` a cada frame só pra manter o culling
          correto custaria mais do que simplesmente nunca cular um objeto
          pequeno que já sabemos estar sempre em quadro. */}
      {/* Material — metalness/roughness/clearcoatRoughness subiram pro teto
          pedido (1 / 0.05 / 0.1: reflexo mais nítido e especular mais
          fechado, "vidro polido" em vez de "plástico fosco"). `transmission`/
          `thickness`/`ior` continuam — são o que faz o objeto ler como VIDRO
          (translúcido) em vez de metal cromado opaco; zerar transmission
          bateria a meta de "metal" mas perderia o "Obsidian GLASS" do
          pedido. `envMapIntensity` subiu de 1.4→1.7 pra aproveitar o
          ambiente procedural mais rico (ver `ProceduralEnvironment`). */}
      <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
        <meshPhysicalMaterial
          color="#000000"
          metalness={1}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.9}
          thickness={1.2}
          ior={1.5}
          envMapIntensity={1.7}
        />
      </mesh>

      {/* `scale` não é mais estático — `useFrame` escreve nele todo frame
          (junto com `mesh.scale`) pra acompanhar o pulso de transição, ver
          nota acima da chamada a `setScalar`. O valor aqui é só o estado
          inicial antes do primeiro frame rodar. */}
      <mesh ref={wireRef} geometry={geometry} frustumCulled={false} scale={1.008}>
        <meshBasicMaterial color={VIOLET} wireframe transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

/* `className` deliberadamente NÃO vai pro `<Canvas>` — CTACanvas.jsx e
   ThreeServicesCanvas.jsx (os dois outros r3f deste projeto) só usam
   `style={{ width:'100%', height:'100%' }}` pra preencher o pai, nunca
   className; ir atrás de um caminho de repasse de prop não testado neste
   codebase quando o padrão já provado resolve a mesma coisa não valeria o
   risco. Quem dimensiona é sempre o wrapper de fora (aqui, o `<div
   className="h-64 w-64 ...">` em PillarsShaped.jsx).

   `onContextLost` — navegadores derrubam o contexto WebGL sob pressão de
   memória/GPU (troca de app em background no mobile, muitas abas, driver
   instável) e por padrão o R3F não avisa ninguém: o `<canvas>` simplesmente
   fica preto e morto, sem erro no console, sem re-render — exatamente a
   assinatura de "o ícone não aparece" relatada num dispositivo real. O R3F
   já escuta `webglcontextlost` internamente (pausa o loop de render), mas
   quem decide o que fazer DEPOIS disso é a aplicação — aqui, avisamos
   `PillarsShaped.jsx` pra trocar a cena inteira pelo fallback em CSS em vez
   de deixar um retângulo preto no lugar do "ícone". */
export default function PillarsCanvas({ velocityRef, reduceMotion = false, activeIndex = 0, onContextLost }) {
  const stableVelocityRef = useMemo(() => velocityRef ?? { current: 0 }, [velocityRef]);

  return (
    <Canvas
      camera={{ position: [0, 0, 3.1], fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <ProceduralEnvironment />
      <ObsidianKnot velocityRef={stableVelocityRef} reduceMotion={reduceMotion} activeIndex={activeIndex} />
    </Canvas>
  );
}
