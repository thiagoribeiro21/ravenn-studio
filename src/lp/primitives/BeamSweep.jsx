/*
  Imagem de fundo do bento + camada de gradiente borrado animado por cima
  (.rv-beam, em index.css) — dá movimento vivo à célula sem competir com o
  mockup HTML em primeiro plano. `delay` escalonado por célula (0/1.2/2.4/
  3.6s) evita que as 4 sincronizem e pareçam template.
*/
export default function BeamSweep({ src, delay = 0, opacity = 0.55 }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ opacity: opacity * 0.6 }} />
      {/* desligado no mobile por orçamento de GPU — só a imagem estática acima permanece */}
      <div
        className="rv-beam hidden md:block"
        style={{ '--rv-beam-delay': `${delay}s`, backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity }}
      />
      <div className="absolute inset-0 bg-rv-void/55" />
    </div>
  );
}
