import { buildWaLink } from './_base';

/* ══════════════════════════════════════════════════════════════════════
   Conteúdo da LP /sites-imersivos — terceiro clone do molde de
   sites-institucionais.js. Serviço: Sites Experienciais e Imersivos
   (WebGL/Three.js, motion cinematográfico). Conversão única via
   WhatsApp, mesmo padrão das demais LPs desta família.

   ── Assets ────────────────────────────────────────────────────────────
   Hero, CTA final e os fundos de "Como Funciona"/FAQ reaproveitam os
   arquivos de sites-institucionais.js. Os 3 conceitos de portfólio, ao
   contrário das outras LPs, não são fictícios — são o PRÓPRIO site da
   Ravenn (hero cinematográfico, objeto 3D, vitrine de portfólio): a
   prova mais direta possível pra este serviço específico. Continuam
   como placeholder até a gravação real em `/placeholder-sites-imersivos/`.
   ══════════════════════════════════════════════════════════════════════ */

const LOGO_H = '/logo-ravenn/logo-ravenn-studio-horizontal.webp';
const PH = '/placeholder-sites-imersivos';

export default {
  meta: {
    logo: LOGO_H,
  },

  nav: {
    links: [
      { label: 'Serviços', href: '#bento' },
      { label: 'Conceitos', href: '#conceitos' },
      { label: 'Contato', href: '#finale' },
    ],
  },

  whatsapp: {
    message: buildWaLink(
      'Olá! Vim pela página de sites imersivos e gostaria de agendar um diagnóstico gratuito.',
    ),
  },

  hero: {
    eyebrow: 'Sites experienciais e imersivos — WebGL & Motion',
    headlineLines: ['Seu concorrente tem um site.', '_Você precisa de uma experiência._'],
    subheadline:
      'Cenas 3D que reagem ao scroll, transições cinematográficas e navegação que não parece um site — para marcas que não podem se dar ao luxo de parecer comuns.',
    deviceImages: {
      desktop: '/lp-institucional/hero-device.webp',
      mobile: '/lp-institucional/hero-device-mobile.webp',
    },
    ctaPrimary: {
      label: 'Solicitar diagnóstico gratuito',
      href: buildWaLink('Olá! Vi a página de sites imersivos da Ravenn e quero o diagnóstico gratuito.'),
    },
    ctaSecondary: {
      label: 'Falar agora no WhatsApp',
      href: buildWaLink('Olá! Vim pela página de sites imersivos e quero falar agora.'),
    },
    stats: [
      { big: '60fps', label: 'mesmo com gráficos 3D em tempo real' },
      { big: '0', label: 'templates — cada cena é desenhada pro seu produto' },
      { big: '100%', label: 'adaptado pra carregar leve no mobile' },
    ],
    scarcity: {
      line1: 'Diagnóstico gratuito',
      line2: 'Sem compromisso',
      cta: { label: 'Falar no WhatsApp', href: buildWaLink('Olá! Vi a página de sites imersivos e quero falar com vocês.') },
    },
  },

  scrub: {
    headlineTokens: [
      'Um', 'site', { glyph: 'concentric' }, 'comum', 'é', { br: true },
      'esquecido', { glyph: 'ring' }, 'antes', { br: true },
      'do', 'primeiro', { glyph: 'cross' }, { persist: true, glyph: 'diamond', text: 'scroll.' },
    ],
    paragraph:
      'O visitante decide em segundos se aquele site merece o resto da atenção dele. Uma primeira tela estática, sem movimento, sem surpresa, não dá motivo nenhum pra continuar — e a marca perde a única chance que teria de ficar na memória.',
  },

  consequence: {
    eyebrow: 'O que acontece depois do clique',
    headlineLines: ['O clique você já pagou.', '_A memória, você nunca teve._'],

    lossLabel: 'Site genérico',
    lossCaption:
      'O visitante entra, rola rápido, não vê nada que pare o olho — e sai sem lembrar do nome da marca cinco minutos depois.',
    ghosts: ['Saiu sem rolar até o fim', 'Não lembrou da marca', 'Fechou a aba em segundos'],
    emptyState: 'Nenhuma mensagem nova',

    gainLabel: 'Padrão Ravenn',
    gainCaption:
      'Mesmo anúncio, mesmo orçamento, mesmo clique. Só que agora ele cai numa experiência que prende a atenção — e vira conversa no seu WhatsApp.',
    chats: [
      { name: 'Fernanda K.', preview: 'Que site incrível, nunca vi nada assim', time: '20:33' },
      { name: 'Rodrigo A.', preview: 'Fiquei rolando a página só pra ver o efeito', time: '20:12' },
      { name: 'Bianca L.', typing: true, time: '19:58' },
      { name: 'Otávio M.', preview: 'Quero um site assim pra minha marca', time: '19:41' },
      { name: 'Isabela T.', preview: 'Passei o link pro meu sócio, adorou', time: '19:20' },
      { name: 'Caio R.', preview: 'Como funciona o objeto 3D do site de vocês?', time: '18:55' },
    ],

    cta: {
      label: 'Quero uma experiência assim pra minha marca',
      href: buildWaLink('Olá! Vi a página de sites imersivos e quero uma experiência assim pra minha marca.'),
    },
  },

  /* `gaugeLabel: 'FLUIDO'` — mesmo medidor que preenche, relendo a
     mecânica como "fluidez a 60fps" em vez de "PAGESPEED" (default usado
     nas LPs de site institucional). Faz sentido aqui responder de cara a
     objeção mais óbvia do serviço: "WebGL não deixa o site pesado?". */
  bento: {
    cells: [
      {
        key: 'performance',
        title: 'Rápido mesmo com gráficos avançados',
        body: 'Carregamento sob demanda de cada cena 3D e fallback automático em conexões lentas — WebGL nunca atrasa o resto da página.',
        mockup: 'pagespeed',
        gaugeLabel: 'FLUIDO',
        pill: '60fps',
      },
      {
        key: 'motion',
        title: 'Cada transição pensada, não decorativa',
        body: 'Scroll, hover e entrada de seção seguem uma coreografia única — nada se move só por mover.',
        mockup: 'wireframe',
        pill: 'Motion autoral',
      },
      {
        key: 'direcao',
        title: 'Direção de arte exclusiva, nunca template',
        body: 'Cada cena é desenhada pro seu produto — o mesmo cuidado aplicado neste próprio site, que você está navegando agora.',
        mockup: 'authority',
        pill: '100% autoral',
      },
      {
        key: 'conversao',
        title: 'Do impacto visual à conversa, sem fricção',
        body: 'A experiência existe pra reter atenção — e transformar essa atenção em contato, não só em admiração passageira.',
        mockup: 'whatsapp',
        pill: 'Foco em conversão',
        accent: '#25D366',
      },
    ],
  },

  concepts: {
    eyebrow: 'A prova está nesta própria página',
    heading: 'Não descrevemos a experiência. Você já está dentro dela.',
    intro:
      'Os três elementos abaixo não são conceitos fictícios — são gravações do próprio site da Ravenn. É o padrão exato de cena, movimento e acabamento que aplicamos quando o projeto é o seu.',
    items: [
      {
        nicho: 'Hero Cinematográfico · Scroll-Sequence',
        src: `${PH}/concept-corvo-scroll-placeholder.mp4`,
        poster: `${PH}/concept-corvo-scroll-poster.svg`,
        pain: 'A primeira tela do site é a única chance de provar que a marca não é mais uma genérica — e a maioria desperdiça isso num banner estático.',
        solution:
          'Uma sequência que reage ao scroll, como no hero deste próprio site — o visitante sente que está controlando a cena, não só rolando uma página.',
        wa: buildWaLink('Olá! Vi o conceito de hero cinematográfico na página de sites imersivos e quero esse padrão no meu site.'),
      },
      {
        nicho: 'Objeto 3D Interativo · WebGL',
        src: `${PH}/concept-pilares-3d-placeholder.mp4`,
        poster: `${PH}/concept-pilares-3d-poster.svg`,
        pain: 'Um ícone plano não segura o olhar por mais de um segundo — e um segundo não basta pra impressionar quem decide.',
        solution:
          'Um objeto 3D real, com luz e reflexo, reagindo ao movimento do mouse — o mesmo elemento que vive nesta página, rodando fluido mesmo em aparelhos mais simples.',
        wa: buildWaLink('Olá! Vi o conceito de objeto 3D interativo na página de sites imersivos e quero esse padrão no meu site.'),
      },
      {
        nicho: 'Vitrine de Portfólio · Transições',
        src: `${PH}/concept-portfolio-placeholder.mp4`,
        poster: `${PH}/concept-portfolio-poster.svg`,
        pain: 'Um portfólio que só troca de imagem não convence ninguém de que o resto do site recebeu o mesmo nível de cuidado.',
        solution:
          'Cada transição é parte da experiência — a própria vitrine já demonstra o padrão de acabamento antes do visitante clicar em qualquer projeto.',
        wa: buildWaLink('Olá! Vi o conceito de vitrine de portfólio na página de sites imersivos e quero esse padrão no meu site.'),
      },
    ],
  },

  pillars: {
    declarationLines: [
      { text: 'Não é um site.', tone: 'bright' },
      { text: 'É uma experiência', tone: 'dim' },
      { text: 'que sua marca precisa ter.', tone: 'dim' },
    ],
    labels: ['WebGL & Three.js', 'Motion cinematográfico', '60fps garantido', 'Direção de arte exclusiva'],
  },

  audience: {
    eyebrow: 'Para quem é',
    heading: 'Para quem não pode parecer mais um no mercado.',
    slides: [
      {
        title: 'Para marcas de luxo que vendem percepção antes do produto.',
        body: 'Empreendimentos, joalherias, hotelaria de alto padrão — onde o site é a primeira prova do nível da experiência que vem depois.',
        image: '/para-quem-e-lps/07-luxo-percepcao.webp',
      },
      {
        title: 'Para estúdios criativos que precisam provar o próprio padrão.',
        body: 'Arquitetura, design, produtoras — onde um site genérico contradiz exatamente o que a empresa vende.',
        image: '/para-quem-e-lps/08-estudio-criativo.webp',
      },
      {
        title: 'Para quem já tentou "só mais um site bonito" e não bastou.',
        body: 'Marcas que já investiram em design e sentem que ainda faltou aquele elemento de surpresa que faz alguém lembrar.',
        image: '/para-quem-e-lps/09-site-bonito.webp',
      },
    ],
  },

  process: {
    eyebrow: 'Como funciona',
    heading: 'Do conceito ao site imersivo no ar.',
    steps: [
      {
        title: 'Direção de arte e conceito',
        body: 'Definimos a narrativa visual do site — que cena, que movimento, que sensação a marca precisa transmitir logo na primeira tela.',
      },
      {
        title: 'Prototipação 3D e motion',
        body: 'Construímos e testamos as cenas interativas antes de integrar ao site inteiro — você aprova cada movimento antes dele ir pro ar.',
      },
      {
        title: 'Otimização e lançamento',
        body: 'Cada cena passa por otimização de performance — WebGL no ar, sem pesar a experiência de quem acessa pelo celular.',
      },
    ],
    bg: {
      mobile: '/funciona-bg-lp/bg-mobile.webp',
      desktop: '/funciona-bg-lp/bg-desktop.webp',
    },
    cta: { label: 'Começar pelo conceito', href: buildWaLink('Olá! Quero começar meu site imersivo pelo conceito.') },
  },

  faq: {
    bg: { mobile: '/bg-faq-institucional-mobile.webp', desktop: '/bg-faq-institucional.webp' },
    items: [
      {
        q: 'Um site com WebGL não fica lento?',
        a: 'Não, se for bem construído: carregamos cada cena sob demanda e com fallback automático pra conexões mais lentas. Este próprio site que você está navegando é a prova disso.',
      },
      {
        q: 'Quanto custa um site experiencial?',
        a: 'Cada projeto é orçado pelo escopo — número de cenas, complexidade das animações e integrações. O diagnóstico gratuito define o escopo antes de qualquer proposta.',
      },
      {
        q: 'Funciona bem no celular?',
        a: 'Sim — cada cena é adaptada ou substituída por uma versão mais leve em dispositivos móveis, sem perder a essência da experiência.',
      },
      {
        q: 'Em quanto tempo o site fica pronto?',
        a: 'Projetos com WebGL levam de 5 a 8 semanas, dependendo da quantidade de cenas interativas. Você acompanha cada etapa, do conceito ao lançamento.',
      },
    ],
    cta: { label: 'Perguntar no WhatsApp', href: buildWaLink('Olá! Tenho uma dúvida sobre sites imersivos que não vi no FAQ.') },
  },

  finale: {
    deviceImage: '/lp-institucional/cta-device.webp',
    headline: 'Descubra se sua marca merece mais que um site comum.',
    body: 'Em até 24 horas, avaliamos seu site atual e mostramos onde uma experiência imersiva elevaria a percepção da sua marca. Sem compromisso. Sem script de vendas.',
    cta: { label: 'Solicitar diagnóstico no WhatsApp', href: buildWaLink('Olá. Quero o diagnóstico gratuito do meu site.') },
    badges: ['Sem compromisso', 'Resposta em até 24h', 'Sem script de vendas'],
  },

  footer: {
    marqueeText: 'RAVENN STUDIO',
    line: 'Sites experienciais e imersivos · Niterói, RJ',
  },
};
