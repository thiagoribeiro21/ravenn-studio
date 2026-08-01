import { NOISE_URI } from '../config/_base';

/*
  Gradiente-assinatura da marca (Regra transversal 2 do brief v3) — massa de
  luz ampla e suave, não um glow pequeno atrás de título. 3 camadas radiais
  sobrepostas, cada uma com seu próprio período de deriva (18s/26s/31s,
  primos entre si — nunca sincronizam, parece respiração). Grain SVG por
  cima em opacity baixa + mix-blend-overlay é obrigatório: sem ele,
  gradiente amplo em tela escura banda visivelmente.

  100% CSS — nenhum canvas, nenhum RAF. Diferente do ParticleField (que
  também é um "efeito de fundo", mas orientado a partícula/mouse); a Aurora
  é só camadas de gradiente com animação de transform.
*/
const RECIPES = {
  hero: [
    'radial-gradient(ellipse 80% 60% at 70% 40%, rgba(124,58,237,.45), transparent 60%)',
    'radial-gradient(ellipse 60% 50% at 35% 65%, rgba(67,56,202,.35), transparent 65%)',
    'radial-gradient(ellipse 90% 70% at 50% 100%, rgba(139,92,246,.25), transparent 70%)',
  ],
  cta: [
    'radial-gradient(ellipse 75% 65% at 85% 45%, rgba(124,58,237,.5), transparent 60%)',
    'radial-gradient(ellipse 55% 55% at 70% 80%, rgba(67,56,202,.36), transparent 65%)',
    'radial-gradient(ellipse 70% 60% at 100% 30%, rgba(139,92,246,.28), transparent 70%)',
  ],
  subtle: [
    'radial-gradient(ellipse 80% 60% at 70% 40%, rgba(124,58,237,.22), transparent 60%)',
    'radial-gradient(ellipse 60% 50% at 35% 65%, rgba(67,56,202,.16), transparent 65%)',
    'radial-gradient(ellipse 90% 70% at 50% 100%, rgba(139,92,246,.12), transparent 70%)',
  ],
};

export default function Aurora({ variant = 'hero', className = '' }) {
  const layers = RECIPES[variant] || RECIPES.hero;
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="rv-aurora-a absolute inset-0" style={{ background: layers[0] }} />
      <div className="rv-aurora-b absolute inset-0" style={{ background: layers[1] }} />
      <div className="rv-aurora-c absolute inset-0" style={{ background: layers[2] }} />
      {/* antibanding — obrigatório em gradiente amplo sobre fundo escuro */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{ backgroundImage: NOISE_URI, backgroundRepeat: 'repeat' }}
      />
    </div>
  );
}
