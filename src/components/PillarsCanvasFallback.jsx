/* Fallback sem WebGL — conexão lenta, `saveData`, navegador sem suporte a
   WebGL (comum em webviews de anúncio do Instagram/Facebook/TikTok) ou perda
   de contexto em runtime. Mesma silhueta do objeto real (halo violeta),
   zero custo de GPU/Three.js.

   Deliberadamente num arquivo PRÓPRIO, separado de PillarsCanvas.jsx: esse
   outro arquivo importa `@react-three/fiber` + `@react-three/drei` + `three`
   no topo — importar QUALQUER coisa dele (mesmo só este componente) carrega
   o módulo inteiro, e com ele os ~815KB (219KB gzip) de Three.js. Este
   arquivo é importado de forma ESTÁTICA por PillarsShaped.jsx (precisa
   pintar instantaneamente, sem esperar o import dinâmico do Canvas real);
   ficar num arquivo isolado garante que essa importação nunca puxa Three.js
   de carona — ver a nota de performance em PillarsShaped.jsx. */
export function PillarsCanvasFallback({ className = '' }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div
        aria-hidden
        className="h-24 w-24 rounded-full opacity-70"
        style={{
          background: 'radial-gradient(circle at 35% 30%, rgba(167,139,250,0.9), rgba(124,58,237,0.25) 55%, transparent 75%)',
          filter: 'blur(1px)',
        }}
      />
    </div>
  );
}
