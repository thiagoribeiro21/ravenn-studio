import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const VIOLET = '#7C3AED';

/* ══════════════════════════════════════════════════════════════════════════
   v3 — revertido pro TorusKnot original, sem morph vértice-a-vértice entre
   pilares. A v2 (morph pra 4 formas na mesma malha-base, ver histórico do
   arquivo) foi removida por pedido explícito: as formas derivadas (blob,
   facetado, cubo, octaedro) liam como "flat/plasticky" perto do nó de toro
   original, que já tinha a superfície orgânica de alta curvatura que faz o
   `clearcoat`/`transmission` de vidro escuro funcionar bem sem precisar de
   ambiente rico pra refletir.

   Volta a ser: uma malha ÚNICA, estática (`torusKnotGeometry`), rotação
   contínua + boost proporcional à velocidade do scroll — nenhuma
   deformação, nenhum estado de "pilar ativo" influenciando a geometria. Os
   4 pilares da seção continuam trocando de destaque no TEXTO (`PillarRow`
   em PillarsShaped.jsx, não mexido aqui); o objeto 3D volta a ser puro
   ornamento giratório, não um indicador visual de qual pilar está ativo.

   Sem `<Environment>` do drei — não por regressão de performance (o
   trabalho de lazy-load e detecção de WebGL feito antes deste revert
   continua intacto, ver PillarsShaped.jsx), mas porque a v1 nunca teve um
   env map: as duas point lights (rim neutro + violeta) já bastam pra fazer
   o clearcoat/metal pegar highlight direto conforme o nó gira — é
   exatamente o "reflections" que o pedido de revert descreve.
   ══════════════════════════════════════════════════════════════════════════ */

/*
  Objeto principal — `torusKnotGeometry` nativo do R3F (via elemento JSX
  minúsculo, não `new THREE.TorusKnotGeometry` importado à mão: R3F já
  registra todas as geometrias/materiais do Three como tags, e usar a tag
  evita reimportar `three` só pra isso). `args={[1, 0.3, 128, 32]}` — raio,
  raio do tubo, segmentos radiais e tubulares altos o bastante pra a
  superfície ficar lisa em close-up sem precisar de `mergeVertices`/normais
  recalculadas por frame (o nó não deforma, então as normais de fábrica já
  são as definitivas — zero trabalho de geometria no `useFrame`).
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

    // Luz violeta orbitando devagar — não amarrada ao scroll, um movimento
    // de "vitrine" contínuo e independente, pra sempre ter alguma face do
    // nó pegando reflexo especular direto conforme ele gira.
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

      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshPhysicalMaterial
          color="#000000"
          metalness={1}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.9}
          thickness={1.2}
          ior={1.5}
        />
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
   WebGL em config/_base.js) não faz parte do revert — continuam intactos. */
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
      <ObsidianKnot velocityRef={stableVelocityRef} reduceMotion={reduceMotion} />
    </Canvas>
  );
}
