/*
  Mídia recortada em formas geométricas (Ato 6 — linha de mídias variadas
  do "padrão Ravenn"): circle | stadium. `video` toca em loop mudo se
  `src` for um mp4; caso contrário renderiza `poster`/imagem estática.
*/
export default function ShapedMedia({ shape = 'circle', src, poster, video = false, className = '' }) {
  const shapeClass = shape === 'stadium' ? 'aspect-[3/1] rounded-full' : 'aspect-square rounded-full';

  return (
    <div className={`overflow-hidden border border-white/10 ${shapeClass} ${className}`}>
      {video ? (
        <video
          src={src}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          className="h-full w-full object-cover"
        />
      ) : (
        <img src={src} alt="" aria-hidden loading="lazy" decoding="async" className="h-full w-full object-cover" />
      )}
    </div>
  );
}
