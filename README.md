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

Para o formulário de contato enviar e-mail, copie `.env.example` para `.env.local` e preencha `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` e
`CONTACT_TO_EMAIL` (na Vercel, em _Environment Variables_). Para trabalhar sem enviar nada, use `CONTACT_DELIVERY=disabled`: a mensagem é aceita e
descartada. Sem as variáveis e sem esse valor, o envio falha de propósito e o servidor registra quais variáveis faltam.

| Comando                                                 | O que faz                                                                                                                    |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` / `pnpm typecheck`                          | ESLint (inclui regra de nomes com 2+ letras) e TypeScript strict                                                             |
| `pnpm test`                                             | Vitest + React Testing Library + `@react-three/test-renderer`                                                                |
| `pnpm test:e2e`                                         | Playwright (builda e serve a versão de produção na porta 3100) + axe; roda só localmente, o CI não o executa (veja `ci.yml`) |
| `node scripts/screenshot.mjs <nome> [largura] [altura]` | Screenshot de um servidor de produção já rodando                                                                             |
| `node scripts/lighthouse.mjs [mobile\|desktop]`         | Lighthouse no servidor de produção                                                                                           |
| `node scripts/bundle-size.mjs` / `bundle-analyze.mjs`   | Tamanho dos chunks e dono de cada byte (source maps)                                                                         |
| `node scripts/measure-fps.mjs`                          | Frames por segundo em 5 s (WebGL por software: números pessimistas)                                                          |
| `node scripts/optimize-textures.mjs`                    | Converte a textura original (`assets-src/`) em WebP                                                                          |

## Arquitetura

```
src/
  app/                    rotas e layout (Next.js App Router); só compõe features
  content/                dados: corpos celestes, painel "Sobre", créditos, descrição da cena
  components/             UI compartilhada: Button, IconButton, Heading, Text, Label, Link, PlanetDot, VisuallyHidden, icons/
  styles/                 tokens.css (tema Tailwind v4), motion/ (animações), scene-tokens.ts (valores para o three.js)
  features/
    solar-scene/          cena 3D: components/{scene,bodies,camera}/, hooks/, lib/, shaders/, constants.ts
    content-panel/        painel modal (casca): components/, hooks/, lib/
    about-section/        seção "Sobre"
    contact-section/      seção de contato em etapas: journey/, question/, delivery/
    quick-access-menu/    menu orbital + orbit-layout (função pura)
    target-lock/          overlay do hover "alvo travado" (cantoneiras, linha de telemetria, ficha); não conhece o 3D
    loading-screen/       tela de loading da primeira visita ("Nascimento do sistema"): lib/ (linha do tempo, relógio, quadros), hooks/, components/
    portfolio/            composição: PortfolioExperience, SectionView, PortfolioProviders, fallback, dica, controles de teclado
  services/               entrega da mensagem de contato por e-mail (Resend atrás da interface ContactDelivery)
  hooks/                  hooks usados por 2+ features (navegação por setas, ociosidade, tamanho da janela, movimento reduzido)
  domain/                 tipos e regras do produto usados por 2+ features (corpo celeste, contato, anti-bot, interação)
  lib/                    utilitários genéricos e puros (join-class-names, circular-navigation, screen-frame)
```

**Como decidimos onde cada arquivo mora** (colocation, como recomendam a documentação do Next.js e o bulletproof-react): o que só uma
feature usa fica dentro dela; só sobe para `components/`, `styles/`, `domain/`, `lib/` ou `hooks/` quando duas ou mais features usam. O ESLint impõe o sentido
das dependências: compartilhado não importa de features, uma feature não importa de outra (só `portfolio` compõe, pelo `index.ts` público)
e nada importa de `app/`.

Decisões de projeto:

- **Câmera e órbitas.** A câmera gira em torno do Sol até o corpo focado ou selecionado (Tab, setas, clique, menu), para que ele nunca
  fique atrás do Sol; os planetas continuam orbitando com o painel aberto (só `prefers-reduced-motion` pausa a cena).
- **Loading "Nascimento do sistema".** Na primeira visita da sessão uma animação de 8 s (estrelas, hiperespaço, nebulosa, ignição, órbitas) cobre a página enquanto a cena 3D carrega. Ela sempre roda inteira; se a cena demorar, segura no fim das órbitas até a cena estar pronta. `Esc` ou o botão "Pular" encerram; com movimento reduzido vira uma tela estática. A lógica é função pura do tempo (`features/loading-screen/lib`), o canvas 2D desenha estrelas e poeira e o resto é SVG/DOM.
- **Hover "Alvo travado".** Ao passar o mouse (ou focar com Tab) num astro, cantoneiras de mira travam nele e uma linha leva até uma ficha com o nome decodificado. A cena projeta o astro em 2D (`BodyTracker`) e publica por um canal (`lib/screen-frame.ts`); o overlay (`features/target-lock`) só desenha. No toque, o primeiro toque mostra o alvo e o segundo abre a seção.
- **Contato em etapas.** Uma pergunta por vez (react-hook-form + zod; o mesmo schema de `domain/contact-message.ts` valida no navegador e na Server Action
  `app/actions.ts`), com um cometa que percorre o arco de progresso e, ao enviar, a cena "Correio de Hermes" (envelope voando até Mercúrio). A mensagem é enviada por e-mail pelo Resend (`services/`); configure as variáveis do `.env.example`.
- **Planetas são dados.** Mercúrio (a seção "Contato") é só um item em `content/celestial-bodies.ts` com `kind: 'planet'` e uma `orbit`; a cena
  desenha a órbita, o planeta e o enquadramento a partir disso.
- **Corpos celestes são dados.** `content/celestial-bodies.ts` é uma lista tipada e validada (`domain/celestial-body.ts`). Cena, menu e
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

Tarefas futuras e débitos conhecidos estão em `TASKS.md`. Veja `DECISIONS.md` (versões, React Compiler, Tailwind, pin do `three`), `PROGRESS.md` (histórico, métricas, próxima fase) e
`CREDITS.md` (textura do Sol: Solar System Scope, CC BY 4.0, com crédito visível no painel).
