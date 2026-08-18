# memoria.md — Bloco de notas vivo

Leia isto **antes** de sugerir ou escrever qualquer linha de código. Regras de
arquitetura/stack/padrões ficam em `AGENTS.md` (estático) — aqui é só estado:
o que já foi feito, o que está em andamento, o que vem a seguir. Atualize a
cada ~10% de evolução do escopo ou ao concluir uma tarefa.

Última atualização: 2026-08-18.

## Estado atual

Pilares 1 e 2 configurados e funcionando (build limpo, hooks testados). Duas
decisões ficaram explicitamente para o usuário (não executadas
unilateralmente — ver "Aguardando decisão" abaixo).

## Concluído

### Pilar 2 — Observabilidade e lint (2026-08-18)
- [x] **Biome** (`@biomejs/biome@2.5.9`) — `biome.json` na raiz (2 espaços,
  aspas simples, `;` sempre, `files.includes` excluindo `.claude/`,
  `reference/`, `ui_kits/`, `graphify-out/`, `_ds_bundle.js`). Scripts
  `npm run lint` / `npm run format`. Rodei `--write` (fixes seguros: format +
  organize-imports) em todo o repo — reformatou ~101 arquivos, sem mudança de
  comportamento. Restam **112 erros + 9 warnings pré-existentes** que exigem
  julgamento, não são formatação — ver "Backlog de lint" abaixo. NÃO tentei
  corrigir isso em massa (`--write --unsafe`) sem revisão.
- [x] **Knip** (`knip`) — `knip.json` com os 15 entry points reais (mapeados
  um a um pelo `<script type="module" src>` de cada `.html`, porque o plugin
  Vite do Knip não resolveu o multi-entry sozinho — tentei zero-config
  primeiro, deu falso-positivo maciço). `npm run knip`. Achados **conferidos
  manualmente via grep antes de confiar** (ver Backlog abaixo).
- [x] **Commitlint** (`@commitlint/cli` + `@commitlint/config-conventional`)
  + **Husky** — `commitlint.config.js` (Conventional Commits estrito, decisão
  do usuário). `.husky/commit-msg` roda o commitlint; `.husky/pre-commit`
  roda `biome check .` (bônus — não pedido explicitamente, mas é a forma
  natural de aplicar "nenhum código pode ferir os contratos das
  ferramentas"). Testado: mensagem solta tipo "Atualizando LPs" é rejeitada,
  `chore: ...` passa.
  - **Isso muda o fluxo de commit a partir de agora**: todo commit precisa
    de prefixo Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`,
    etc.) ou o hook barra. Primeiro commit depois de hoje provavelmente vai
    esbarrar nisso.
- [x] **Observabilidade de erros** — beacon próprio, zero dependência:
  `public/error-beacon.js` (`window.onerror` + `unhandledrejection` →
  `navigator.sendBeacon`) carregado via `<script defer>` nos 15 HTML
  (inserido antes de `</head>` em cada um). `api/log-error.js` (Vercel
  serverless function) recebe e loga via `console.error` — visível em
  `vercel logs` / dashboard do Vercel. Sem serviço terceiro, sem alerta
  configurado (Slack/email) — se quiser isso, é um passo futuro. Testado com
  Playwright: script carrega (200), dispara em erro síncrono E em
  unhandledrejection, POST chega em `/api/log-error`.
- [x] Analytics (Plausible/Fathom/GA4) — **não decidido, não implementado**.
  Fica pra quando o usuário escolher.

### Pilar 1 — Memória e navegação (2026-08-17)
- [x] Graphify instalado (`pip install --user graphifyy`, PyPI `graphifyy`,
  não é pacote npm). Binário fora do PATH — exportar
  `~/AppData/Roaming/Python/Python313/Scripts` antes de usar.
- [x] `.graphifyignore` — exclui `.claude/` (~95MB de terceiros) + código
  morto confirmado.
- [x] Extração inicial: `graphify extract . --code-only` (98 arquivos, 418
  nós, 771 edges) + `graphify cluster-only . --no-label` (27 comunidades).
  `graphify-out/` gitignored.
- [x] `graphify install` (registro no assistente) **não rodado** — só modo
  de extração, por escolha do usuário.
- [x] `AGENTS.md` criado.

### Sessão anterior — SEO/A11y (2026-08-17, antes do Pilar 1/2)
Trabalho de SEO técnico + acessibilidade em 4 frentes (título/meta/canonical,
imagens/alt, links internos, semântica/aria) entregue e verificado. Destaques
que importam pra continuidade: `src/utils/services.js` e
`src/utils/isHomePage.js` são utilitários compartilhados novos;
`src/lp/sections/RelatedServices.jsx` é novo, montado só em
`SolutionPageShell.jsx`.

## Backlog de lint/dead-code (achados reais, aguardando priorização)

### Biome — 112 erros + 9 warnings pré-existentes (não são bugs novos)
Por regra (contagem após os fixes seguros):
`useValidAnchor` (27, quase tudo em `public/portfolio-heroes/*.html` —
`href="#"` decorativo dentro de mockups de portfólio em iframe, prioridade
baixa), `noArrayIndexKey` (25), `noSvgWithoutTitle` (23), `useButtonType` (8),
`useExhaustiveDependencies` (15, hooks do React — cuidado real, pode
esconder bug de closure obsoleta), `useIterableCallbackReturn` (4),
`noStaticElementInteractions` (4), `noImportantStyles` (5, warning),
`noUnknownAtRules` (3), `noAssignInExpressions` (1), `noCommentText` (1),
`useSemanticElements` (1), `noUnusedVariables` (3, warning).
Não toquei nisso — são mudanças de comportamento/semântica, não formatação.

### Knip — conferido manualmente, achados reais
- **4 arquivos genuinamente órfãos** (nenhum import em lugar nenhum,
  confirmado por grep): `src/lp/primitives/BeamSweep.jsx`,
  `DeviceFrame.jsx`, `ScrubWords.jsx`, `ShapedMedia.jsx`.
  ⚠️ **Correção de algo que eu disse antes nesta sessão**: no trabalho de
  SEO/A11y de ontem eu decidi deliberadamente não mexer no contraste de
  `ScrubWords.jsx` achando que ele renderizava o headline scrubado ao vivo
  (via `ScrubStatement.jsx`). Isso estava errado — `ScrubStatement.jsx`
  importa `Glyph`, não `ScrubWords`. O componente nunca é renderizado. Não
  teve consequência prática (decisão de não mexer valia de qualquer jeito),
  mas o raciocínio que usei pra justificar tava errado.
- **1 dependência não usada**: `@react-three/drei` (confirmado, nenhum
  import em `src/**`).
- **5 exports desnecessários** (usados só dentro do próprio arquivo, não
  precisam de `export`): `isIntroDone` (`introStore.js`), `WA_PHONE`,
  `SPRING_LUXE`, `getScrollerEl`, `clamp01` (todos em `_base.js`).
- Confirma o que já sabíamos: `styles.css`/`tokens/`/`ui_kits/`/`reference/`/
  `_ds_bundle.js` continuam fora do grafo de imports real (não entraram no
  escopo do Knip porque já estavam fora de `project` no `knip.json`, mas a
  extração do Graphify já tinha confirmado isso independentemente).

## Decisões do usuário (resolvidas em 2026-08-18)

1. **Dead code** — deletados `src/lp/primitives/{BeamSweep,DeviceFrame,
   ScrubWords,ShapedMedia}.jsx` (`git rm -f`, tinham modificação local do
   Biome) + `npm uninstall @react-three/drei`. `styles.css`/`tokens/`/
   `ui_kits/`/`reference/`/`_ds_bundle.js` **mantidos por enquanto**
   (decisão explícita: podem ser material de referência) — continuam fora
   do build real, documentados em `AGENTS.md`. Verificado depois: `vite
   build` limpo, `knip` só mostra os 5 "unused exports" internos (esperado),
   `graphify update . --force` rodado (501 nós, 851 edges, 31 comunidades —
   subiu porque contabilizou os arquivos novos de hoje: `api/log-error.js`,
   `public/error-beacon.js`, `knip.json`, `commitlint.config.js`,
   `biome.json`).
2. **Backlog de lint do Biome (121 achados)** — fica pra depois. O gate do
   `pre-commit` já impede código NOVO de piorar isso.
3. **Analytics** — segue não decidido/não implementado.

## Aguardando decisão do usuário

Nenhuma pendência aberta no momento.

## Próximos passos

1. Depois de qualquer mudança estrutural relevante (deleção dos órfãos
   inclusive), rodar `graphify update . --force` pra manter `graphify-out/`
   fresco.
2. Primeiro commit depois de hoje vai precisar seguir Conventional Commits —
   avisar se o hook barrar algo inesperado.
