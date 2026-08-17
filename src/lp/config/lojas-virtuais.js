import { buildWaLink } from './_base';

/* ══════════════════════════════════════════════════════════════════════
   Conteúdo da LP /lojas-virtuais — quinto clone do molde de
   sites-institucionais.js. Serviço: Lojas Virtuais de Alta Performance
   (e-commerce). Conversão única via WhatsApp, mesmo padrão das demais
   LPs desta família.

   ── Assets ────────────────────────────────────────────────────────────
   Hero, CTA final e os fundos de "Como Funciona"/FAQ reaproveitam os
   arquivos de sites-institucionais.js. Os 3 conceitos de portfólio usam
   prints reais de página inteira (`public/prints-ecommerce/`, convertidos
   pra WebP), não vídeo — cada `item` só tem `poster`, sem `src`:
   `ShowcaseMedia` (ConceptStack.jsx) já trata a ausência de vídeo de
   forma limpa (o `<video>` sem `src` nunca dispara `loadeddata`, então o
   poster fica permanentemente visível) — não é preciso fabricar um
   caminho de vídeo falso só pra cair no mesmo fallback.
   ══════════════════════════════════════════════════════════════════════ */

const LOGO_H = '/logo-ravenn/logo-ravenn-studio-horizontal.webp';

export default {
  meta: {
    logo: LOGO_H,
  },

  whatsapp: {
    message: buildWaLink(
      'Olá! Vim pela página de lojas virtuais e gostaria de agendar um diagnóstico gratuito.',
    ),
  },

  hero: {
    eyebrow: 'Lojas virtuais de alta performance para e-commerce',
    headlineLines: ['Sua loja fecha às 18h.', '_Seu faturamento não deveria._'],
    subheadline:
      'Lojas virtuais mobile-first com checkout em três etapas, Pix integrado e velocidade que não deixa o cliente desistir no meio do caminho.',
    deviceImages: {
      desktop: '/lp-institucional/hero-device.webp',
      mobile: '/lp-institucional/hero-device-mobile.webp',
    },
    ctaPrimary: {
      label: 'Solicitar diagnóstico gratuito',
      href: buildWaLink('Olá! Vi a página de lojas virtuais da Ravenn e quero o diagnóstico gratuito.'),
    },
    ctaSecondary: {
      label: 'Falar agora no WhatsApp',
      href: buildWaLink('Olá! Vim pela página de lojas virtuais e quero falar agora.'),
    },
    stats: [
      { big: '3', label: 'etapas do carrinho até o pagamento' },
      { big: '90+', label: 'PageSpeed garantido, mesmo no mobile' },
      { big: '24h', label: 'vendendo, sem depender de ninguém online' },
    ],
    scarcity: {
      line1: 'Diagnóstico gratuito',
      line2: 'Sem compromisso',
      cta: { label: 'Falar no WhatsApp', href: buildWaLink('Olá! Vi a página de lojas virtuais e quero falar com vocês.') },
    },
  },

  scrub: {
    headlineTokens: [
      'Cada', 'segundo', { glyph: 'concentric' }, 'de', { br: true },
      'carregamento', { glyph: 'ring' }, 'é', 'um', { br: true },
      'carrinho', { glyph: 'cross' }, { persist: true, glyph: 'diamond', text: 'abandonado.' },
    ],
    paragraph:
      'O cliente já decidiu comprar: colocou o produto no carrinho. O que faz ele desistir agora não é falta de interesse, é fricção: uma página lenta, um checkout confuso, uma dúvida sem resposta. Cada segundo a mais de espera é uma chance a mais dele fechar a aba.',
  },

  consequence: {
    eyebrow: 'O que acontece com o carrinho abandonado',
    headlineLines: ['O produto foi pro carrinho.', '_A compra, nunca aconteceu._'],

    lossLabel: 'Loja sem suporte',
    lossCaption:
      'O cliente teve uma dúvida no checkout (sobre frete, prazo, tamanho) e não tinha ninguém pra perguntar. Ele fechou a aba, e o carrinho ficou lá, abandonado.',
    ghosts: ['Abandonou o carrinho', 'Não tirou a dúvida', 'Comprou em outra loja'],
    emptyState: 'Nenhuma mensagem nova',

    gainLabel: 'Padrão Ravenn',
    gainCaption:
      'Mesma dúvida, mesmo carrinho. Só que agora tem um WhatsApp visível oferecendo ajuda no momento certo, e o carrinho vira pedido confirmado.',
    chats: [
      { name: 'Renata F.', preview: 'Vocês têm esse produto no tamanho M?', time: '18:22' },
      { name: 'Thiago C.', preview: 'Perfeito, acabei de fechar o pedido!', time: '18:05' },
      { name: 'Priscila V.', typing: true, time: '17:48' },
      { name: 'Gustavo N.', preview: 'Qual o prazo de entrega pro meu CEP?', time: '17:30' },
      { name: 'Aline B.', preview: 'Consigo pagar no Pix com desconto?', time: '17:11' },
      { name: 'Felipe D.', preview: 'Chegou certinho, obrigado!', time: '16:50' },
    ],

    cta: {
      label: 'Quero minha loja recuperando carrinho',
      href: buildWaLink('Olá! Vi a página de lojas virtuais e quero uma loja que recupere carrinho abandonado.'),
    },
  },

  /* `gaugeLabel: 'RÁPIDA'` — mesmo medidor que preenche, relendo a
     mecânica como "velocidade de carregamento da loja". */
  bento: {
    cells: [
      {
        key: 'performance',
        title: 'PageSpeed 90+ pra não perder venda por lentidão',
        body: 'Cada segundo de carregamento reduz a taxa de conversão: sua loja carrega rápido mesmo em conexão de mobile fraca.',
        mockup: 'pagespeed',
        gaugeLabel: 'RÁPIDA',
        pill: '90+ score',
      },
      {
        key: 'checkout',
        title: 'Checkout em até 3 etapas, sem fricção',
        body: 'Do carrinho ao pagamento em poucos cliques: cada etapa a mais é uma chance do cliente desistir no meio do caminho.',
        mockup: 'wireframe',
        pill: '3 etapas',
      },
      {
        key: 'vitrine',
        title: 'Vitrine que já parece de marca grande',
        body: 'Design exclusivo, sem tema genérico de plataforma: sua loja com a cara da sua marca, não da milésima loja igual.',
        mockup: 'authority',
        pill: '100% autoral',
      },
      {
        key: 'suporte',
        title: 'Suporte visível no momento da dúvida',
        body: 'WhatsApp acessível durante o checkout pra tirar dúvida de frete, tamanho ou pagamento antes do cliente desistir.',
        mockup: 'whatsapp',
        pill: 'Recuperação de carrinho',
        accent: '#25D366',
      },
    ],
  },

  concepts: {
    eyebrow: 'Cada produto, sua vitrine',
    heading: 'Loja virtual não é um formato. É uma vitrine sob medida.',
    intro:
      'Três arquiteturas autorais que aplicamos conforme o tipo de produto. Não são clientes: é o padrão exato de vitrine e checkout que usamos quando a loja é sua.',
    /* Prints reais de página inteira (~1918×907, ver public/prints-ecommerce/),
       não gravação de tela — mesmo motivo de `frameAspect` que
       landing-pages.js já documenta: material mais largo que o 16:9
       padrão, sobrescrever aqui evita tarja preta no palco. */
    frameAspect: '1918 / 907',
    items: [
      {
        nicho: 'Acessórios de Luxo · Alto padrão',
        poster: '/prints-ecommerce/acessorios-print.webp',
        pain: 'Peça de alto padrão se vende pela percepção de exclusividade: um site com cara de loja genérica faz até um produto caro parecer commodity.',
        solution:
          'Vitrine editorial, fotografia em alta definição e checkout discreto: a experiência de compra à altura do preço da peça.',
        wa: buildWaLink('Olá! Vi o conceito de acessórios de luxo na página de lojas virtuais e quero esse padrão na minha loja.'),
      },
      {
        nicho: 'Pet Shop · Recompra',
        poster: '/prints-ecommerce/petshop-print.webp',
        pain: 'Quem tem pet compra ração e produtos todo mês — se recomprar exige login, busca e catálogo cansativo, o cliente migra pro concorrente mais fácil.',
        solution:
          'Conta salva, recompra em um clique e categorias por tipo de pet: a loja facilita exatamente o que se repete todo mês.',
        wa: buildWaLink('Olá! Vi o conceito de pet shop na página de lojas virtuais e quero esse padrão na minha loja.'),
      },
      {
        nicho: 'Eletrônicos · Alto ticket',
        poster: '/prints-ecommerce/eletronico-print.webp',
        pain: 'Produto caro exige confiança: checkout confuso ou site lento faz o cliente desistir por medo, não por preço.',
        solution:
          'Ficha técnica clara, comparação de produtos e checkout transparente: a confiança certa pra fechar uma compra de ticket alto.',
        wa: buildWaLink('Olá! Vi o conceito de eletrônicos na página de lojas virtuais e quero esse padrão na minha loja.'),
      },
    ],
  },

  pillars: {
    declarationLines: [
      { text: 'Sua loja é o vendedor', tone: 'bright' },
      { text: 'que nunca fecha,', tone: 'dim' },
      { text: 'nunca tira férias.', tone: 'dim' },
    ],
    labels: ['Checkout otimizado', 'Mobile-first de verdade', 'PageSpeed 90+', 'Pix e cartão integrados'],
  },

  audience: {
    eyebrow: 'Para quem é',
    heading: 'Para quem já vende e quer vender sem depender do balcão.',
    slides: [
      {
        title: 'Para quem vende só pelo Instagram ou WhatsApp hoje.',
        body: 'Negócios que fecham venda manualmente, mensagem por mensagem, e perdem tempo (e cliente) que uma loja automatizada resolveria sozinha.',
        image: '/para-quem-e-lps/13-instagram-whatsapp.webp',
      },
      {
        title: 'Para quem já tem loja, mas ela não vende no automático.',
        body: 'Lojas em plataforma genérica, lentas ou com checkout confuso, perdendo venda que já estava praticamente fechada.',
        image: '/para-quem-e-lps/14-loja-nao-automatizada.webp',
      },
      {
        title: 'Para quem quer faturar enquanto dorme, de verdade.',
        body: 'Quem entende que uma loja bem construída vende 24 horas, sem depender de alguém online pra fechar o pedido.',
        image: '/para-quem-e-lps/15-faturar-dormindo.webp',
      },
    ],
  },

  process: {
    eyebrow: 'Como funciona',
    heading: 'Do catálogo à loja vendendo no ar.',
    steps: [
      {
        title: 'Briefing e catálogo',
        body: 'Organizamos seu catálogo, categorias e meios de pagamento: a base que vai sustentar toda a loja.',
      },
      {
        title: 'Design e desenvolvimento',
        body: 'Loja autoral, mobile-first, aprovada por você em etapas. Sem tema genérico de plataforma.',
      },
      {
        title: 'Integração e lançamento',
        body: 'Pix, cartão e frete configurados, loja no ar com PageSpeed 90+ e pronta pra receber o primeiro pedido.',
      },
    ],
    bg: {
      mobile: '/funciona-bg-lp/bg-mobile.webp',
      desktop: '/funciona-bg-lp/bg-desktop.webp',
    },
    cta: { label: 'Começar pelo catálogo', href: buildWaLink('Olá! Quero começar minha loja virtual pelo catálogo.') },
  },

  faq: {
    bg: { mobile: '/bg-faq-institucional-mobile.webp', desktop: '/bg-faq-institucional.webp' },
    items: [
      {
        q: 'Quanto custa uma loja virtual?',
        a: 'Cada projeto é orçado pelo escopo: número de produtos, integrações de pagamento e frete. O diagnóstico gratuito define o escopo antes de qualquer proposta.',
      },
      {
        q: 'Em quanto tempo a loja fica pronta?',
        a: 'Entre 3 e 5 semanas, dependendo do tamanho do catálogo e da complexidade das integrações. Você acompanha cada etapa.',
      },
      {
        q: 'Quais formas de pagamento a loja aceita?',
        a: 'Pix, cartão de crédito e boleto, integrados aos principais gateways, configurados antes do lançamento.',
      },
      {
        q: 'A loja já vem com gestão de estoque?',
        a: 'Sim, controle de estoque integrado, com aviso automático de produto em falta antes que o cliente tente comprar.',
      },
    ],
    cta: { label: 'Perguntar no WhatsApp', href: buildWaLink('Olá! Tenho uma dúvida sobre lojas virtuais que não vi no FAQ.') },
  },

  finale: {
    deviceImage: '/lp-institucional/cta-device.webp',
    headline: 'Descubra quanto sua loja está perdendo em carrinho abandonado.',
    body: 'Em até 24 horas, analisamos sua loja atual (ou seu processo de venda hoje) e mostramos onde você está perdendo faturamento. Sem compromisso. Sem script de vendas.',
    cta: { label: 'Solicitar diagnóstico no WhatsApp', href: buildWaLink('Olá. Quero o diagnóstico gratuito da minha loja.') },
    badges: ['Sem compromisso', 'Resposta em até 24h', 'Sem script de vendas'],
  },

  footer: {
    marqueeText: 'RAVENN STUDIO',
    line: 'Lojas virtuais de alta performance · Niterói, RJ',
  },
};
