import { buildWaLink } from './_base';

/* ══════════════════════════════════════════════════════════════════════
   Conteúdo da LP /sites-institucionais — reformulação v6.
   Nicho: sites institucionais premium para clínicas/estética, advocacia e
   imobiliário de alto padrão em Niterói/RJ. Tráfego pago, conversão única
   via WhatsApp. Ver plano em C:\Users\thiag\.claude\plans para o brief
   completo por ato.
   ══════════════════════════════════════════════════════════════════════ */

const LOGO_H = '/logo-ravenn/logo-ravenn-studio-horizontal.webp';

export default {
  meta: {
    logo: LOGO_H,
  },

  nav: {
    links: [
      { label: 'Serviços', href: '#padrao' },
      { label: 'Conceitos', href: '#conceitos' },
      { label: 'Contato', href: '#finale' },
    ],
  },

  whatsapp: {
    // botão flutuante persistente (reusa src/components/WhatsAppButton.jsx)
    message: buildWaLink(
      'Olá! Vim pela página de sites institucionais e gostaria de agendar um diagnóstico gratuito.',
    ),
  },

  hero: {
    eyebrow: 'Sites institucionais premium — Niterói · RJ',
    headlineLines: ['O seu site deveria', '_fechar contratos._'],
    subheadline:
      'Sites institucionais premium para clínicas, escritórios de advocacia e imobiliárias de alto padrão — construídos para transformar tráfego pago em reunião marcada, não em visita perdida.',
    ctaPrimary: {
      label: 'Solicitar diagnóstico gratuito',
      href: buildWaLink('Olá! Vi a página de sites institucionais da Ravenn e quero o diagnóstico gratuito.'),
    },
    ctaSecondary: {
      label: 'Falar agora no WhatsApp',
      href: buildWaLink('Olá! Vim pela página de sites institucionais e quero falar agora.'),
    },
    stats: [
      { big: '0,05s', label: 'até o primeiro julgamento visual' },
      { big: '75%', label: 'da credibilidade vem do design (Stanford)' },
      { big: '53%', label: 'abandonam por lentidão no mobile (Google)' },
    ],
    // Item 2 do refinamento v3: o badge anterior ("Apenas 4 projetos por mês")
    // era uma afirmação não verificada — removido. Texto pendente de
    // confirmação do cliente; usando o default seguro do brief até lá.
    scarcity: {
      line1: 'Diagnóstico gratuito',
      line2: 'Sem compromisso',
      cta: { label: 'Falar no WhatsApp', href: buildWaLink('Olá! Vi a página de sites institucionais e quero falar com vocês.') },
    },
  },

  scrub: {
    // Item 4 do refinamento v3: glifos intercalados como pontuação; o
    // último token (persist:true) é o par [glifo+palavra] que sobrevive ao
    // fade-out e voa pro canto inferior direito. Ver primitives/Glyph.jsx.
    headlineTokens: [
      'Ninguém', { glyph: 'concentric' }, 'liga', 'para', 'quem', { glyph: 'ring' }, { br: true },
      'parece', 'barato.', { br: true },
      'Nem', 'para', 'quem', 'parece', { glyph: 'cross' }, { persist: true, glyph: 'diamond', text: 'amador.' },
    ],
    paragraph:
      'O paciente particular. O cliente corporativo. O comprador de alto padrão. Todos julgam sua credibilidade pelo site antes de qualquer contato — e decidem em segundos se voltam ou se fecham com o concorrente que parecia mais preparado.',
  },

  /* Ato 3 — "O WhatsApp que não toca" (SilentInbox.jsx). Substituiu a cena
     abstrata de partículas + punchline (CostReveal.jsx): ver o cabeçalho do
     componente para o porquê.

     Regra de conteúdo desta seção, válida para TODA LP clonada daqui: nada
     de número. A cena é sobre o silêncio da caixa de entrada, e um "68% dos
     visitantes" inventado aqui cairia no mesmo erro já corrigido duas vezes
     nesta página (o badge "4 projetos por mês" e o CPL sem fonte) — numa
     página que vende confiança, o número sem fonte custa mais do que
     entrega. `ghosts` e `chats` são micro-UI ilustrativa dentro de um
     mockup declaradamente fictício, não depoimento de cliente. */
  consequence: {
    eyebrow: 'O que acontece depois do clique',
    headlineLines: ['O clique você já pagou.', '_A conversa, você nunca teve._'],

    /* Legendas curtas de propósito (~130 caracteres): num iPhone SE cada
       linha custa altura que sai direto do tamanho do mockup — e o mockup é
       a prova. Se precisar alongar numa LP clonada, confira o Ato 3 nesse
       aparelho antes de fechar. */
    lossLabel: 'Site comum',
    lossCaption:
      'Seu anúncio entrega gente pronta pra comprar. O site não convence, ela volta pro Google — e fecha com o concorrente. Você pagou por esse clique.',
    ghosts: ['Saiu sem falar com você', 'Foi para o concorrente', 'Fechou a aba em segundos'],
    emptyState: 'Nenhuma mensagem nova',

    gainLabel: 'Padrão Ravenn',
    gainCaption:
      'Mesmo anúncio, mesmo orçamento, mesmo clique. Só que agora ele cai num site feito pra fechar — e vira conversa no seu WhatsApp.',
    /* 6 conversas (era 3) — pedido explícito de "parecer um WhatsApp
       lotado". Ordem = mais recente no topo (mesma convenção do app real),
       times decrescentes ao longo de ~35min pra ler como um fluxo contínuo
       de leads chegando, não uma rajada implausível no mesmo minuto. Só UMA
       com `typing: true` — mais de uma pessoa "digitando" ao mesmo tempo
       quebraria a ilusão de realismo em vez de reforçá-la. */
    chats: [
      { name: 'Marina A.', preview: 'Oi! Vi o site de vocês e queria agendar…', time: '21:47' },
      { name: 'Ricardo M.', preview: 'Boa noite, vocês atendem particular?', time: '21:44' },
      { name: 'Camila F.', typing: true, time: '21:41' },
      { name: 'Fernanda L.', preview: 'Perfeito, muito obrigada! Vou chamar já', time: '21:36' },
      { name: 'João Pedro', preview: 'Qual o valor do diagnóstico?', time: '21:29' },
      { name: 'Beatriz S.', preview: 'Adorei o site de vocês, parabéns', time: '21:15' },
    ],

    cta: {
      label: 'Quero meu WhatsApp tocando',
      href: buildWaLink('Olá! Vi a página de sites institucionais e quero um site que traga conversas no WhatsApp.'),
    },
  },

  bento: {
    // As 4 imagens bento-0X.webp ficam reservadas pras próximas LPs
    // nichadas (decisão do usuário) — item 6 do refinamento v3 também
    // removeu o card/borda cônica que as usava como fundo.
    cells: [
      {
        key: 'performance',
        title: 'Velocidade que vira confiança',
        body: 'PageSpeed 90+ garantido — cada segundo de espera é um cliente a menos.',
        mockup: 'pagespeed',
        pill: '90+ score',
      },
      {
        key: 'arquitetura',
        title: 'Cada seção pensada pra fechar',
        body: 'Hierarquia visual e copywriting que conduzem o olhar até o botão certo.',
        mockup: 'wireframe',
        pill: '3 cliques',
      },
      {
        key: 'autoridade',
        title: 'Design que já parece caro',
        body: 'Autoridade visual que justifica o preço antes da primeira reunião.',
        mockup: 'authority',
        pill: '5.0 ★',
      },
      {
        key: 'whatsapp',
        title: 'Atendimento que nunca dorme',
        body: 'Mensagem recebida, qualificada e respondida — mesmo às 3 da manhã.',
        mockup: 'whatsapp',
        pill: '24/7',
        accent: '#25D366',
      },
    ],
  },

  /* Ato 5 — vitrine de portfólio (ConceptStack.jsx).

     `eyebrow`/`heading` passaram a viver aqui na v8: antes eram string
     hardcoded dentro do componente, o que quebrava a promessa desta LP ser
     MOLDE (clonar pra outro serviço exigia editar JSX, não config). O
     `intro` já existia mas nunca era renderizado — era código morto. */
  concepts: {
    eyebrow: 'O padrão aplicado',
    heading: 'É assim que o seu mercado deveria ver você.',
    intro:
      'Três conceitos autorais criados pelo nosso estúdio para mercados de alto tíquete. Não são clientes — são o padrão exato de design e conversão que aplicamos quando o projeto é o seu.',
    items: [
      {
        nicho: 'Clínica · Saúde & Estética',
        src: '/videos-raven-portfolio/pele-raven.mp4',
        poster: '/videos-raven-portfolio/pele-poster.webp',
        pain: 'O paciente particular julga a sua clínica pelo site — antes de conhecer o seu trabalho.',
        solution:
          'Segurança clínica com estética de desejo. O paciente sente o padrão do consultório antes de agendar a primeira consulta.',
        wa: buildWaLink('Olá! Vi o conceito para clínicas na página de sites institucionais e quero esse padrão no meu site.'),
      },
      {
        nicho: 'Advocacia · Corporativo',
        src: '/videos-raven-portfolio/advogado-raven.mp4',
        poster: '/videos-raven-portfolio/advogado-poster.webp',
        pain: 'Nenhuma empresa contrata um escritório que parece amador no Google.',
        solution:
          'Sobriedade que impõe respeito: hierarquia clara, tipografia imponente e a credibilidade que o cliente corporativo exige antes da primeira reunião.',
        wa: buildWaLink('Olá! Vi o conceito para advocacia na página de sites institucionais e quero esse padrão no meu site.'),
      },
      {
        nicho: 'Imobiliário · Alto padrão',
        src: '/videos-raven-portfolio/imovel-raven.mp4',
        poster: '/videos-raven-portfolio/imovel-poster.webp',
        pain: 'Ninguém compra um imóvel de milhões numa vitrine de classificados.',
        solution:
          'Apresentação cinematográfica à altura do ativo: o imóvel extraordinário precisa parecer extraordinário em cada scroll.',
        wa: buildWaLink('Olá! Vi o conceito para imobiliárias na página de sites institucionais e quero esse padrão no meu site.'),
      },
    ],
  },

  pillars: {
    declarationLines: [
      { text: 'Design de agência premium.', tone: 'bright' },
      { text: 'Engenharia de quem mede', tone: 'dim' },
      { text: 'cada milissegundo.', tone: 'dim' },
    ],
    labels: ['Design autoral', 'Performance obsessiva', 'Arquitetura de conversão', 'Autoridade local'],
  },

  audience: {
    eyebrow: 'Para quem é',
    heading: 'Para quem é o Padrão Ravenn.',
    slides: [
      {
        title: 'Para quem cobra pelo padrão que entrega.',
        body: 'Profissionais de ticket alto que precisam de autoridade visual antes da primeira reunião — o site que justifica o preço antes de qualquer conversa.',
        image: '/ideal-lp-institucional/autoridade_profissional.webp',
      },
      {
        title: 'Para quem paga pelo clique e perde pelo design.',
        body: 'Negócios que já investem em tráfego pago e veem o lead qualificado escolher o concorrente — só porque o site atual parece mais barato.',
        image: '/ideal-lp-institucional/conversao_lead.webp',
      },
      {
        title: 'Para quem trata o site como investimento, não despesa.',
        body: 'Fundadores que entendem o site como uma máquina de vendas ativa 24 horas — um ativo que se paga, não um custo fixo.',
        image: '/ideal-lp-institucional/visionario_maquina_vendas.webp',
      },
    ],
  },

  process: {
    eyebrow: 'Como funciona',
    heading: 'Do diagnóstico ao site no ar.',
    steps: [
      {
        title: 'Diagnóstico',
        body: 'Em até 24 horas, analisamos performance, design e capacidade de conversão da sua presença digital atual — e mostramos exatamente onde você está perdendo clientes.',
      },
      {
        title: 'Design & construção',
        body: 'Projeto autoral, aprovado por você em etapas. Sem templates, sem surpresas, sem retrabalho. Você vê o site nascer antes de ir ao ar.',
      },
      {
        title: 'Lançamento & medição',
        body: 'Site no ar com nota 90+ no PageSpeed, SEO local configurado e rastreamento de cada conversão. O resultado é medido, não prometido.',
      },
    ],
    // Objeto por breakpoint (era um único path) — o enquadramento muda de
    // verdade entre as duas imagens (a peça de vidro fica concentrada à
    // direita no desktop, embaixo-à-direita no mobile), não é a mesma foto
    // redimensionada. `ConsequenceCarousel.jsx` resolve isso via `<picture>`.
    bg: {
      mobile: '/funciona-bg-lp/bg-mobile.webp',
      desktop: '/funciona-bg-lp/bg-desktop.webp',
    },
    cta: { label: 'Começar pelo diagnóstico', href: buildWaLink('Olá! Quero começar pelo diagnóstico gratuito.') },
  },

  faq: {
    bg: '/bg-faq-institucional.webp',
    items: [
      {
        q: 'Quanto custa um site institucional premium?',
        a: 'Cada projeto é orçado sob escopo — número de páginas, integrações e prazo. O diagnóstico gratuito define o escopo antes de qualquer proposta. Trabalhamos abaixo de um certo patamar de qualidade, e não abrimos exceção pra ele.',
      },
      {
        q: 'Em quanto tempo o site fica pronto?',
        a: 'Projetos típicos levam de 3 a 5 semanas entre diagnóstico e lançamento, dependendo do escopo e da agilidade nas aprovações. Você acompanha cada etapa.',
      },
      {
        q: 'Vocês atendem apenas Niterói?',
        a: 'Nossa base é Niterói, RJ — e é onde dominamos o mercado local. Mas atendemos clientes em todo o Brasil de forma remota, com o mesmo padrão de entrega.',
      },
      {
        q: 'O que está incluído no diagnóstico gratuito?',
        a: 'Análise técnica de performance (Core Web Vitals), avaliação de design e credibilidade, e um mapa dos pontos onde seu site atual perde conversões. Entregue em até 24 horas, sem compromisso e sem script de vendas.',
      },
    ],
    cta: { label: 'Perguntar no WhatsApp', href: buildWaLink('Olá! Tenho uma dúvida sobre sites institucionais que não vi no FAQ.') },
  },

  finale: {
    headline: 'Descubra quanto o seu site está custando.',
    body: 'Em até 24 horas, analisamos a performance, o design e a capacidade de conversão da sua presença digital atual. Sem compromisso. Sem script de vendas.',
    cta: { label: 'Solicitar diagnóstico no WhatsApp', href: buildWaLink('Olá. Quero o diagnóstico gratuito do meu site.') },
    // "Apenas 4 projetos por mês" removido daqui também — mesma afirmação
    // não verificada que saiu do badge do hero (item 2). O motivo vale
    // pra qualquer lugar da página, não só o hero.
    badges: ['Sem compromisso', 'Resposta em até 24h', 'Sem script de vendas'],
  },

  footer: {
    marqueeText: 'RAVENN STUDIO',
    line: 'Agência de design premium · Criação de sites em Niterói, RJ',
  },
};
