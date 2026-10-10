# CLAUDE.md — Portfólio Sistema Solar (Fase 1: o Sol)

Você vai construir este projeto sozinho, em uma sessão longa e sem supervisão. O dono do projeto (Matheus) está dormindo e não vai responder. Leia este arquivo inteiro antes de começar e releia a seção "Ciclo de iteração" no início de cada iteração.

## 1. Modo de operação: autônomo

- **Não faça perguntas e não espere confirmação.** Quando houver dúvida, escolha a opção mais simples que respeite este guia, registre a decisão e o motivo em `DECISIONS.md` e siga em frente.
- **Não pare ao terminar uma tarefa.** Ao concluir uma iteração, comece a próxima imediatamente. Só pare quando a sessão acabar ou quando o backlog e a lista de melhorias contínuas (seção 9) estiverem esgotados de verdade.
- **Você tem liberdade para:** instalar dependências, rodar o servidor de desenvolvimento, abrir o projeto no navegador disponível no seu ambiente, tirar screenshots, medir performance, pesquisar documentação e assets na web, refatorar e apagar código seu.
- **Limites:** trabalhe apenas dentro deste repositório. Não faça `git push`, não faça deploy, não crie contas, não use serviços pagos, não leia nem altere arquivos fora da pasta do projeto, não coloque segredos no código.
- **Se travar** no mesmo problema por três tentativas, registre o bloqueio em `PROGRESS.md`, reverta para o último commit verde e passe para o próximo item do backlog.
- **Memória entre iterações:** seu contexto pode ser compactado. `PROGRESS.md` é a sua memória. Atualize-o ao fim de cada iteração e leia-o no início de cada uma.

## 2. O produto

Portfólio pessoal de um engenheiro frontend, no formato de um sistema solar 3D navegável. Cada corpo celeste representa uma seção do portfólio. O público principal são recrutadores e líderes técnicos, então o site precisa impressionar visualmente **e** entregar a informação rápido.

### Escopo desta fase: somente o Sol

Construa a cena com o Sol e nada de planetas. O que deve existir ao fim da fase:

1. Cena 3D em tela cheia com o Sol no centro: esfera **texturizada**, rotação lenta, superfície com aparência viva (textura + emissão + brilho/corona), fundo de estrelas.
2. O Sol é interativo: foco, hover e seleção por mouse **e** por teclado.
3. Ao selecionar o Sol, abre um painel "Sobre" em **HTML real** (DOM, não texto dentro do canvas) com os dados da seção 2.1.
4. Menu no canto superior direito ("acesso rápido para recrutadores") que abre o mesmo painel sem depender da cena 3D. Por enquanto ele lista só a seção "Sobre", mas deve ser alimentado pelos mesmos dados dos corpos celestes.
5. Fallback: sem WebGL, ou com erro na cena, o conteúdo continua acessível pelo menu e pelo painel.
6. `prefers-reduced-motion` respeitado (sem rotação automática nem transições de câmera longas).
7. Responsivo, do celular ao desktop.

**Não implemente planetas, órbitas ou luas nesta fase.** Mas a arquitetura deve estar pronta para eles: corpos celestes são **dados** (uma lista de configuração tipada), e adicionar um planeta no futuro deve significar adicionar um item nessa lista, não alterar componentes existentes.

### 2.1 Conteúdo do painel "Sobre"

Use somente estes fatos. Não invente experiências, números ou empresas.

- Nome: Matheus
- Cargo: Software Engineer, foco em frontend
- Cerca de 5 anos de experiência em desenvolvimento frontend
- Stack principal: React, Next.js, TypeScript, TanStack Query, React Hook Form, Storybook
- Localização: Campina Grande, Paraíba, Brasil
- LinkedIn: linkedin.com/in/matheuspaulosouza

Todo o conteúdo fica em um arquivo de dados separado (`src/content/`), nunca espalhado em componentes. Textos da interface em português.

### 2.2 Controles

| Ação                        | Mouse                     | Teclado                   |
| --------------------------- | ------------------------- | ------------------------- |
| Focar corpo celeste         | hover                     | `Tab` / setas             |
| Selecionar / abrir painel   | clique                    | `Enter` ou `Espaço`       |
| Fechar painel / voltar      | botão fechar, clique fora | `Esc`                     |
| Girar / aproximar câmera    | arrastar / scroll         | (opcional) `+` e `-`      |
| Abrir menu de acesso rápido | clique                    | `Tab` até o menu, `Enter` |

O foco de teclado deve ser sempre visível, o painel deve prender o foco enquanto aberto e devolvê-lo ao elemento de origem ao fechar.

## 3. Stack

Verifique na documentação oficial as versões estáveis atuais antes de instalar; não confie na memória. Registre as versões escolhidas em `DECISIONS.md`.

- Next.js (App Router) + React 19 + TypeScript em modo `strict`
- React Three Fiber + `@react-three/drei` + `@react-three/postprocessing` (confirme compatibilidade com React 19)
- CSS Modules + design tokens em variáveis CSS
- Testes: Vitest + React Testing Library + `@react-three/test-renderer` (unidade e integração) e Playwright (ponta a ponta)
- ESLint + Prettier
- `pnpm` (se não estiver disponível, use `npm`)

O canvas 3D é um componente client-side carregado sob demanda; o conteúdo e o menu devem renderizar sem depender dele.

### React 19 e memoização

Antes de escrever o primeiro componente, pesquise na documentação oficial do React o estado atual do **React Compiler** e das APIs do React 19, e registre as conclusões em `DECISIONS.md`. Ponto de partida a confirmar: a memoização automática vem do React Compiler (um plugin de build), não do React 19 em si. Então:

- Habilite o React Compiler se ele for estável e suportado pela versão do Next.js escolhida.
- Com o compilador ativo, **não** escreva `useMemo`, `useCallback` nem `React.memo` por padrão. Use-os só quando houver uma razão medida ou semântica (por exemplo, identidade estável exigida por uma biblioteca externa), com um comentário explicando o porquê.
- Verifique como o compilador se comporta com React Three Fiber, principalmente com mutações dentro de `useFrame` e refs. Se algum componente precisar sair do compilador, use a diretiva apropriada e documente.
- Avalie quais novidades do React 19 fazem sentido aqui (`use`, `ref` como prop, Actions, `useOptimistic` etc.) e use apenas as que resolvem um problema real do projeto.

## 4. Ciclo de iteração (obrigatório, sempre nesta ordem)

Cada iteração pega **um** item pequeno do backlog e passa pelas quatro etapas. Nunca pule nem inverta.

### 4.1 Testes primeiro

- Antes de escrever o teste, anote (em `PROGRESS.md`, não em comentário no arquivo) o **caso de uso**: quem usa isso, o que espera que aconteça e o que quebraria para o usuário se falhasse.
- Escreva os testes e **rode-os para vê-los falhar pelo motivo certo**. Teste que nunca falhou não prova nada.
- Vá além do caminho feliz. Para cada unidade, pense deliberadamente em casos de borda. Exemplos para este projeto:
  - entradas numéricas: zero, negativo, `NaN`, `Infinity`, delta de tempo enorme (aba em segundo plano por minutos), delta zero;
  - lista de corpos celestes vazia, com um item, com ids duplicados, com textura ausente;
  - textura que falha ao carregar, WebGL indisponível, contexto WebGL perdido no meio do uso;
  - teclado: `Esc` com painel já fechado, `Enter` repetido rapidamente, `Tab` circulando do último ao primeiro elemento, foco devolvido ao lugar certo;
  - `prefers-reduced-motion` ligado e alternado em tempo de execução;
  - viewport muito estreita, redimensionamento, rotação de tela;
  - abrir o painel pelo menu e fechar pela cena, e vice-versa.
- Teste **comportamento observável**, não detalhes de implementação. Consulte por papel e nome acessível (`getByRole`), não por classe CSS ou `data-testid` quando houver alternativa.
- **Não teste texto.** Nenhum teste afirma o conteúdo de uma mensagem, título ou rótulo (copy muda e não quebra nada para o usuário). Textos só servem
  para localizar elementos (`getByRole` com `name`); para "apareceu um erro" use `role="alert"` e `aria-invalid`, para "entrou na etapa" use a presença do campo.
- Não teste o que o navegador ou uma biblioteca já garante (átomo que só repassa props a `<input>`, digitar em campo nativo, ref que o formulário
  já exercita). Se o comportamento já é provado por um teste de nível mais alto, apague o teste de baixo nível redundante.
- Proibido: teste que só verifica que "renderiza sem quebrar", snapshot gigante sem intenção, asserção sobre mock que você mesmo configurou, teste escrito só para subir cobertura.

### 4.2 Desenvolve

- Escreva o mínimo de código para os testes passarem. Não adicione funcionalidade sem teste.
- Se descobrir um caso novo durante a implementação, volte e escreva o teste primeiro.

### 4.3 Aprimora

Com os testes verdes:

- Refatore para clareza: nomes, extração de hooks e funções puras, remoção de duplicação.
- Releia o código contra as seções 5 e 6 deste guia.
- Revise os testes: algum é frágil, redundante ou está testando implementação? Falta algum caso de borda que só ficou evidente agora?

### 4.4 Valida no navegador

- Suba o servidor de desenvolvimento e abra o projeto no navegador disponível no seu ambiente. Se não houver navegador integrado, use o Playwright com screenshots.
- Olhe o resultado de verdade: tire screenshot, verifique o console (zero erros e zero warnings), teste mouse e teclado manualmente pela automação.
- Avalie o visual com senso crítico: o Sol parece um sol? O brilho está exagerado? O texto do painel é legível sobre o fundo? Se não estiver bom, ajuste e valide de novo.
- Meça performance quando a iteração mexer na cena (seção 7).

### 4.5 Fechamento da iteração

Só feche se tudo isto passar: `lint`, `typecheck`, testes unitários, testes e2e e `build`. Então:

1. Faça um commit pequeno com mensagem no padrão Conventional Commits.
2. Atualize `PROGRESS.md`: o que foi feito, o que foi aprendido, métricas de performance se medidas, próximo item.
3. Comece a próxima iteração.

Nunca faça commit com teste falhando, teste desativado (`skip`, `only`) ou erro de tipo suprimido (`any`, `@ts-ignore`) sem justificativa escrita.

## 5. Arquitetura e princípios

### 5.1 Separação entre lógica e template

- **Componentes de apresentação (dumb):** recebem props, devolvem JSX. Sem regra de negócio, sem cálculo, sem acesso a API ou a `window`.
- **Hooks:** estado, efeitos e orquestração (seleção do corpo celeste, navegação por teclado, detecção de WebGL, reduced motion).
- **Funções puras (`lib/`):** toda matemática e regra (rotação por delta de tempo, navegação circular em lista, validação da configuração). São as mais fáceis de testar; coloque o máximo de lógica aqui.
- **Services:** só se houver API de terceiros ou acesso a recursos externos. Fique atrás de uma interface; componentes e hooks nunca chamam a API diretamente. Se não houver necessidade real, não crie services.

Não misture lógica com template: nada de cálculo, ternário aninhado ou transformação de dados dentro do JSX. Calcule antes, com nome claro, e renderize o resultado.

### 5.2 SOLID aplicado a React

- **S — Responsabilidade única:** cada componente, hook ou função tem um motivo para mudar. Se um componente carrega textura, anima e trata clique, divida.
- **O — Aberto/fechado:** estenda por composição, props e dados. Novos corpos celestes entram pela lista de configuração; novas variantes de um átomo entram por prop, não por `if` espalhado.
- **L — Substituição de Liskov:** componentes que compartilham um contrato de props são intercambiáveis. Todo corpo celeste respeita a mesma interface; um átomo que envolve um elemento nativo aceita e repassa as props desse elemento sem surpreender.
- **I — Segregação de interfaces:** props pequenas e específicas. Não passe o objeto inteiro quando o componente usa dois campos; não crie props que metade dos usos ignora.
- **D — Inversão de dependência:** componentes dependem de abstrações (hooks, interfaces, props), não de detalhes concretos. Carregador de textura, relógio, `matchMedia` e afins são injetáveis, o que também torna tudo testável sem mocks globais.

### 5.3 Clean Code

- Nomes descritivos e completos. **Proibido** nome de variável, parâmetro ou função com uma única letra (`e`, `i`, `x`, `t`, `a`), inclusive em callbacks, `map`, `catch` e loops. Use `event`, `index`, `elapsedSeconds`, `celestialBody`.
- Código, nomes e commits em inglês; textos visíveis ao usuário em português.
- Funções pequenas, um nível de abstração por função, retorno antecipado em vez de aninhamento.
- Sem números mágicos: constantes nomeadas ou tokens.
- Sem código morto, sem `console.log` esquecido. **Sem comentários no código** (nem em testes, CSS ou configs), exceto `TODO(...)` e diretivas de ferramenta (`eslint-disable`, `@ts-expect-error`). O porquê vai em nomes claros, em `DECISIONS.md` e na mensagem de commit.
- Sem `any`. Tipos explícitos nas fronteiras (props, retornos de hooks, configuração).

### 5.4 Estrutura de pastas: features + compartilhado

```
src/
  app/                      # rotas e layout do Next.js; só compõe features
  content/                  # dados do portfólio (corpos celestes, textos, créditos)
  components/               # UI compartilhada por 2+ features: Button, IconButton, Heading, Text, Label, Link, PlanetDot...
    icons/                  # ícones SVG
  styles/                   # tokens.css (tema Tailwind), motion/ (keyframes e utilitários de animação), scene-tokens.ts (espelho para o three.js)
  features/                 # cada feature é dona dos seus componentes, hooks e funções
    solar-scene/            # cena 3D (components/, hooks/, lib/, shaders/, constants.ts, index.ts)
    content-panel/          # painel modal e seções (components/, sections/, hooks/, lib/, index.ts)
    quick-access-menu/      # menu orbital (componentes + orbit-layout, index.ts)
    target-lock/            # overlay do hover "alvo travado" (components/, hooks/, lib/, index.ts)
    portfolio/              # camada de composição: junta as outras features (PortfolioExperience)
  hooks/                    # hooks usados por 2+ features
  domain/                   # tipos e regras do produto usados por 2+ features (corpo celeste, contato, anti-bot, interação)
  lib/                      # utilitários genéricos e puros, sem regra de negócio (join-class-names, circular-navigation, screen-frame)
  services/                 # somente se necessário
```

- **Colocation:** o que só uma feature usa fica dentro dela (componente, hook, função pura, teste). Só sobe para `lib/`, `hooks/` ou
  `components/`, `domain/` ou `styles/` quando **duas ou mais** features passam a usar. Apagar uma feature deve ser apagar uma pasta.
- **Dependências em um sentido só:** código compartilhado (`components`, `styles`, `domain`, `lib`, `hooks`, `content`, `services`) não importa de `features/` nem de `app/`;
  uma feature não importa de outra nem de `app/`; só `features/portfolio` (composição) usa as demais, e apenas pelo `index.ts` público de cada uma.
  Isso é imposto por `no-restricted-imports` no ESLint (vale também para `services/`).
- **Onde cada coisa nova mora (antes de criar um arquivo, responda):** (1) quem usa? Uma feature só: dentro dela. Duas ou mais: `domain/` (tipo, schema ou regra do produto), `lib/` (utilitário
  genérico), `hooks/`, `components/` ou `styles/`. (2) É integração externa (e-mail, API, banco)? Interface e implementação em `services/`, chamada
  só por `app/` (Server Action ou rota) e injetada nas features por props; features nunca importam `services/`. (3) Schema compartilhado entre
  navegador e servidor fica em `domain/`. (4) Componente usado por duas seções da mesma feature sobe para `components/` dessa feature, não para o
  `components/` global. Nunca crie `utils/`, `helpers/` ou `common/`.
- Em `components/` ficam só peças pequenas e sem regra de negócio (átomos). Não existem `molecules/` nem `organisms/` globais: composições moram na feature que as usa e só sobem para `components/` se 2+ features as compartilharem. Nas features,
  componentes compostos ficam ao lado dos pequenos que usam; hooks orquestram e funções puras concentram a regra.
- Todo valor visual vem de um token. Nada de cor ou espaçamento solto em componente.
- Cada arquivo de componente fica ao lado do seu teste; estilos são classes Tailwind no próprio componente.

## 6. Assets

- **Textura do Sol:** pesquise uma textura equirretangular de boa qualidade e licença livre (procure por texturas de domínio público da NASA e por pacotes de texturas planetárias com licença Creative Commons). **Confirme a licença na página de origem** antes de usar e registre fonte, autor e licença em `CREDITS.md`. Se a licença exigir atribuição, inclua-a também de forma visível no site (rodapé ou painel).
- Otimize: converta para WebP ou KTX2, com versão menor para telas pequenas. Evite arquivos acima de ~1 MB na primeira carga.
- O realismo vem da combinação: textura como base, material emissivo, bloom no pós-processamento e, se o tempo permitir, um shader simples para movimentar a superfície e desenhar a corona.
- **Ícones e elementos de interface:** crie os SVGs você mesmo, simples e coerentes com os tokens, em vez de instalar uma biblioteca inteira de ícones.
- Se nenhuma textura adequada for encontrada, gere uma procedural por shader e registre isso em `DECISIONS.md`.
- Identidade visual: espaço profundo e escuro, contraste alto, o Sol como única fonte de cor quente. Tipografia limpa e legível. O painel deve parecer parte do mesmo universo, não um modal genérico.

## 7. Performance e qualidade

Metas a medir, não a supor:

- Animação estável a 60 fps em desktop comum; sem quedas perceptíveis ao abrir o painel.
- Limite o `devicePixelRatio` (por exemplo, até 2) e reduza a qualidade em telas pequenas.
- Pause ou reduza o loop de renderização quando a aba estiver oculta ou a cena estiver parada (avalie renderização sob demanda).
- Libere geometrias, materiais e texturas ao desmontar. Trate a perda de contexto WebGL.
- Conteúdo e menu visíveis antes de a cena 3D carregar; sem deslocamento de layout quando ela entra.
- Rode o Lighthouse (ou equivalente) no build de produção e registre os números em `PROGRESS.md`. Busque acessibilidade 100 e performance acima de 90; se não atingir, registre o motivo e o que foi tentado.
- Acessibilidade: navegação completa por teclado, papéis e nomes ARIA corretos, contraste AA, o canvas com alternativa textual, testes automatizados com axe nos e2e.

## 8. Backlog da Fase 1

Siga nesta ordem. Cada item é uma ou mais iterações completas do ciclo da seção 4.

1. **Fundação:** criar o projeto, configurar TypeScript strict, ESLint, Prettier, Vitest, Playwright, scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`) e um teste de fumaça de cada tipo. Criar `PROGRESS.md`, `DECISIONS.md` e `CREDITS.md`. Registrar a pesquisa sobre React 19 e React Compiler.
2. **Tokens e átomos de interface.**
3. **Modelo de dados:** tipo e validação da configuração de corpos celestes, com o Sol como único item, e o conteúdo "Sobre".
4. **Funções puras:** rotação por delta de tempo, navegação circular entre corpos, utilitários de reduced motion.
5. **Cena base:** canvas, câmera, luzes, fundo de estrelas.
6. **Sol:** malha texturizada, rotação, material emissivo, bloom.
7. **Interação com o Sol:** hover, foco e seleção por mouse e teclado.
8. **Painel "Sobre":** organismo acessível, com gerenciamento de foco.
9. **Menu de acesso rápido** no canto superior direito, alimentado pela configuração.
10. **Fallback** sem WebGL e limite de erro em volta da cena.
11. **Reduced motion e responsividade.**
12. **Performance:** medir, otimizar, medir de novo.
13. **Polimento visual:** corona, movimento da superfície, transições de câmera e do painel.

## 9. Depois do backlog: melhoria contínua

Se ainda houver sessão, continue em ciclos completos (teste, desenvolve, aprimora, valida), **sem sair do escopo do Sol**:

- Caçar casos de borda não cobertos e reforçar testes frágeis.
- Revisar cada arquivo contra as seções 5.2 e 5.3 e refatorar o que não passar.
- Melhorar performance com medição antes e depois.
- Refinar o visual do Sol comparando screenshots entre iterações.
- Auditar acessibilidade manualmente pela automação do navegador.
- Reduzir o tamanho do bundle e dos assets.
- Escrever o `README.md` com arquitetura, comandos e decisões.
- Deixar em `PROGRESS.md` uma seção "Próxima fase" com uma proposta de como adicionar planetas e órbitas usando a arquitetura existente (apenas a proposta, sem implementar).

## 10. Definição de pronto de cada iteração

- [ ] Caso de uso descrito e testes escritos antes do código, vistos falhando
- [ ] Casos de borda cobertos, não só o caminho feliz
- [ ] `lint`, `typecheck`, testes unitários, e2e e `build` passando
- [ ] Validado no navegador, console limpo, screenshot conferido
- [ ] Sem variável de uma letra, sem lógica no JSX, sem valor visual fora dos tokens
- [ ] Commit feito e `PROGRESS.md` atualizado

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
