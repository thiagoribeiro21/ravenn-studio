/*
  Contorno de device em CSS puro — sem imagem/SVG de moldura. `type`:
  'phone' | 'macbook' | 'tablet' | 'dual' (macbook + phone sobrepostos,
  usado no Hero desta LP porque o argumento da página é "funciona e parece
  caro nos dois"). O conteúdo da tela é a mesma imagem (`screenSrc`) nos
  dois devices do `dual` — é um frame extraído de um vídeo de portfólio,
  não um asset dedicado por device.
*/

function Screen({ src, radius = 10 }) {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: radius }}>
      <img src={src} alt="" aria-hidden loading="lazy" decoding="async" className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/[0.04]" />
    </div>
  );
}

function Phone({ screenSrc, className = '', style }) {
  return (
    <div
      className={`relative aspect-[9/19.3] w-[13rem] rounded-[2.2rem] border border-white/10 bg-rv-surface-2 p-[7px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.75)] md:w-[15rem] ${className}`}
      style={style}
    >
      <span aria-hidden className="absolute left-1/2 top-[7px] z-10 h-[6px] w-14 -translate-x-1/2 rounded-full bg-black/70" />
      <Screen src={screenSrc} radius={28} />
    </div>
  );
}

function Macbook({ screenSrc, className = '', style }) {
  return (
    <div className={`relative w-full max-w-[42rem] ${className}`} style={style}>
      <div className="aspect-[16/10] w-full rounded-t-xl border border-white/10 bg-rv-surface-2 p-[3%] shadow-[0_40px_90px_-24px_rgba(0,0,0,0.8)]">
        <Screen src={screenSrc} radius={4} />
      </div>
      <div className="mx-auto h-3 w-full rounded-b-xl bg-gradient-to-b from-[#141018] to-[#0a0710] md:h-4" />
      <div aria-hidden className="mx-auto -mt-[2px] h-1 w-24 rounded-b-md bg-black/60" />
    </div>
  );
}

function Tablet({ screenSrc, className = '', style }) {
  return (
    <div
      className={`relative aspect-[3/4] w-64 rounded-2xl border border-white/10 bg-rv-surface-2 p-3 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.75)] md:w-72 ${className}`}
      style={style}
    >
      <Screen src={screenSrc} radius={10} />
    </div>
  );
}

export default function DeviceFrame({ type = 'macbook', screenSrc, tilt = 0, className = '' }) {
  const rotate = { transform: `rotate(${tilt}deg)` };

  if (type === 'phone') return <Phone screenSrc={screenSrc} className={className} style={rotate} />;
  if (type === 'tablet') return <Tablet screenSrc={screenSrc} className={className} style={rotate} />;

  if (type === 'dual') {
    return (
      <div className={`relative ${className}`}>
        <Macbook screenSrc={screenSrc} style={rotate} />
        <Phone
          screenSrc={screenSrc}
          className="absolute -bottom-10 -right-6 w-28 md:-bottom-14 md:-right-10 md:w-36"
          style={{ transform: `rotate(${tilt * 0.6 + 6}deg)` }}
        />
      </div>
    );
  }

  return <Macbook screenSrc={screenSrc} className={className} style={rotate} />;
}
