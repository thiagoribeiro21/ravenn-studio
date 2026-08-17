import { buildWaLink } from './_base';

/* ══════════════════════════════════════════════════════════════════════
   Conteúdo da LP /gestao-google-ads — quarto clone do molde de
   sites-institucionais.js. Serviço: Gestão de Google Ads (mídia paga).
   Conversão única via WhatsApp, mesmo padrão das demais LPs desta
   família.

   ── Assets ────────────────────────────────────────────────────────────
   Hero, CTA final e os fundos de "Como Funciona"/FAQ reaproveitam os
   arquivos de sites-institucionais.js. `concepts` usa CampaignAnatomy
   (ver LPShell.jsx) em vez de ConceptStack — zero asset, é só código.
   As 3 fotos de "Para quem é" já são imagens finais em
   `/para-quem-e-lps/`.
   ══════════════════════════════════════════════════════════════════════ */

const LOGO_H = '/logo-ravenn/logo-ravenn-studio-horizontal.webp';

export default {
  meta: {
    logo: LOGO_H,
  },

  whatsapp: {
    message: buildWaLink(
      'Olá! Vim pela página de gestão de Google Ads e gostaria de agendar um diagnóstico gratuito.',
    ),
  },

  hero: {
    eyebrow: 'Gestão de Google Ads com performance real',
    headlineLines: ['Você não quer cliques.', '_Quer clientes._'],
    subheadline:
      'Gestão de Google Ads orientada por custo de aquisição real: segmentação por intenção de compra, teste A/B contínuo e relatório que você entende sem precisar de tradutor.',
    deviceImages: {
      desktop: '/lp-institucional/hero-device.webp',
      mobile: '/lp-institucional/hero-device-mobile.webp',
    },
    ctaPrimary: {
      label: 'Solicitar diagnóstico gratuito',
      href: buildWaLink('Olá! Vi a página de gestão de Google Ads da Ravenn e quero o diagnóstico gratuito.'),
    },
    ctaSecondary: {
      label: 'Falar agora no WhatsApp',
      href: buildWaLink('Olá! Vim pela página de gestão de Google Ads e quero falar agora.'),
    },
    stats: [
      { big: 'Semanal', label: 'ajuste de lances, orçamento e criativos' },
      { big: '0', label: 'contrato de fidelidade' },
      { big: '100%', label: 'de acesso e propriedade da sua conta' },
    ],
    scarcity: {
      line1: 'Diagnóstico gratuito',
      line2: 'Sem compromisso',
      cta: { label: 'Falar no WhatsApp', href: buildWaLink('Olá! Vi a página de gestão de Google Ads e quero falar com vocês.') },
    },
  },

  scrub: {
    headlineTokens: [
      'Clique', 'caro', { glyph: 'concentric' }, 'não', 'é', { br: true },
      'problema', 'de', { glyph: 'ring' }, 'orçamento.', { br: true },
      'É', 'de', { glyph: 'cross' }, { persist: true, glyph: 'diamond', text: 'segmentação.' },
    ],
    paragraph:
      'Aumentar orçamento numa campanha mal segmentada só compra mais do mesmo problema, mais rápido. O custo por aquisição não cai com mais dinheiro: cai com a palavra-chave certa, o público certo e o lance ajustado toda semana, não uma vez e esquecido.',
  },

  consequence: {
    eyebrow: 'O que acontece com uma conta sem gestão ativa',
    headlineLines: ['O orçamento foi gasto.', '_A venda, ninguém rastreou._'],

    lossLabel: 'Conta sem gestão',
    lossCaption:
      'Campanha configurada uma vez e esquecida. Palavra-chave genérica, lance parado, sem teste de criativo: o orçamento roda, mas ninguém sabe se está trazendo venda.',
    ghosts: ['Custo por clique subindo', 'Sem rastreamento de conversão', 'Orçamento gasto sem retorno claro'],
    emptyState: 'Nenhuma mensagem nova',

    gainLabel: 'Padrão Ravenn',
    gainCaption:
      'Mesmo orçamento, gestão ativa toda semana. Segmentação por intenção de compra, rastreamento configurado, e cada venda rastreada até o clique que a originou.',
    chats: [
      { name: 'Leandro F.', preview: 'O CPA caiu bastante esse mês, parabéns', time: '17:40' },
      { name: 'Vanessa R.', preview: 'Vi o relatório, ficou bem claro', time: '17:22' },
      { name: 'Marcos T.', typing: true, time: '16:58' },
      { name: 'Cristina A.', preview: 'Podemos aumentar orçamento na campanha 2?', time: '16:35' },
      { name: 'Pedro H.', preview: 'Gostei do teste A/B, o anúncio B performou bem', time: '16:10' },
      { name: 'Sabrina L.', preview: 'Quero entender melhor o funil, vamos marcar?', time: '15:48' },
    ],

    cta: {
      label: 'Quero minha conta de Ads sob gestão ativa',
      href: buildWaLink('Olá! Vi a página de gestão de Google Ads e quero gestão ativa da minha conta.'),
    },
  },

  /* `gaugeLabel: 'OTIMIZADO'` — mesmo medidor que preenche, relendo a
     mecânica como "nível de otimização da conta" em vez de "PAGESPEED". */
  bento: {
    cells: [
      {
        key: 'otimizacao',
        title: 'Otimização semanal, não configurar e esquecer',
        body: 'Lances, orçamento e criativos revisados toda semana com base em dado real, nunca "configura e deixa rodando".',
        mockup: 'pagespeed',
        gaugeLabel: 'OTIMIZADO',
        pill: 'Semanal',
      },
      {
        key: 'estrutura',
        title: 'Estrutura de campanha que segue o funil',
        body: 'Campanha, grupo de anúncios e página de destino organizados por etapa de intenção, não uma pilha de anúncios genéricos.',
        mockup: 'wireframe',
        pill: 'Full-funnel',
      },
      {
        key: 'testes',
        title: 'Criativos e copy testados, não apostados',
        body: 'Teste A/B contínuo entre variações de anúncio: o que não performa sai, o que performa recebe mais orçamento.',
        mockup: 'authority',
        pill: 'Teste A/B',
      },
      {
        key: 'relatorio',
        title: 'Relatório que você entende sem tradutor',
        body: 'Métricas de custo por aquisição real, não vaidade de cliques: clareza de quanto cada venda custou de fato.',
        mockup: 'whatsapp',
        pill: 'Relatório mensal',
        accent: '#25D366',
      },
    ],
  },

  /* `kind: 'funnel'` — esta LP usa CampaignAnatomy.jsx em vez de
     ConceptStack (ver LPShell.jsx). Motivo: nem vitrine de vídeo de site
     nem objeto 3D de "design premium" falam a língua de quem compra
     gestão de mídia — o que convence aqui é ver a ESTRUTURA da campanha.
     Zero asset pendente: a seção inteira é código, sem vídeo/imagem. Por
     ser a substituta de DUAS seções do molde padrão (Conceitos +
     Pilares), o `pillars` deste config foi removido — a declaração que
     vivia lá agora é o fechamento (`closing`) desta seção. */
  concepts: {
    kind: 'funnel',
    eyebrow: 'Anatomia de uma campanha que vende',
    heading: 'Google Ads não é orçamento. É estrutura.',
    intro:
      'Toda conta que gasta demais tem o mesmo problema: uma das cinco camadas abaixo está faltando. Cada uma existe pra filtrar quem não vai comprar antes que esse clique custe caro.',
    /* `short` alimenta o rótulo dentro da faixa do funil (espaço curto,
       ~1 palavra); `leak` é o vazamento específico que acontece sem
       aquela camada — o argumento de venda de cada estágio. */
    stages: [
      {
        title: 'Campanha',
        short: 'Objetivo',
        body: 'Definida pelo objetivo real: venda, lead ou reconhecimento. É o objetivo que ensina o Google quem procurar — por isso começa aqui, nunca pelo criativo.',
        leak: 'o Google otimiza para o objetivo errado e entrega alcance quando você queria venda.',
      },
      {
        title: 'Grupo de anúncios',
        short: 'Intenção',
        body: 'Agrupado por tema e intenção de busca. Quem procura "preço de" está a um passo de comprar; quem procura "o que é" ainda não — e os dois não podem dividir o mesmo anúncio.',
        leak: 'suas próprias palavras-chave disputam entre si e inflacionam o seu custo por clique.',
      },
      {
        title: 'Anúncio',
        short: 'Criativo',
        body: 'Variações testadas lado a lado: título, descrição e chamada competindo até o vencedor ficar claro no dado, não no achismo de quem escreveu.',
        leak: 'o anúncio mais fraco segue consumindo metade do orçamento por meses sem ninguém perceber.',
      },
      {
        title: 'Página de destino',
        short: 'Destino',
        body: 'A página certa para o objetivo daquela campanha específica — não a home do site, que responde a todo mundo e converte ninguém.',
        leak: 'o clique que você já pagou chega numa página genérica e vai embora sem converter.',
      },
      {
        title: 'Conversão rastreada',
        short: 'Venda',
        body: 'Cada venda ligada de volta ao anúncio exato que a originou. É esse dado que orienta o ajuste de lance de toda semana — e é ele que falta na maioria das contas.',
        leak: 'você otimiza no escuro, sem saber qual anúncio traz venda e qual só traz clique.',
      },
    ],
    funnelNote:
      'Cada faixa estreita de propósito: quanto mais abaixo, mais perto da compra — e mais caro custa cada erro de estrutura.',
    closing: {
      lines: [
        { text: 'Você não paga por clique.', tone: 'bright' },
        { text: 'Paga por venda,', tone: 'dim' },
        { text: 'é assim que medimos sucesso.', tone: 'dim' },
      ],
      chips: {
        vanity: { label: 'Métrica de vaidade', value: 'Custo por clique' },
        real: { label: 'Métrica que importa', value: 'Custo por venda' },
      },
      cta: {
        label: 'Quero essa estrutura na minha conta',
        href: buildWaLink('Olá! Vi a anatomia de campanha na página de gestão de Google Ads e quero essa estrutura na minha conta.'),
      },
      note: 'A conta é sua, com acesso total o tempo todo. Sem contrato de fidelidade.',
    },
  },

  audience: {
    eyebrow: 'Para quem é',
    heading: 'Para quem já investe em Google Ads e quer clareza.',
    slides: [
      {
        title: 'Para quem já roda campanha e não sabe se está funcionando.',
        body: 'Negócios que investem em mídia paga mas recebem só um número de "cliques", sem entender quanto isso realmente trouxe de venda.',
        image: '/para-quem-e-lps/10-campanha-sem-metrica.webp',
      },
      {
        title: 'Para quem sente que está pagando caro demais por lead.',
        body: 'Empresas com custo de aquisição subindo mês a mês, sem saber exatamente onde o orçamento está vazando.',
        image: '/para-quem-e-lps/11-caro-por-lead.webp',
      },
      {
        title: 'Para quem quer parar de gerenciar campanha sozinho.',
        body: 'Times pequenos que não têm tempo de acompanhar lance, orçamento e criativo toda semana e sabem que isso tem custo.',
        image: '/para-quem-e-lps/12-gerenciar-campanha.webp',
      },
    ],
  },

  process: {
    eyebrow: 'Como funciona',
    heading: 'Do diagnóstico à campanha otimizada.',
    steps: [
      {
        title: 'Diagnóstico da conta',
        body: 'Analisamos sua conta atual (ou desenhamos do zero): estrutura de campanhas, segmentação e onde o orçamento está sendo mal aproveitado.',
      },
      {
        title: 'Estruturação e lançamento',
        body: 'Campanhas organizadas por intenção de compra, com rastreamento de conversão configurado antes do primeiro real gasto.',
      },
      {
        title: 'Otimização contínua',
        body: 'Ajuste semanal de lances, orçamento e criativos com base em dado real, e relatório mensal explicando cada decisão.',
      },
    ],
    bg: {
      mobile: '/funciona-bg-lp/bg-mobile.webp',
      desktop: '/funciona-bg-lp/bg-desktop.webp',
    },
    cta: { label: 'Começar pelo diagnóstico', href: buildWaLink('Olá! Quero começar pelo diagnóstico gratuito da minha conta de Google Ads.') },
  },

  faq: {
    bg: { mobile: '/bg-faq-institucional-mobile.webp', desktop: '/bg-faq-institucional.webp' },
    items: [
      {
        q: 'Quanto custa a gestão de Google Ads?',
        a: 'Cada conta é orçada pelo escopo: volume de campanhas e complexidade do funil. O diagnóstico gratuito define o escopo antes de qualquer proposta. Não inclui o valor investido em mídia, que vai direto pro Google.',
      },
      {
        q: 'Vocês exigem contrato de fidelidade?',
        a: 'Não. Trabalhamos com transparência total: se o resultado não aparecer, você não fica preso a um contrato longo.',
      },
      {
        q: 'Vocês também criam a landing page da campanha?',
        a: 'A gestão de tráfego é o foco deste serviço, mas também criamos landing pages de alta conversão à parte, caso você precise das duas pontas.',
      },
      {
        q: 'Tenho acesso total à minha conta de anúncios?',
        a: 'Sim, a conta é sua, você tem acesso completo o tempo todo. Nós gerenciamos, você é dono dos dados e do histórico.',
      },
    ],
    cta: { label: 'Perguntar no WhatsApp', href: buildWaLink('Olá! Tenho uma dúvida sobre gestão de Google Ads que não vi no FAQ.') },
  },

  finale: {
    deviceImage: '/lp-institucional/cta-device.webp',
    headline: 'Descubra quanto do seu orçamento de Ads está sendo desperdiçado.',
    body: 'Em até 24 horas, analisamos sua conta atual e mostramos exatamente onde o investimento está vazando. Sem compromisso. Sem script de vendas.',
    cta: { label: 'Solicitar diagnóstico no WhatsApp', href: buildWaLink('Olá. Quero o diagnóstico gratuito da minha conta de Google Ads.') },
    badges: ['Sem compromisso', 'Resposta em até 24h', 'Sem script de vendas'],
  },

  footer: {
    marqueeText: 'RAVENN STUDIO',
    line: 'Gestão de Google Ads · Niterói, RJ',
  },
};
