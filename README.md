# Portfólio Sistema Solar — Fase 1: o Sol

Portfólio de Matheus (Software Engineer, foco em frontend) como um sistema solar 3D navegável. Nesta fase existe só o
**Sol**, que representa a seção "Sobre". O site precisa impressionar visualmente **e** entregar a informação rápido, por isso
todo o conteúdo também é acessível pelo menu "Acesso rápido" e pelo teclado, sem depender do WebGL.

## Como rodar

```bash
pnpm install
pnpm dev            # desenvolvimento em http://localhost:3000
pnpm build && pnpm start
```

| Comando                                                 | O que faz                                                            |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| `pnpm lint` / `pnpm typecheck`                          | ESLint (inclui regra de nomes com 2+ letras) e TypeScript strict     |
| `pnpm test`                                             | Vitest + React Testing Library + `@react-three/test-renderer`        |
| `pnpm test:e2e`                                         | Playwright (builda e serve a versão de produção na porta 3100) + axe |
| `node scripts/screenshot.mjs <nome> [largura] [altura]` | Screenshot de um servidor de produção já rodando                     |
| `node scripts/lighthouse.mjs [mobile\|desktop]`         | Lighthouse no servidor de produção                                   |
| `node scripts/bundle-size.mjs` / `bundle-analyze.mjs`   | Tamanho dos chunks e dono de cada byte (source maps)                 |
| `node scripts/measure-fps.mjs`                          | Frames por segundo em 5 s (WebGL por software: números pessimistas)  |
| `node scripts/optimize-textures.mjs`                    | Converte a textura original (`assets-src/`) em WebP                  |

## Arquitetura

```
src/
  app/                    rotas e layout (Next.js App Router)
  content/                dados: corpos celestes, painel "Sobre", créditos, descrição da cena
  design-system/
    tokens/               tokens (Tailwind v4 @theme + variáveis) e valores usados pela cena
    atoms/                Button, IconButton, Heading, Text, Link, VisuallyHidden
    molecules/            MenuItem, PanelHeader, StackList, AboutSection, SceneKeyboardControls, BodyHint, SceneFallback...
    organisms/            ContentPanel, QuickAccessMenu, PortfolioExperience (orquestra tudo)
  scene/
    atoms/                SunMesh, SunCorona, StarField, SceneLights, SceneEffects, FocusRing, CameraDistance, CameraViewOffset
    molecules/            CelestialBody (malha + interação + textura)
    organisms/            SolarSystemScene, SolarSystemSceneLoader, SceneErrorBoundary
    shaders/              GLSL da superfície e da corona do Sol
  hooks/                  estado e efeitos (interação, foco, movimento reduzido, WebGL, viewport, textura...)
  lib/                    funções puras (rotação, navegação circular, enquadramento de câmera, validação...)
```

Decisões de projeto:

- **Corpos celestes são dados.** `content/celestial-bodies.ts` é uma lista tipada e validada (`lib/celestial-body.ts`). Cena, menu e
  painel leem dessa lista; adicionar um planeta é adicionar um item (e, se for o caso, um tipo de conteúdo em `SectionView`).
- **Lógica fora do JSX.** Regras e matemática estão em `lib/` (testadas com casos de borda: `NaN`, `Infinity`, delta enorme...);
  hooks orquestram; componentes só renderizam.
- **Dependências injetáveis.** Carregador de textura, `matchMedia`, detecção de WebGL e agendador de ociosidade são parâmetros
  com padrão, então os testes não usam mocks globais.
- **Conteúdo antes da cena.** HTML do menu/painel é renderizado no servidor; o bundle 3D (~230 KB gzip) carrega depois, quando o
  navegador está ocioso, e o pós-processamento em um chunk ainda mais tardio.
- **Acessibilidade.** Cada corpo tem um botão real (invisível) para teclado e leitores de tela; o foco aparece como anel 3D; o
  painel é um diálogo modal com trap de foco, `Esc`, clique fora e devolução de foco; o canvas tem alternativa textual; axe
  passa nos e2e (fechado, aberto, menu expandido e fallback).
- **Movimento reduzido.** Sem rotação, sem plasma animado, destaque instantâneo, sem inércia da câmera e transições zeradas
  (inclusive se a preferência mudar com o site aberto). O loop de render vira "sob demanda".
- **Falhas.** Sem WebGL, erro na cena ou perda de contexto: aparece um aviso com botões para as seções, e o menu continua
  funcionando.

Veja `DECISIONS.md` (versões, React Compiler, Tailwind, pin do `three`), `PROGRESS.md` (histórico, métricas, próxima fase) e
`CREDITS.md` (textura do Sol: Solar System Scope, CC BY 4.0, com crédito visível no painel).
