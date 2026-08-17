import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleMorpher, sampleShape } from './ThreeServicesCanvas';

/* ══════════════════════════════════════════════════════════════════════════
   v5 — volta a ser Three.js, mas reaproveitando a MESMA física de partículas
   morfando do ThreeServicesCanvas.jsx da home (`ParticleMorpher`, exportado
   de lá pra cá em vez de duplicado — ver a nota no próprio arquivo).

   ── Por que voltou (era Canvas2D na v4) ─────────────────────────────────────
   Pedido explícito: os MESMOS ícones/morphing da home, mantendo PageSpeed
   alto. A home já prova que os dois não são contraditórios — o segredo não é
   evitar Three.js, é NUNCA deixar o chunk (815KB/219KB gzip) entrar no
   caminho crítico de carregamento:
     1. `lazy()` em PillarsShaped.jsx — o `import()` só dispara quando este
        componente de fato monta.
     2. Só monta quando a seção está a 240px da viewport (`canvasInView`).
     3. Só tenta se o navegador tem WebGL de verdade (`hasWebGL()`) e a
        conexão não é lenta (`isSlowConnection()`) — os dois checados ANTES
        do `import()`, então um navegador sem WebGL nunca paga o download.
     4. Fallback em CSS/Canvas2D (`PillarsMorphIcon.jsx`) cobre os casos 3
        falhos e a janela do próprio carregamento do chunk via `Suspense`.
   Nenhum desses 4 pontos mudou — só o CONTEÚDO do componente lazy voltou a
   ser WebGL de verdade.

   ── Por que morfa agora (a v3 original não morfava) ─────────────────────────
   A v3 (removida) era um nó estático (torusKnot) que recebia `activeIndex`
   sem nunca ler — os 4 pilares acendiam na lista ao lado, o ícone não
   reagia. Agora usa 4 formas reais, uma por pilar, com a MESMA física de
   lerp+mola+repulsão de mouse da home.

   ── Por que não corta mais (a v3 cortava nas 4 bordas) ──────────────────────
   Câmera mais recuada (`z=4.2`, era `z=3.1`) + `fov` menor (`38`, era `42`)
   + formas desenhadas num raio menor (~1.1, ver `RADIUS` abaixo) somam uma
   margem real entre o objeto e a borda do frame em qualquer ângulo de
   rotação — a v3 enchia o frame de ponta a ponta sem nenhuma folga.
   ══════════════════════════════════════════════════════════════════════════ */

// Bem menos partículas que a home (3000): este ícone renderiza a ~320px,
// não numa cena hero de tela cheia — a esta escala 900 partículas já lê
// como uma nuvem sólida, e o custo por frame cai proporcionalmente.
const N_PILLARS = 900;
// Mobile (v6): metade das partículas. GPU de celular processa cada frame
// no mesmo chip que faz tudo mais (scroll, decode de imagem, o resto da
// página) — sem essa redução o ícone real competia por esse orçamento
// bem mais apertado do que um desktop tem. 450 na mesma escala (~220px)
// ainda lê como nuvem sólida, só perde densidade nas bordas da forma.
const N_PILLARS_MOBILE = 450;
const RADIUS = 1.05;

/* 4 formas abstratas — mesmo espírito de "geometria pura, não ícone literal"
   que a home usa (torre/funil/nó/disco/dardo/esfera pra 6 serviços): aqui
   `pillars.labels` muda de sentido entre as 6 LPs (aqui "Treinado no seu
   negócio", em landing-pages.js "Copy AIDA" etc.) — não existe uma forma
   literal única que sirva pra todas, então a família de 4 formas é
   deliberadamente genérica: esfera (núcleo/base) → cubo (estrutura) → toro
   (conexão/ciclo) → nó (sofisticação).

   Cubo, não octaedro (testado e trocado): com só 900 partículas esparsas
   num frame de ~220px, um octaedro (8 faces triangulares) lia perto demais
   de esfera — os dois são topologicamente "quase redondos" nessa densidade,
   e o morph entre eles não se sentia. Um cubo tem cantos e arestas retas
   que nenhuma rotação disfarça, mesmo com poucas partículas — a distinção
   de silhueta é o que faz o morphing LER como morphing. */
function buildShapes(count) {
  const cubeSide = RADIUS * 1.5;
  return [
    sampleShape(new THREE.SphereGeometry(RADIUS, 32, 32), count),
    sampleShape(new THREE.BoxGeometry(cubeSide, cubeSide, cubeSide), count),
    sampleShape(new THREE.TorusGeometry(RADIUS * 0.78, RADIUS * 0.32, 24, 48), count),
    sampleShape(new THREE.TorusKnotGeometry(RADIUS * 0.6, RADIUS * 0.2, 160, 24), count),
  ];
}

function Scene({ activeIndex, count }) {
  const shapes = useMemo(() => buildShapes(count), [count]);
  return <ParticleMorpher shapes={shapes} activeIndex={activeIndex} />;
}

/* `onContextLost` — mesma razão de sempre: navegadores derrubam o contexto
   WebGL sob pressão de memória/GPU e por padrão ninguém é avisado, o
   `<canvas>` só fica preto e morto. Avisa `PillarsShaped.jsx` pra trocar
   pelo fallback em vez de deixar um retângulo morto no lugar do ícone.

   `mobile` (v6) — três ajustes, mesma ideia em cada um: gastar menos por
   frame num chip que tem menos orçamento pra dar.
     · partículas: 900 → 450 (`N_PILLARS_MOBILE`, ver constante acima).
     · `dpr` travado em 1 (era `[1, 1.5]`): 1.5x em telas de alta densidade
       significa mais que o DOBRO de pixels reais pra rasterizar por
       frame — o ganho visual num ícone de ~220px não paga esse custo em
       mobile.
     · `antialias: false` + `powerPreference: 'low-power'`: MSAA custa
       amostragem extra por pixel: e "low-power" pede ao driver a GPU
       integrada/modo eficiente em vez do modo que maximiza desempenho à
       custa de bateria — no desktop o objetivo inverso (`high-performance`)
       segue valendo. */
export default function PillarsCanvas({ activeIndex = 0, mobile = false, onContextLost }) {
  const count = mobile ? N_PILLARS_MOBILE : N_PILLARS;
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 38 }}
      gl={{
        alpha: true,
        antialias: !mobile,
        powerPreference: mobile ? 'low-power' : 'high-performance',
      }}
      dpr={mobile ? 1 : [1, 1.5]}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <Scene activeIndex={activeIndex} count={count} />
    </Canvas>
  );
}
