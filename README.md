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
  app/                    rotas e layout (Next.js App Router); só compõe features
  content/                dados: corpos celestes, painel "Sobre", créditos, descrição da cena
  design-system/          UI compartilhada
    tokens/               tokens (Tailwind v4 @theme + variáveis) e valores usados pela cena
    atoms/                Button, IconButton, Input, Textarea, Heading, Text, Label, Link, PlanetDot, ícones, VisuallyHidden
  features/
    solar-scene/          cena 3D: components/ (Sol, corona, estrelas, câmera...), hooks/, lib/, shaders/, constants.ts
    content-panel/        painel modal: components/, sections/ (about, contact + formulário), hooks/, lib/
    quick-access-menu/    menu orbital + orbit-layout (função pura)
    portfolio/            composição: PortfolioExperience, fallback, dica, controles de teclado
  services/               entrega da mensagem de contato (interface ContactDelivery; hoje um placeholder)
  hooks/                  hooks usados por 2+ features (navegação por setas, ociosidade do navegador)
  lib/                    domínio e utilitários usados por 2+ features (corpo celeste, interaction-state, join-class-names...)
```

**Como decidimos onde cada arquivo mora** (colocation, como recomendam a documentação do Next.js e o bulletproof-react): o que só uma
feature usa fica dentro dela; só sobe para `lib/`, `hooks/` ou `design-system/` quando duas ou mais features usam. O ESLint impõe o sentido
das dependências: compartilhado não importa de features, uma feature não importa de outra (só `portfolio` compõe, pelo `index.ts` público)
e nada importa de `app/`.

Decisões de projeto:

- **Câmera e órbitas.** A câmera gira em torno do Sol até o corpo focado ou selecionado (Tab, setas, clique, menu), para que ele nunca
  fique atrás do Sol; os planetas continuam orbitando com o painel aberto (só `prefers-reduced-motion` pausa a cena).
- **Formulário de contato.** react-hook-form + zod; o mesmo schema (`lib/contact-message.ts`) valida no navegador e na Server Action
  (`app/actions.ts`). A entrega é um placeholder que descarta a mensagem: implemente `ContactDelivery` (`services/contact.ts`) e troque em `app/actions.ts`.
- **Planetas são dados.** Mercúrio (a seção "Contato") é só um item em `content/celestial-bodies.ts` com `kind: 'planet'` e uma `orbit`; a cena
  desenha a órbita, o planeta e o enquadramento a partir disso.
- **Corpos celestes são dados.** `content/celestial-bodies.ts` é uma lista tipada e validada (`lib/celestial-body.ts`). Cena, menu e
  painel leem dessa lista; adicionar um planeta é adicionar um item (e, se for o caso, um tipo de conteúdo em `SectionView`).
- **Lógica fora do JSX.** Regras e matemática estão em `lib/` (testadas com casos de borda: `NaN`, `Infinity`, delta enorme...);
  hooks orquestram; componentes só renderizam.
- **Dependências injetáveis.** Carregador de textura, `matchMedia`, detecção de WebGL e agendador de ociosidade são parâmetros
  com padrão, então os testes não usam mocks globais.
- **Conteúdo antes da cena.** HTML do menu/painel é renderizado no servidor; o bundle 3D (~230 KB gzip) carrega depois, quando o
  navegador está ocioso, e o pós-processamento em um chunk ainda mais tardio.
- **Menu orbital.** Os destinos do "Acesso rápido" entram em órbita em um arco (`lib/orbit-layout.ts`, puro e testado); fechado, ficam `inert` e `aria-hidden`; com movimento reduzido viram só um fade.
- **Acessibilidade.** Cada corpo tem um botão real (invisível) para teclado e leitores de tela; o foco aparece como anel 3D; o
  painel é um diálogo modal com trap de foco, `Esc`, clique fora e devolução de foco; o canvas tem alternativa textual; axe
  passa nos e2e (fechado, aberto, menu expandido e fallback).
- **Movimento reduzido.** Sem rotação, sem plasma animado, destaque instantâneo, sem inércia da câmera e transições zeradas
  (inclusive se a preferência mudar com o site aberto). O loop de render vira "sob demanda".
- **Falhas.** Sem WebGL, erro na cena ou perda de contexto: aparece um aviso com botões para as seções, e o menu continua
  funcionando.

Veja `DECISIONS.md` (versões, React Compiler, Tailwind, pin do `three`), `PROGRESS.md` (histórico, métricas, próxima fase) e
`CREDITS.md` (textura do Sol: Solar System Scope, CC BY 4.0, com crédito visível no painel).
