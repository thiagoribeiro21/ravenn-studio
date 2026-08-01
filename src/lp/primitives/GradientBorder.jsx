/*
  Borda cônica animada percorrendo o perímetro — implementada via CSS puro
  em src/index.css (.rv-bento-border, @property --rv-angle). Este
  componente só é o wrapper que aplica a classe e garante overflow:hidden
  + border-radius consistentes; ver index.css pra lógica de animação e o
  guard de prefers-reduced-motion (trava em 45deg estático).

  `slow`: usa a variante de 40s (`.rv-border-slow`) em vez dos 4s padrão —
  pro CTA final, onde a borda precisa ser "estática ou girando muito lento,
  nada de piscar" (item 10 do brief v3).
*/
export default function GradientBorder({ children, radius = 20, slow = false, className = '' }) {
  return (
    <div
      className={`rv-bento-border ${slow ? 'rv-border-slow' : ''} overflow-hidden ${className}`}
      style={{ borderRadius: radius }}
    >
      {children}
    </div>
  );
}
