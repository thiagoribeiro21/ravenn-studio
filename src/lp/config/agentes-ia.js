import { buildWaLink } from './_base';

/* ══════════════════════════════════════════════════════════════════════
   Conteúdo da LP /agentes-ia — segundo clone do molde de
   sites-institucionais.js. Serviço: Agentes de IA e Automação de
   Atendimento via WhatsApp. Conversão única via WhatsApp, mesmo padrão
   das demais LPs desta família.

   ── Assets ────────────────────────────────────────────────────────────
   Hero, CTA final e os fundos de "Como Funciona"/FAQ reaproveitam os
   arquivos de sites-institucionais.js (mesmo critério aplicado em
   landing-pages.js). Os 3 posters de Conceitos já são imagens finais em
   `/conceitos-agente-ia/` (geradas a partir dos prompts do relatório de
   assets). `src` de cada item ainda aponta pra um .mp4 que não existe de
   propósito — sem vídeo real, o poster fica visível o tempo todo, então
   nada quebra até a gravação real substituir o mockup. As 3 fotos de
   público continuam pendentes, com placeholder em `/placeholder-agentes-ia/`.
   ══════════════════════════════════════════════════════════════════════ */

const LOGO_H = '/logo-ravenn/logo-ravenn-studio-horizontal.webp';
const PH = '/placeholder-agentes-ia';

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
      'Olá! Vim pela página de agentes de IA e gostaria de agendar um diagnóstico gratuito.',
    ),
  },

  hero: {
    eyebrow: 'Agentes de IA para WhatsApp com atendimento 24h',
    headlineLines: ['Às 3 da manhã, alguém pediu orçamento.', '_Quem respondeu?_'],
    subheadline:
      'Agentes de IA treinados no seu negócio respondem, qualificam e agendam pelo WhatsApp, 24 horas por dia, sem fila, sem lead esquecido.',
    deviceImages: {
      desktop: '/lp-institucional/hero-device.webp',
      mobile: '/lp-institucional/hero-device-mobile.webp',
    },
    ctaPrimary: {
      label: 'Solicitar diagnóstico gratuito',
      href: buildWaLink('Olá! Vi a página de agentes de IA da Ravenn e quero o diagnóstico gratuito.'),
    },
    ctaSecondary: {
      label: 'Falar agora no WhatsApp',
      href: buildWaLink('Olá! Vim pela página de agentes de IA e quero falar agora.'),
    },
    stats: [
      { big: '24h', label: 'de atendimento automático, todos os dias' },
      { big: '7 dias', label: 'úteis até o agente estar treinado' },
      { big: '100%', label: 'integrado ao seu WhatsApp Business' },
    ],
    scarcity: {
      line1: 'Diagnóstico gratuito',
      line2: 'Sem compromisso',
      cta: { label: 'Falar no WhatsApp', href: buildWaLink('Olá! Vi a página de agentes de IA e quero falar com vocês.') },
    },
  },

  scrub: {
    headlineTokens: [
      'Todo', { glyph: 'concentric' }, 'lead', 'sem', { br: true },
      'resposta', { glyph: 'ring' }, { br: true },
      'vira', 'cliente', 'do', { glyph: 'cross' }, { persist: true, glyph: 'diamond', text: 'concorrente.' },
    ],
    paragraph:
      'Enquanto ninguém responde, o cliente já mandou a mesma pergunta pro concorrente ao lado. Não é falta de interesse: é falta de resposta a tempo. E isso se perde às 3 da manhã com a mesma frequência que às 15h de uma terça.',
  },

  consequence: {
    eyebrow: 'O que acontece com quem não responde rápido',
    headlineLines: ['O cliente mandou mensagem.', '_Ninguém respondeu a tempo._'],

    lossLabel: 'Atendimento manual',
    lossCaption:
      'Fora do horário comercial, no fim de semana, na hora do almoço: a mensagem fica esperando. Quando alguém responde, o cliente já resolveu com outra empresa.',
    ghosts: ['Sem resposta em 40 minutos', 'Foi para o concorrente', 'Desistiu de esperar'],
    emptyState: 'Nenhuma mensagem nova',

    gainLabel: 'Padrão Ravenn',
    gainCaption:
      'O agente responde no primeiro minuto, qualquer hora do dia. Quando sua equipe chega, o lead já está qualificado, só falta fechar.',
    chats: [
      { name: 'Marcelo A.', preview: 'Vocês atendem final de semana?', time: '02:14' },
      { name: 'Juliana P.', preview: 'Perfeito, obrigada pela resposta rápida!', time: '01:52' },
      { name: 'Vinícius T.', typing: true, time: '23:47' },
      { name: 'Camila D.', preview: 'Qual o horário de vocês amanhã?', time: '22:30' },
      { name: 'Bruno S.', preview: 'Adorei o atendimento, já quero fechar', time: '21:58' },
      { name: 'Larissa M.', preview: 'Vi o anúncio, ainda tem vaga?', time: '20:41' },
    ],

    cta: {
      label: 'Quero meu agente respondendo 24h',
      href: buildWaLink('Olá! Vi a página de agentes de IA e quero um agente respondendo meu WhatsApp 24h.'),
    },
  },

  /* `gaugeLabel: 'RESPOSTA'` — o ícone de performance do BentoValue tinha
     o texto "PAGESPEED" fixo no SVG (bloqueador de reuso corrigido nesta
     mesma leva: agora é uma prop, com 'PAGESPEED' como default pras LPs
     que já usavam). Aqui o mesmo desenho (medidor que preenche) passa a
     ler como "taxa de resposta" — a mecânica visual é idêntica, só o
     rótulo muda pro que faz sentido neste serviço. */
  bento: {
    cells: [
      {
        key: 'resposta',
        title: 'Resposta no primeiro minuto, sempre',
        body: 'O agente responde assim que a mensagem chega: de dia, de madrugada, feriado. Sem fila, sem lead esfriando.',
        mockup: 'pagespeed',
        gaugeLabel: 'RESPOSTA',
        pill: '~1 min',
      },
      {
        key: 'qualificacao',
        title: 'Fluxo pensado pra qualificar sozinho',
        body: 'O agente segue um roteiro de perguntas que separa curioso de cliente pronto pra comprar, sem intervenção manual.',
        mockup: 'wireframe',
        pill: 'Qualificação automática',
      },
      {
        key: 'treinamento',
        title: 'Treinado no seu negócio, não genérico',
        body: 'Respostas no tom da sua marca, com as informações certas do seu produto ou serviço, não um robô que erra a pergunta simples.',
        mockup: 'target',
        pill: 'Sob medida',
      },
      {
        key: 'disponibilidade',
        title: 'Atendimento que nunca dorme',
        body: 'Mensagem recebida, qualificada e respondida, mesmo às 3 da manhã, mesmo no feriado.',
        mockup: 'whatsapp',
        pill: '24/7',
        accent: '#25D366',
      },
    ],
  },

  concepts: {
    eyebrow: 'Cada objetivo, um fluxo de conversa',
    heading: 'Um agente de IA não improvisa. Ele segue um roteiro.',
    intro:
      'Três fluxos autorais que aplicamos conforme o objetivo do atendimento. Não são clientes: é o padrão exato de roteiro e qualificação que usamos quando o agente é seu.',
    items: [
      {
        nicho: 'Qualificação de Leads · Vendas',
        src: `${PH}/concept-qualificacao-placeholder.mp4`,
        poster: '/conceitos-agente-ia/qualificacao-de-leads.webp',
        pain: 'Nem todo contato no WhatsApp está pronto pra comprar, atender todo mundo do mesmo jeito desperdiça tempo do seu time.',
        solution:
          'O agente pergunta, filtra e só entrega ao seu time o lead que já demonstrou intenção real de compra.',
        wa: buildWaLink('Olá! Vi o conceito de qualificação de leads na página de agentes de IA e quero esse padrão no meu atendimento.'),
      },
      {
        nicho: 'Agendamento Automático · Serviços',
        src: `${PH}/concept-agendamento-placeholder.mp4`,
        poster: '/conceitos-agente-ia/agendamento-automatico.webp',
        pain: 'Marcar horário por mensagem manual trava a agenda inteira num vaivém de "pode às 14h? e às 15h?".',
        solution:
          'O agente consulta sua disponibilidade e fecha o agendamento sozinho, sem trocar uma única mensagem com você.',
        wa: buildWaLink('Olá! Vi o conceito de agendamento automático na página de agentes de IA e quero esse padrão no meu atendimento.'),
      },
      {
        nicho: 'Suporte Pós-venda · Recorrência',
        src: `${PH}/concept-suporte-placeholder.mp4`,
        poster: '/conceitos-agente-ia/suporte-pos-venda.webp',
        pain: 'Cliente que já comprou também manda mensagem, e cada uma que demora vira risco de reputação.',
        solution:
          'O agente responde dúvidas recorrentes na hora e escala pro seu time só o que realmente precisa de humano.',
        wa: buildWaLink('Olá! Vi o conceito de suporte pós-venda na página de agentes de IA e quero esse padrão no meu atendimento.'),
      },
    ],
  },

  pillars: {
    declarationLines: [
      { text: 'Um agente que responde', tone: 'bright' },
      { text: 'como alguém do seu time,', tone: 'dim' },
      { text: 'não como um robô genérico.', tone: 'dim' },
    ],
    labels: ['Treinado no seu negócio', 'Qualificação automática', 'Integração com CRM', 'Disponível 24/7'],
  },

  audience: {
    eyebrow: 'Para quem é',
    heading: 'Para quem não pode perder lead por falta de resposta.',
    slides: [
      {
        title: 'Para quem recebe mensagem fora do horário comercial.',
        body: 'Negócios com fluxo de WhatsApp alto que não têm equipe disponível 24h e perdem cliente pra quem responde primeiro.',
        image: '/para-quem-e-lps/04-mensagem-fora-horario.webp',
      },
      {
        title: 'Para quem repete as mesmas perguntas todo dia.',
        body: 'Times que gastam hora do dia respondendo "qual o valor", "vocês atendem tal bairro": perguntas que um agente treinado resolve sozinho.',
        image: '/para-quem-e-lps/05-repete-perguntas.webp',
      },
      {
        title: 'Para quem trata atendimento como parte da operação, não extra.',
        body: 'Quem entende que cada minuto de demora numa resposta é uma chance a mais do cliente desistir ou procurar o concorrente.',
        image: '/para-quem-e-lps/06-atendimento-operacao.webp',
      },
    ],
  },

  process: {
    eyebrow: 'Como funciona',
    heading: 'Do briefing ao agente respondendo em 7 dias úteis.',
    steps: [
      {
        title: 'Briefing e roteiro',
        body: 'Mapeamos as perguntas mais comuns do seu negócio e desenhamos o roteiro de qualificação com você.',
      },
      {
        title: 'Treinamento e testes',
        body: 'O agente é treinado com as informações do seu negócio e testado em cenários reais antes de ir ao ar.',
      },
      {
        title: 'Integração e lançamento',
        body: 'Conectado ao seu WhatsApp Business, com handoff pro seu time configurado pros casos que precisam de humano.',
      },
    ],
    bg: {
      mobile: '/funciona-bg-lp/bg-mobile.webp',
      desktop: '/funciona-bg-lp/bg-desktop.webp',
    },
    cta: { label: 'Começar pelo briefing', href: buildWaLink('Olá! Quero começar meu agente de IA pelo briefing gratuito.') },
  },

  faq: {
    bg: { mobile: '/bg-faq-institucional-mobile.webp', desktop: '/bg-faq-institucional.webp' },
    items: [
      {
        q: 'Quanto custa um agente de IA para WhatsApp?',
        a: 'Cada projeto é orçado pelo escopo: volume de mensagens, integrações e complexidade do roteiro. O diagnóstico gratuito define o escopo antes de qualquer proposta.',
      },
      {
        q: 'Em quanto tempo o agente fica pronto?',
        a: '7 dias úteis entre o briefing e o lançamento, incluindo testes em cenários reais antes de ir ao ar.',
      },
      {
        q: 'O agente substitui meu time de atendimento?',
        a: 'Não, ele filtra e qualifica, e transfere pro seu time exatamente os casos que precisam de uma pessoa. A ideia é tirar o repetitivo do caminho, não substituir quem fecha negócio.',
      },
      {
        q: 'Funciona no meu número de WhatsApp atual?',
        a: 'Sim, a integração usa a WhatsApp Business API conectada ao seu número, sem precisar trocar de aparelho ou linha.',
      },
    ],
    cta: { label: 'Perguntar no WhatsApp', href: buildWaLink('Olá! Tenho uma dúvida sobre agentes de IA que não vi no FAQ.') },
  },

  finale: {
    deviceImage: '/lp-institucional/cta-device.webp',
    headline: 'Descubra quantos leads seu atendimento está perdendo.',
    body: 'Em até 24 horas, analisamos seu fluxo de mensagens e mostramos exatamente onde um agente de IA recuperaria leads perdidos. Sem compromisso. Sem script de vendas.',
    cta: { label: 'Solicitar diagnóstico no WhatsApp', href: buildWaLink('Olá. Quero o diagnóstico gratuito do meu atendimento.') },
    badges: ['Sem compromisso', 'Resposta em até 24h', 'Sem script de vendas'],
  },

  footer: {
    marqueeText: 'RAVENN STUDIO',
    line: 'Agentes de IA para WhatsApp · Niterói, RJ',
  },
};
