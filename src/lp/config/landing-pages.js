import { buildWaLink } from './_base';

/* ══════════════════════════════════════════════════════════════════════
   Conteúdo da LP /landing-pages — primeiro clone do molde de
   sites-institucionais.js. Serviço: Landing Pages de Alta Conversão para
   quem roda tráfego pago no Google Ads. Conversão única via WhatsApp,
   mesmo padrão das demais LPs desta família.

   ── Assets ────────────────────────────────────────────────────────────
   Hero, CTA final e os fundos de "Como Funciona"/FAQ reaproveitam os
   arquivos de sites-institucionais.js (pedido explícito do usuário — são
   genéricos o bastante pra não amarrar a um nicho). Os `.mp4` de
   `concepts` continuam apontando pra um arquivo que não existe de
   propósito (`/placeholder-landing-pages/`): sem ele, o <video>
   simplesmente não toca e o `poster` fica visível — layout não quebra
   enquanto os vídeos reais não forem gravados. Os posters, porém, já são
   reais: prints de tela cheia dos 3 conceitos (`/prints-lp-cconceito/`,
   convertidos pra `.webp`), não mais o rótulo SVG genérico.
   ══════════════════════════════════════════════════════════════════════ */

const LOGO_H = '/logo-ravenn/logo-ravenn-studio-horizontal.webp';
const PH = '/placeholder-landing-pages';
const PRINTS = '/prints-lp-cconceito';

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
      'Olá! Vim pela página de landing pages e gostaria de agendar um diagnóstico gratuito.',
    ),
  },

  hero: {
    eyebrow: 'Landing pages de alta conversão — Google Ads',
    headlineLines: ['Sua landing page deveria', '_pagar o próprio tráfego._'],
    subheadline:
      'Páginas de alta conversão para quem investe em Google Ads: copywriting orientado a venda, design exclusivo sem template e rastreamento configurado do zero. Entrega em 7 dias úteis.',
    // Reaproveitado de sites-institucionais.js (pedido explícito) — o
    // device mockup é genérico o bastante pra não amarrar visualmente a
    // um nicho específico.
    deviceImages: {
      desktop: '/lp-institucional/hero-device.webp',
      mobile: '/lp-institucional/hero-device-mobile.webp',
    },
    ctaPrimary: {
      label: 'Solicitar diagnóstico gratuito',
      href: buildWaLink('Olá! Vi a página de landing pages da Ravenn e quero o diagnóstico gratuito.'),
    },
    ctaSecondary: {
      label: 'Falar agora no WhatsApp',
      href: buildWaLink('Olá! Vim pela página de landing pages e quero falar agora.'),
    },
    // Fatos sobre o próprio processo de entrega (verificáveis, não
    // estatística de mercado sem fonte) — mesma disciplina de
    // sites-institucionais.js: nenhum número aqui é estimativa.
    stats: [
      { big: '7 dias', label: 'úteis do briefing ao ar' },
      { big: '2', label: 'rodadas de revisão inclusas' },
      { big: '100%', label: 'autoral — sem templates ou WordPress' },
    ],
    scarcity: {
      line1: 'Diagnóstico gratuito',
      line2: 'Sem compromisso',
      cta: { label: 'Falar no WhatsApp', href: buildWaLink('Olá! Vi a página de landing pages e quero falar com vocês.') },
    },
  },

  scrub: {
    /* v2 — "formulário que parece um formulário" lia como repetição
       acidental antes de ler como intenção (achado do diagnóstico de
       conversão). Reescrito pra uma leitura inequívoca na primeira
       passada, mantendo a mesma mecânica (duas frases curtas + palavra
       final que persiste voando pro canto). */
    headlineTokens: [
      'Cada', 'campo', { glyph: 'concentric' }, 'a', 'mais', { br: true },
      'no', 'formulário', { glyph: 'ring' }, { br: true },
      'é', 'uma', { glyph: 'cross' }, { persist: true, glyph: 'diamond', text: 'desistência.' },
    ],
    paragraph:
      'O visitante que clica no seu anúncio já decidiu em segundos se aquela página merece confiança. Um formulário genérico, uma oferta confusa ou um CTA fraco devolvem ele pro Google — e o clique que você pagou vira dado perdido, não lead.',
  },

  /* Mantido quase idêntico ao Ato 3 de sites-institucionais.js — a dor
     "clique pago que não vira nada" é literalmente a mesma aqui. Mesma
     regra de conteúdo: nenhum número inventado nesta seção. */
  consequence: {
    eyebrow: 'O que acontece depois do clique',
    headlineLines: ['O clique você já pagou.', '_A conversão, você nunca teve._'],

    lossLabel: 'Landing page genérica',
    lossCaption:
      'Seu anúncio entrega gente pronta pra agir. A página não convence, ela fecha a aba — e o clique que você pagou não virou nada.',
    ghosts: ['Fechou a aba em segundos', 'Voltou pro Google', 'Foi para o concorrente'],
    emptyState: 'Nenhuma mensagem nova',

    gainLabel: 'Padrão Ravenn',
    gainCaption:
      'Mesmo anúncio, mesmo orçamento, mesmo clique. Só que agora ele cai numa página feita pra converter — e vira lead no seu WhatsApp.',
    chats: [
      { name: 'Patrícia G.', preview: 'Oi! Vi o anúncio, quero saber mais', time: '19:52' },
      { name: 'Eduardo R.', preview: 'Qual o prazo de entrega?', time: '19:48' },
      { name: 'Luiza T.', typing: true, time: '19:44' },
      { name: 'Diego M.', preview: 'Perfeito, pode me ligar?', time: '19:37' },
      { name: 'Amanda P.', preview: 'Vocês fazem pra clínica também?', time: '19:25' },
      { name: 'Rafael S.', preview: 'Gostei muito, vamos fechar', time: '19:11' },
    ],

    cta: {
      label: 'Quero minha landing page convertendo',
      href: buildWaLink('Olá! Vi a página de landing pages e quero uma página que converta meu tráfego pago.'),
    },
  },

  /* Os 4 mockups do BentoValue são ícones fixos do componente (pagespeed /
     wireframe / authority / whatsapp) — vocabulário visual compartilhado
     entre todas as LPs clonadas daqui, só o texto muda por serviço. */
  bento: {
    cells: [
      {
        key: 'performance',
        title: 'Velocidade que não deixa o clique escapar',
        body: 'PageSpeed 90+ garantido — em tráfego pago, cada segundo de espera é orçamento de mídia jogado fora.',
        mockup: 'pagespeed',
        pill: '90+ score',
      },
      {
        key: 'arquitetura',
        title: 'Estrutura pensada pra levar ao clique certo',
        body: 'Copywriting com hierarquia de conversão: cada seção empurra o olhar até o CTA, nunca distrai dele.',
        mockup: 'wireframe',
        pill: 'Estrutura AIDA',
      },
      {
        key: 'autoridade',
        title: 'Design exclusivo, sem templates prontos',
        body: 'Zero WordPress, zero template genérico — uma página tão séria quanto o seu orçamento de mídia.',
        mockup: 'authority',
        pill: '100% autoral',
      },
      {
        key: 'whatsapp',
        title: 'Do anúncio à conversa, sem perder o lead',
        body: 'GA4 e UTMs configurados do zero — cada clique e cada conversão, visíveis no seu painel.',
        mockup: 'whatsapp',
        pill: 'GA4 + UTM',
        accent: '#25D366',
      },
    ],
  },

  /* Ato 5 — vitrine. Em vez de 3 nichos de cliente (como em
     sites-institucionais), aqui os 3 conceitos são 3 ARQUITETURAS de LP
     por objetivo de campanha — o que de fato varia num serviço de landing
     pages. `src` aponta pra um .mp4 que ainda não existe de propósito (ver
     nota de assets pendentes no topo do arquivo); o poster placeholder
     cobre o vazio até a gravação real. */
  concepts: {
    eyebrow: 'Cada objetivo, sua arquitetura',
    heading: 'Landing page não é um formato. É uma decisão de conversão.',
    intro:
      'Três arquiteturas autorais que aplicamos conforme o objetivo da campanha. Não são clientes — é o padrão exato de estrutura e copy que usamos quando o tráfego pago é seu.',
    // Os posters são prints de página inteira (~2.1:1), não gravações
    // 16:9 — sem isso o palco (ConceptStack.jsx) usa o default 16:9 e
    // sobra tarja preta com `object-contain`. Proporção média dos 3
    // prints (1915×903, 1903×909, 1919×906).
    frameAspect: '1912 / 906',
    items: [
      {
        nicho: 'Geração de Leads · Formulário',
        src: `${PH}/concept-leads-placeholder.mp4`,
        poster: `${PRINTS}/print-leads.webp`,
        pain: 'Um formulário longo demais mata a intenção de compra antes da primeira pergunta.',
        solution:
          'Captura enxuta, hierarquia de confiança e prova social no lugar certo — pensada pra quem decide em segundos, não em minutos.',
        wa: buildWaLink('Olá! Vi o conceito de geração de leads na página de landing pages e quero esse padrão na minha campanha.'),
      },
      {
        nicho: 'Oferta Direta · Checkout',
        src: `${PH}/concept-oferta-placeholder.mp4`,
        poster: `${PRINTS}/print-oferta.webp`,
        pain: 'Cada clique extra até o pagamento é uma chance a mais do visitante desistir.',
        solution:
          'Página de venda direta com oferta, prova e CTA na mesma dobra — do anúncio ao checkout, sem distração no meio do caminho.',
        wa: buildWaLink('Olá! Vi o conceito de oferta direta na página de landing pages e quero esse padrão na minha campanha.'),
      },
      {
        nicho: 'Diagnóstico Gratuito · Serviço',
        src: `${PH}/concept-diagnostico-placeholder.mp4`,
        poster: `${PRINTS}/print-diagnostico.webp`,
        pain: 'Serviço de ticket alto não se vende num formulário genérico de "fale conosco".',
        solution:
          'A mesma arquitetura desta própria página: uma promessa clara, prova de padrão e um único caminho de conversão — pro seu WhatsApp.',
        wa: buildWaLink('Olá! Vi o conceito de diagnóstico gratuito na página de landing pages e quero esse padrão na minha campanha.'),
      },
    ],
  },

  pillars: {
    declarationLines: [
      { text: 'Copywriting de resposta direta.', tone: 'bright' },
      { text: 'Estrutura de quem mede', tone: 'dim' },
      { text: 'cada centavo do CPA.', tone: 'dim' },
    ],
    labels: ['Copy AIDA', 'Performance obsessiva', 'Rastreamento completo', 'Zero templates'],
  },

  audience: {
    eyebrow: 'Para quem é',
    heading: 'Para quem investe em tráfego e não pode perder clique.',
    slides: [
      {
        title: 'Para quem já paga por clique e quer parar de perder.',
        body: 'Negócios que rodam Google Ads mas mandam o tráfego pra home ou pra um site genérico — e veem o custo por aquisição subir sem entender por quê.',
        image: '/para-quem-e-lps/01-trafego-pago-clique.webp',
      },
      {
        title: 'Para quem lança oferta e precisa validar rápido.',
        body: 'Times que testam campanhas e ofertas com frequência e não podem esperar semanas por uma página nova a cada teste.',
        image: '/para-quem-e-lps/02-oferta-validacao.webp',
      },
      {
        title: 'Para quem trata tráfego pago como investimento, não aposta.',
        body: 'Quem entende que uma página feita pra converter paga a própria mídia — e que todo clique sem página dedicada é orçamento desperdiçado.',
        image: '/para-quem-e-lps/03-trafego-investimento.webp',
      },
    ],
  },

  process: {
    eyebrow: 'Como funciona',
    heading: 'Do briefing à página no ar em 7 dias úteis.',
    steps: [
      {
        title: 'Briefing e copy',
        body: 'Entendemos sua oferta, seu público e o objetivo da campanha — e escrevemos a copy de conversão em cima disso, não de um texto genérico.',
      },
      {
        title: 'Design e desenvolvimento',
        body: 'Página autoral, sem templates, aprovada por você em etapas. Duas rodadas de revisão inclusas antes do lançamento.',
      },
      {
        title: 'Lançamento e rastreamento',
        body: 'Página no ar com GA4 e UTMs configurados do zero — pronta pra você medir cada centavo investido em mídia.',
      },
    ],
    // Reaproveitado de sites-institucionais.js (pedido explícito).
    bg: {
      mobile: '/funciona-bg-lp/bg-mobile.webp',
      desktop: '/funciona-bg-lp/bg-desktop.webp',
    },
    cta: { label: 'Começar pelo briefing', href: buildWaLink('Olá! Quero começar minha landing page pelo briefing gratuito.') },
  },

  faq: {
    // Reaproveitado de sites-institucionais.js (pedido explícito).
    bg: { mobile: '/bg-faq-institucional-mobile.webp', desktop: '/bg-faq-institucional.webp' },
    items: [
      {
        q: 'Quanto custa uma landing page de alta conversão?',
        a: 'Cada projeto é orçado pelo escopo — número de seções, integrações e prazo. O diagnóstico gratuito define o escopo antes de qualquer proposta.',
      },
      {
        q: 'Em quanto tempo a página fica pronta?',
        a: '7 dias úteis entre o briefing e o lançamento, com 2 rodadas de revisão inclusas. Prazos maiores só em escopos fora do padrão.',
      },
      {
        q: 'Vocês cuidam da gestão dos anúncios também?',
        a: 'A landing page é o foco deste serviço — mas também oferecemos gestão de Google Ads à parte, caso você precise das duas pontas.',
      },
      {
        q: 'A página já vem com rastreamento configurado?',
        a: 'Sim — GA4 e UTMs configurados do zero antes do lançamento, pra você medir cada conversão desde o primeiro clique.',
      },
    ],
    cta: { label: 'Perguntar no WhatsApp', href: buildWaLink('Olá! Tenho uma dúvida sobre landing pages que não vi no FAQ.') },
  },

  finale: {
    // Reaproveitado de sites-institucionais.js (pedido explícito).
    deviceImage: '/lp-institucional/cta-device.webp',
    headline: 'Descubra quanto sua landing page está te custando.',
    body: 'Em até 24 horas, analisamos a estrutura, a copy e a capacidade de conversão da sua página atual. Sem compromisso. Sem script de vendas.',
    cta: { label: 'Solicitar diagnóstico no WhatsApp', href: buildWaLink('Olá. Quero o diagnóstico gratuito da minha landing page.') },
    badges: ['Sem compromisso', 'Resposta em até 24h', 'Sem script de vendas'],
  },

  footer: {
    marqueeText: 'RAVENN STUDIO',
    line: 'Landing pages para Google Ads · Niterói, RJ',
  },
};
