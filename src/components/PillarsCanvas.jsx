import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';

const VIOLET = '#7C3AED';

/* ══════════════════════════════════════════════════════════════════════════
   v4 — mesma geometria estática do v3 (torusKnotGeometry, sem morph), mas
   com a iluminação reconstruída. O v3 tirou o `<Environment>` do drei
   inteiro (achando que 2 point lights bastariam) — na prática, um material
   com `metalness` alto + `clearcoat` é ESPECULAR quase puro: sem um mapa de
   ambiente pra refletir, a superfície só mostra os 2-3 pixels onde a luz
   pontual bate direto, e o resto do nó (a maior parte da superfície, em
   qualquer ângulo de câmera) fica sem NENHUMA luz retornando pro olho — daí
   o "buraco negro achatado" reportado. Metal/clearcoat sem env map não é
   "menos brilhante", é estruturalmente quase invisível.

   A correção certa não é aumentar a intensidade das luzes diretas (isso só
   alarga um pouco os 2-3 pixels) — é dar ao material um AMBIENTE pra
   refletir. `<Environment>` + `<Lightformer>` do drei fazem exatamente isso
   offline: são planos emissivos bakeados uma vez num cubemap local (zero
   requisição de rede, ver nota em `ProceduralEnvironment` abaixo) — o
   material passa a refletir uma "sala" de painéis de luz em vez de reflectir
   o nada.
   ══════════════════════════════════════════════════════════════════════════ */

/*
  `<Environment>` sem `preset`/`files` — deliberado: `preset="city"/"studio"`
  baixaria um HDRI do CDN da pmndrs (centenas de KB a poucos MB) toda vez que
  a seção monta, e este ícone já passou por todo um trabalho de lazy-loading
  pra não pesar o carregamento inicial da LP (ver `lazy()` em
  PillarsShaped.jsx) — um HDRI externo jogaria fora esse ganho. Em vez disso,
  `<Environment>` bakeia os `children` (aqui, 3 `<Lightformer>`) num cubemap
  LOCAL uma vez só (`resolution={64}`, sem prop `frames` — drei já bakeia
  uma vez por padrão quando o conteúdo é estático) e para: o material não
  precisa refletir uma cena que muda, só precisa ter ALGO rico pra refletir.

  3 painéis, não 1: um único Lightformer dá UM highlight — a leitura de
  "estúdio" vem de várias fontes em ângulos diferentes se misturando na
  curva do nó conforme ele gira (a mesma lógica de um estúdio de still de
  produto de verdade: key + fill + accent, nunca uma luz só).
    1. Retângulo branco grande, de cima — o "softbox" principal, luz de
       preenchimento neutra que dá volume geral à forma.
    2. Retângulo violeta, lateral — o acento de cor da marca refletido na
       curva, ecoando a luz pontual violeta que já existe na cena.
    3. Retângulo branco menor, de baixo — luz de contorno inferior, evita
       que a parte de baixo do nó vire uma silhueta sem detalhe nenhum.
*/
function ProceduralEnvironment() {
  return (
    <Environment resolution={64}>
      <Lightformer form="rect" color="#F8F9FA" intensity={4} position={[0, 4, 2]} rotation={[-Math.PI / 3, 0, 0]} scale={[6, 3, 1]} />
      <Lightformer form="rect" color={VIOLET} intensity={6} position={[-4, 0.5, 1.5]} rotation={[0, Math.PI / 2.4, 0]} scale={[5, 4, 1]} />
      <Lightformer form="rect" color="#F8F9FA" intensity={2} position={[2, -3, -1]} rotation={[Math.PI / 2.5, 0, 0]} scale={[4, 2, 1]} />
    </Environment>
  );
}

/*
  Objeto principal — `torusKnotGeometry` nativo do R3F (via elemento JSX
  minúsculo, não `new THREE.TorusKnotGeometry` importado à mão). `args={[1,
  0.3, 128, 32]}` — segmentos altos o bastante pra superfície ficar lisa em
  close-up sem precisar de `mergeVertices`/normais recalculadas por frame (o
  nó não deforma, então as normais de fábrica já são as definitivas — zero
  trabalho de geometria no `useFrame`).
*/
function ObsidianKnot({ velocityRef, reduceMotion }) {
  const meshRef = useRef(null);
  const lightRef = useRef(null);

  useFrame((state, dt) => {
    const mesh = meshRef.current;
    const light = lightRef.current;
    if (!mesh || !light) return;

    const cap = Math.min(dt, 0.05); // trava de segurança — tab em background não deveria "explodir" a rotação num único frame gigante
    const t = state.clock.elapsedTime;

    // Giro base contínuo + boost proporcional à VELOCIDADE do scroll (não à
    // posição) — `useVelocity` no componente React já faz essa derivada;
    // aqui só se lê o último valor publicado (`velocityRef.current`, um ref
    // simples, sem re-render) e se converte em radianos/segundo extra.
    // `reduceMotion` mata o giro ocioso, mas deixa o boost de scroll vivo —
    // rotação amarrada ao gesto do usuário não é o tipo de movimento que
    // `prefers-reduced-motion` pede pra evitar (o que se evita é movimento
    // AUTÔNOMO, contínuo, sem input).
    const idle = reduceMotion ? 0 : 0.12;
    const boost = Math.min(Math.abs(velocityRef.current) * 0.9, 2.2);
    mesh.rotation.y += (idle + boost) * cap;
    mesh.rotation.x += idle * 0.5 * cap;

    // Luz violeta (key light) orbitando devagar — não amarrada ao scroll,
    // um movimento de "vitrine" contínuo e independente, pra sempre ter
    // alguma face do nó pegando reflexo especular DIRETO conforme ele gira,
    // além do reflexo indireto que os Lightformers já garantem o tempo todo.
    light.position.set(Math.cos(t * 0.35) * 2.6, Math.sin(t * 0.5) * 1.4, Math.sin(t * 0.35) * 2.6);
  });

  return (
    <>
      <ambientLight intensity={0.12} />

      {/* Rim light — virou `directionalLight` (era `pointLight`): luz
          direcional simula raios paralelos vindos de um lado, então a borda
          do nó fica consistentemente contornada de luz fria não importa a
          distância câmera-objeto (point light tem falloff por distância,
          directional não) — é o que faz a silhueta nunca se perder contra o
          `#03000A` de fundo, mesmo nas faces que a luz violeta não alcança. */}
      <directionalLight position={[-4, 2, -3]} intensity={1.4} color="#F8F9FA" />

      {/* Key light violeta — point light de alta intensidade, é a luz
          "assinatura" da marca refletindo na curva do nó. */}
      <pointLight ref={lightRef} intensity={22} color={VIOLET} distance={10} decay={2} />

      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshPhysicalMaterial color="#000000" metalness={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.1} />
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
   fica preto e morto, sem erro no console, sem re-render. O R3F já escuta
   `webglcontextlost` internamente (pausa o loop de render), mas quem decide
   o que fazer DEPOIS disso é a aplicação — aqui, avisamos
   `PillarsShaped.jsx` pra trocar a cena inteira pelo fallback em CSS em vez
   de deixar um retângulo preto no lugar do "ícone". Isto (e o `lazy()` que
   PillarsShaped.jsx usa pra importar este módulo, e a detecção de suporte a
   WebGL em config/_base.js) continuam intactos, não fazem parte deste
   ajuste de luz. */
export default function PillarsCanvas({ velocityRef, reduceMotion = false, onContextLost }) {
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
      <ObsidianKnot velocityRef={stableVelocityRef} reduceMotion={reduceMotion} />
    </Canvas>
  );
}
