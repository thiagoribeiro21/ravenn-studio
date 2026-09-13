# AGENTS.md — Revana Studio

Regras de arquitetura e operação para qualquer agente de IA (Claude Code, Codex,
Cursor, etc.) trabalhando neste repositório. Leia isto antes de tocar em código.
Para o estado atual do trabalho (o que já foi feito, o que falta), leia
`memoria.md` — este arquivo aqui é sobre **como** trabalhar, não **o que** está
em andamento.

## O que é este projeto

Site institucional + 6 landing pages da Revana Studio (agência de web design em
Niterói/RJ). Multi-page build via Vite — **não é um SPA com router**: cada
página é um entry point HTML separado, cada um bootando sua própria árvore
React independente.

## Stack

- React 18.3 + Vite 5.4 (`@vitejs/plugin-react`) — sem TypeScript, JSX puro.
- Tailwind CSS 3.4 (+ postcss/autoprefixer) — tokens de design em
  `tailwind.config.js` (`rv-void`, `rv-titanium`, `rv-purple`, `rv-slate`,
  `rv-faint`, etc.), classes utilitárias, quase nada de CSS solto além de
  `src/index.css`.
- framer-motion, GSAP (+ ScrollTrigger), Lenis (smooth scroll) — animação.
- Three.js + `@react-three/fiber` + `@react-three/drei` — canvases 3D
  (`ThreeServicesCanvas`, `PillarsCanvas`, `CTACanvas`, `ScrollSequenceCanvas`).
- Sem framework de testes configurado. Sem router (o roteamento é
  `vite.config.js` multi-entry + rewrites em `vercel.json`).

## Arquitetura: os três "sites" que este repo hospeda

1. **Home** (`index.html` → `src/main.jsx` → `src/App.jsx`/`SiteShell`) — SPA de
   página única, scroll via `data-scroll-content`, chrome próprio
   (`Navbar`/`MenuPanel`/`Footer` em `src/components/`).
2. **6 LPs de tráfego pago** (`*.html` na raiz, ex. `landing-pages.html`) →
   `src/lp-*.jsx` → `src/pages/LP*.jsx` → `src/lp/LPShell.jsx`. `noindex,
   follow`. Chrome PRÓPRIO (header/footer distintos da home), scroll via
   `data-lp-scroller` + Lenis.
3. **6 subpáginas indexáveis** `/solucoes/*.html` → `src/solucao-*.jsx` →
   `src/pages/Solucao*.jsx` → `src/lp/SolutionPageShell.jsx`. `index, follow`.
   MESMAS seções/config das LPs de Ads, mas dentro do header/footer da HOME
   (`Navbar`/`Footer` reaproveitados). Existe pra quem chega organicamente ter
   uma página de serviço completa e indexável, sem duplicar conteúdo.

Todas as 6 seções de LP (`ScrubStatement`, `PillarsShaped`, `TargetAudienceCarousel`
etc., em `src/lp/sections/`) são **genéricas e movidas a dados** — cada serviço
tem seu próprio arquivo em `src/lp/config/*.js` (ex. `landing-pages.js`), e
tanto `LPShell.jsx` quanto `SolutionPageShell.jsx` passam esse config pras
mesmas seções. Mudar o conteúdo de UM serviço = editar o `config`, não o
componente. Mudar o COMPORTAMENTO de uma seção pra um serviço específico = novo
campo OPCIONAL no config, com fallback pro valor antigo — nunca hardcode algo
que só vale pra um dos 6.

### Regra crítica: `isHomePage()`

`Navbar.jsx` e `Footer.jsx` renderizam tanto na home quanto nas 6 páginas
`/solucoes/`. Um anchor hardcoded (`#hero`, `#contact`, `#services`, `#faq`)
só existe de fato na home — fora dela, o clique fica mudo. Qualquer link
desses precisa passar por `src/utils/isHomePage.js`: na home o anchor cru
funciona; fora dela, prefixa com `/` (`/#contact`) pro browser navegar pra
home primeiro. Ao adicionar QUALQUER componente compartilhado entre home e
`/solucoes/`, verifique se ele tem esse tipo de link antes de assumir que
"funciona igual nos dois lugares".

### Hubs compartilhados (confirmados via grafo, ver seção Graphify abaixo)

- `src/lp/config/_base.js` — `prefersReducedMotion()`, `isSlowConnection()`,
  `getScrollerEl()`, `buildWaLink()`, `NOISE_URI`, `EASE_LUXE`, `GX`, `TYPE`,
  `SECTION_PAD`. É o nó mais conectado do grafo (36 edges) — qualquer seção
  nova de LP provavelmente vai importar daqui.
- `src/context/MenuContext.jsx` (`useMenu()`) — ponte entre `SiteShell`
  (home) e `SolutionPageShell` (subpáginas); 17 edges, é o segundo maior hub.
- `src/utils/services.js` — lista canônica dos 6 serviços (`slug`/`label`).
  Usada por `Footer.jsx`, `MenuPanel.jsx`, `RelatedServices.jsx`. Antes cada
  um tinha sua própria cópia e uma delas (`Footer.jsx`) ficou desatualizada —
  se precisar adicionar/renomear um serviço, mexa SÓ aqui.

### Código morto conhecido (confirmado, não é achismo)

`styles.css`, `tokens/*.css`, `ui_kits/`, `reference/`, `_ds_bundle.js` na raiz
NÃO fazem parte do build (`vite.config.js` não os referencia, e o app real usa
`src/index.css`, não `styles.css`). O único ponto que importa `tokens/` é
`ui_kits/website/index.html`, que também não é um entry point. Não assuma que
esses arquivos são "a fonte de verdade" de nada — são sobra. Confirme com
`git ls-files` + os `input` de `vite.config.js` antes de reviver algo daqui.
(Estão listados em `.graphifyignore` por isso — não poluem o grafo.)

## Navegação: use o Graphify antes de fazer busca genérica

Este repo tem o [Graphify](https://github.com/Graphify-Labs/graphify)
instalado (`pip install --user graphifyy`, binário em
`~/AppData/Roaming/Python/Python313/Scripts` — não está no PATH por padrão,
exporte antes de usar). Ele já rodou uma extração AST (`--code-only`, sem
LLM/API key) do código real do projeto, ignorando `.claude/`, `node_modules/`,
`dist/` e a sobra descrita acima (ver `.graphifyignore`).

**Antes de ler dezenas de arquivos ou fazer `grep` genérico pra entender
"quem usa X" ou "o que depende de Y", consulte o grafo primeiro:**

```bash
export PATH="$PATH:/c/Users/thiag/AppData/Roaming/Python/Python313/Scripts"

graphify god-nodes .                         # hubs mais conectados do repo
graphify query . "quem usa useMenu?"         # busca por BFS no grafo
graphify explain . "SolutionPageShell"       # explica um nó e seus vizinhos
graphify path . "Footer" "isHomePage"        # caminho mais curto entre dois nós
```

Saída fica em `graphify-out/` (`graph.json`, `graph.html` interativo,
`GRAPH_REPORT.md`). **Depois de qualquer mudança estrutural** (novo
arquivo, import novo, componente removido), rode:

```bash
graphify update . --force   # re-extrai só o que mudou, sem LLM, sem custo
```

Isso mantém o grafo confiável pro próximo agente (ou pra você, na próxima
sessão) sem precisar reconstruir do zero. `graphify-out/` **não deve** ser
commitado — é derivado, regenerável a qualquer momento (ver `.gitignore`).
Não rodei `graphify install` (o passo que registra Graphify como skill/hook
do assistente, fora deste repo) — isso é uma decisão separada, pergunte ao
usuário se quiser habilitar.

## Padrões de código (observados no repo, não inventados)

- Comentários em português, só quando explicam um PORQUÊ não-óbvio (bug real
  já visto, restrição de ordem de render, decisão que parece estranha sem
  contexto). Não comente o óbvio.
- Estilo inline (`style={{...}}`) convive com classes Tailwind — o repo não é
  100% um ou outro. Siga o padrão já usado no arquivo que está editando em vez
  de impor um dos dois.
- `alt=""` + `aria-hidden` no pai = decorativo, intencional. `alt` com texto
  real = a imagem carrega informação (ver `TargetAudienceCarousel.jsx`,
  `ManifestoSection.jsx`). Não troque um pelo outro sem checar o contexto.
- Contraste: `rv-faint` (#5B6472) sobre `rv-void` (#03000A) ≈ 3.7:1 — passa
  AA só pra "large text" (≥24px regular / ≥18.66px bold; WCAG 3:1), falha pra
  texto normal (WCAG 4.5:1). Antes de "corrigir" um uso de `rv-faint`, meça o
  tamanho real do texto renderizado — não troque por reflexo.

## Verificação antes de dar tarefa por concluída

1. `npx vite build` — precisa compilar limpo (15 entry points, ver
   `vite.config.js`).
2. Mudança visual/funcional: instale Playwright temporariamente
   (`npm install --no-save playwright@1.62.1`), suba `vite preview` em
   background, rode um script `.cjs` descartável em vez de confiar só no
   build. Ao terminar: apague o script, mate o processo do preview,
   `npm uninstall playwright`, `rm -rf dist`, confira `git status --short`.
   Não deixe esses artefatos no repo.

## Pilar 2 — Observabilidade e Lint (status)

Ainda **não configurados** neste repo (pendente de aprovação do usuário,
ver `memoria.md` pra status atual e plano):
- Biome (format + lint, substituindo ESLint/Prettier)
- Knip (dead-code/dependências órfãs — vai provavelmente confirmar o achado
  de `styles.css`/`tokens/`/`ui_kits/`/`reference/` acima)
- Commitlint (padronizar mensagens de commit — hoje o histórico é solto,
  em PT-BR, sem convenção formal, ex. "Atualizando LPs")
- Observabilidade client-side leve (erro + analytics, sem APM pesado — o
  projeto é PageSpeed-first, nada que bloqueie a main thread)

Quando esses forem instalados, código novo/alterado precisa passar nos
contratos deles sem exceção — mas até lá, não existe enforcement automático.
