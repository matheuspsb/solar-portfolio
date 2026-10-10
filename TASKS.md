# Tasks futuras (varredura de prop drilling e vizinhança)

Origem: varredura de todos os componentes de `src/` feita depois de corrigir o prop drilling de `targetingCopy` e `onSendContactMessage`.
Critério de "prop drilling": uma prop atravessa um ou mais componentes que **não a usam** só para entregá-la a um descendente.
Cada task tem contexto, onde está, proposta e critério de pronto. Prioridade: **A** (vale fazer logo), **B** (melhora clara), **C** (opcional).

## Já resolvido nesta varredura

- **`onSendContactMessage`** passava por `PortfolioExperience → SectionView → ContactSection` sem ser usada nos dois primeiros.
  Agora a Server Action entra por `ContactSubmitterProvider` (`hooks/contact-submitter`, montado em `features/portfolio`) e o `ContactSection` lê com `useContactSubmitter()`.
- **`targetingCopy`** passava pela página e por `PortfolioExperience` até o `TargetCard`. Como é texto estático, a solução é a mais simples: o
  `TargetCard` importa `content/targeting.ts` direto e monta o `kicker` a partir do `code` do corpo (uma primeira versão com contexto era exagero).
- O provider do envio é montado por `PortfolioProviders` (`features/portfolio`), usado em `app/page.tsx`. Ele existe porque a página é um
  Server Component e não pode importar o barrel de uma feature inteira (arrastaria hooks de cliente para o servidor).

- **T21, listeners do contexto WebGL.** `onCreated` registrava `webglcontextlost` e `webglcontextrestored` sem nunca remover e com os callbacks da primeira renderização. Agora o hook `useWebglContextEvents` (usado pelo componente `WebglContextEvents`, dentro do `Canvas`) registra com `useEffect`, remove no cleanup, troca de alvo se o canvas mudar e chama sempre a versão atual dos callbacks (`useEffectEvent`).
- **T22, o cometa re-renderizava a seção de contato inteira.** A posição do cometa saiu do estado do React: `useComet` guarda `head` e `tail` em um store externo (`comet-store`) e só o `ArcJourney` o lê, com `useCometPosition` (`useSyncExternalStore`). Durante a viagem a `ContactSection` não re-renderiza (teste no `use-comet.test.tsx`).

## Tasks abertas

### T1 (A) Props da cena atravessam o `SolarSystemSceneLoader` sem serem usadas

- **Onde:** `features/portfolio/PortfolioExperience.tsx` → `solar-scene/components/SolarSystemSceneLoader.tsx` → `SolarSystemScene.tsx`.
- **O que acontece:** o Loader recebe 11 props (`bodies, highlightOf, onHoverChange, onSelect, onContextLost, onContextRestored, isActive,
cameraTarget, description, trackedBodyId, onTrackFrame`). Ele só usa `bodies` e `isActive` (para calcular as configurações) e repassa o resto,
  inalterado, para `SolarSystemScene`, que o repassa de novo aos filhos.
- **Proposta:** agrupar por assunto (`interaction: { highlightOf, onHoverChange, onSelect }`, `lifecycle: { onContextLost, onContextRestored }`,
  `tracking: { trackedBodyId, onTrackFrame }`) e fazer o Loader repassar os grupos em bloco (`{...sceneProps}`), ou expor a interação por um
  contexto de cena lido pelos corpos. Cada prop nova de interação deixa de pedir edição em três arquivos.
- **Pronto quando:** adicionar uma prop de interação à cena exige mudar no máximo o tipo `SceneProps` e o consumidor final.

### T2 (A) Interação do corpo celeste atravessa `CelestialBody` até a malha

- **Onde:** `SolarSystemScene → CelestialBody → SunMesh | PlanetMesh`.
- **O que acontece:** `highlight, highlightEasingRate, onPointerOver, onPointerOut, onSelect` são montados em `SolarSystemScene`, entram em
  `CelestialBody` (que os junta em um objeto `interaction` e espalha) e só então chegam às malhas. Além disso, `SolarSystemScene` calcula por
  corpo valores derivados do movimento reduzido (`rotationPeriodSeconds`, `isAnimated`, `highlightEasingRate`) que o corpo poderia obter sozinho.
- **Proposta:** um hook `useBodyInteraction(id)` (ou contexto da cena) que entrega `highlight`, handlers e taxa de easing direto à malha, e o
  corpo lendo `usePrefersReducedMotion` em vez de receber derivados. `CelestialBody` passa a receber só dados do corpo (`id`, `kind`, `orbit`,
  `radius`, `texture`).
- **Pronto quando:** `CelestialBody` não repassa nenhuma prop de interação e a lista de props de `SunMesh`/`PlanetMesh` cai pela metade.

### T3 (B) `emblemTextureUrl` atravessa três níveis para chegar ao `OrbitEmblem`

- **Onde:** `PortfolioExperience → SectionView → AboutSection → OrbitEmblem`.
- **O que acontece:** só o `OrbitEmblem` usa a URL da textura pequena do Sol; os três componentes acima apenas a repassam.
- **Proposta:** a textura do emblema é um dado do conteúdo "Sobre": colocá-la em `AboutContent` (por exemplo `emblem: { textureUrl }`, em
  `content/about.ts`), o que elimina a prop e o acoplamento da seção com o corpo. Alternativa: um `SelectedBodyContext` se outras seções
  precisarem de dados do corpo.
- **Pronto quando:** `SectionView` e `AboutSection` perdem a prop `emblemTextureUrl`.

### T4 (B) `reducedMotion` é repassado por componentes que poderiam ler o hook

- **Onde (contato):** `ContactSection → ArcJourney → JourneyPlanet` e `ContactSection → DeliveryScene → MercuryPlanet`.
- **O que acontece:** `ContactSection` lê `usePrefersReducedMotion()` e passa o booleano por dois níveis até as folhas que o usam.
  Em outros lugares o mesmo hook é chamado direto (`TargetLock`, `SolarSystemSceneLoader`), então o padrão está misturado.
- **Proposta:** as folhas (`JourneyPlanet`, `MercuryPlanet`, `ArcJourney`, `DeliveryScene`) chamarem `usePrefersReducedMotion()` diretamente. O
  hook já é barato e usa `useSyncExternalStore`. Mantém-se a prop só onde o teste precisa forçar o valor (e aí vale injetar o provider do hook).
- **Pronto quando:** `ContactSection` deixa de passar `reducedMotion` aos filhos, e os testes dos filhos continuam determinísticos.

### T5 (B) `ContactSection` concentra responsabilidades demais

- **Onde:** `features/contact-section/ContactSection.tsx` (323 linhas).
- **O que acontece:** o mesmo componente orquestra o formulário (react-hook-form), a máquina de estados, o cometa, o envio com travas e a
  montagem de todas as peças visuais, além de ter props só para teste (`frameScheduler`, `getNow`).
- **Proposta:** extrair um hook `useContactJourney` (estado + submissão + movimento do cometa) que devolve um modelo pronto para renderizar, e
  deixar `ContactSection` só compondo. Isso também diminui o número de valores que ele passa aos filhos.
- **Pronto quando:** o componente fica abaixo de ~150 linhas e a lógica de envio é testável sem renderizar a árvore inteira.

### T6 (B) Textos de interface dentro de componentes (fora de `src/content/`)

- **Regra do projeto:** todo conteúdo e texto de interface fica em `src/content/`.
- **Casos encontrados:**
  - `PortfolioExperience.tsx`: `UNAVAILABLE_MESSAGE`, `CONTEXT_LOST_MESSAGE`, `FALLBACK_TITLE` e `groupLabel="Corpos celestes"`.
  - `PanelHeader.tsx`: `"Fechar painel"`.
  - `QuickAccessMenu.tsx`: `"Acesso rápido"` (duas vezes, no `nav` e no botão).
  - `AboutSection.tsx`: os rótulos `"Experiência"`, `"Localização"` e `STACK_LABEL`.
  - `StepActions.tsx`: o glifo `←` do botão de voltar.
- **Proposta:** um módulo `content/ui.ts` e importá-lo direto onde for usado, como o `TargetCard` faz com `content/targeting.ts`.
- **Pronto quando:** nenhum componente de `features/` tem texto em português literal.

### T7 (C) Props de teste misturadas com as de produção

- **Onde:** `PortfolioExperience` (`scene`, `detectWebGL`, `idleScheduler`), `ContactSection` (`frameScheduler`, `getNow`), `CelestialBody`
  (`loadTexture`).
- **Observação:** é injeção de dependência feita por prop opcional, coerente com o guia (SOLID, D). O custo é que o tipo de props mistura o que
  a produção usa com o que só o teste usa.
- **Proposta (só se incomodar):** agrupar em um único objeto `testing`/`deps` opcional por componente, ou usar providers de dependências.

## Fora do escopo desta varredura, mas anotado

- `PortfolioExperience` ainda recebe `bodies`, `credits` e `sceneDescription` da página: são dados de conteúdo de primeiro nível usados direto
  por ele (ou por um único filho), então não contam como drilling.
- `QuickAccessMenu`, `SceneFallback` e `SceneKeyboardControls` recebem listas já mapeadas pelo `PortfolioExperience`; cada um usa tudo que
  recebe.

---

# Varredura 2: ternários, responsabilidades, effects, vazamentos e re-renders

Feita com análise estática (AST do TypeScript, contagens por arquivo) e leitura dos arquivos suspeitos. Nada foi alterado no código; cada item
abaixo é uma task. Prioridade: **A** (vale fazer logo), **B** (melhora clara), **C** (opcional).

## Resultado resumido

| Tema                                      | Resultado                                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Ternários aninhados                       | **Nenhum** em `.ts` ou `.tsx` (checado pela AST, em lógica e em JSX).                                            |
| Ternários dentro do JSX                   | 14 ocorrências; 4 delas em `ContactSection` repetem a mesma condição (T8).                                       |
| Arquivos grandes que misturam lógica e UI | 6 candidatos (T9 a T14).                                                                                         |
| `useEffect`                               | 20 no total: 14 legítimos (sincronizam com timer, listener, observer ou objeto 3D), 6 questionáveis (T15 a T20). |
| Vazamento de memória                      | Nenhum timer, listener ou observer sem limpeza na maioria; 1 risco real (T21) e 1 limpeza redundante (T20).      |
| Re-renders desnecessários                 | 1 problema relevante (T22) e 3 riscos menores (T23 a T25).                                                       |

## Ternários e lógica dentro do JSX

### T8 (B) `ContactSection` repete `isDone && delivery ? … : …` e mistura lógica no JSX

- **Onde:** `contact/ContactSection.tsx:222`, `:244` (a mesma condição duas vezes, uma para a cena e outra para o corpo), `:258` e `:285`
  (`attributes.multiline ? { current, max } : undefined` passado como prop).
- **Proposta:** calcular antes do `return` uma variável de visão (`const deliveredView = isDone && delivery ? delivery : null`) e o
  objeto `count`, e renderizar com `&&`/early return. Duas ramificações iguais lado a lado é sinal para extrair dois componentes
  (`AskingView` e `DeliveredView`).
- **Pronto quando:** nenhuma condição composta aparece repetida no JSX.

### T9 (C) Lógica e ternários pequenos em props de malha

- **Onde:** `PlanetMesh.tsx:49` e `:52` (`texture ? … : …` em `key` e em `emissive`), `SolarSystemScene.tsx:98` (`frameloop`).
- **Proposta:** nomear o valor antes do JSX (`const materialKey = texture ? 'textured' : 'plain'`). Baixo risco, ganho de leitura.

### T10 (C) `.map` com lógica dentro do JSX e handler de várias linhas

- **Onde:** `quick-access-menu/QuickAccessMenu.tsx:131` (`items.map` com 3 statements: posição, estilo e delay calculados no JSX) e
  `solar-scene/SolarSystemScene.tsx:109` (`onCreated` com 2 statements, registra listeners).
- **Proposta:** pré-calcular uma lista de itens prontos (`getOrbitItems`) e extrair o handler do canvas para um hook (ver T21).

## Arquivos com mais de uma responsabilidade

### T11 (A) `ContactSection.tsx` (324 linhas)

Já registrado como T5. Detalhe da varredura: 5 hooks, estado de formulário (RHF), máquina de estados, cometa, envio com travas, medição de
tempo para o anti-bot e a montagem de 12 componentes. É o maior risco de manutenção do projeto. Extrair `useContactJourney` (estado, comet,
envio) e deixar o componente só compondo.

### T12 (B) `PortfolioExperience.tsx` (164 linhas)

- **Mistura:** disponibilidade da cena, foco do teclado (`lastOpenedIdRef`), listas derivadas (`menuItems`, `keyboardItems`, `lockTargets`),
  mensagens de interface (constantes `UNAVAILABLE_MESSAGE` etc.) e a composição de seis filhos.
- **Proposta:** um hook `usePortfolioModel(bodies)` que devolve as listas e os handlers (`openBody`, `changeHover`, `focusLastOpenedBody`), e as
  mensagens indo para `content/` (T6). O componente fica só com o JSX.

### T13 (B) `QuickAccessMenu.tsx` (160 linhas)

- **Mistura:** estado aberto/fechado, foco no primeiro item, clique fora (effect com listener), cálculo de geometria (posições, raio) e o JSX dos
  anéis e itens.
- **Proposta:** `useQuickAccessMenu` (abrir, fechar, foco, clique fora) e um componente de apresentação `OrbitRing` para anel, brilho e itens.

### T14 (B) `SolarSystemScene.tsx` (176 linhas) e `use-comet.ts` (143 linhas)

- **`SolarSystemScene`:** configuração do `Canvas`, ciclo de vida do WebGL (listeners de contexto), revelação, limpeza de hover e o mapa dos
  corpos no mesmo componente. Separar `SceneCanvas` (config e ciclo de vida) e `SceneBodies` (lista).
- **`use-comet`:** três responsabilidades no mesmo hook: o agendador de frames, o motor de interpolação (tween) e o estado React com
  promessas. Extrair o motor para uma função/classe pura testável e deixar o hook só ligando ao React.
- **`domain/celestial-body.ts` (159 linhas):** tipos de domínio e validação no mesmo arquivo; separar `types` e `validate`.

## useEffect

### Legítimos (sincronizam com algo de fora do React; manter)

`use-modal-focus` (foco e Escape), `use-element-width` (ResizeObserver), `use-decoded-text`, `use-intent-target`, `use-scene-reveal`,
`use-idle-ready`, `use-texture` (todos com timer ou carga assíncrona e limpeza), `KeyboardZoom`, `use-camera-takeover` (listener),
`BodyTracker` (`invalidate` no modo sob demanda), `CameraDistance` (aplica a distância à câmera 3D), `DeliveryReceipt` (foco no título ao entrar:
`autoFocus` não funciona em `<h2>`).

### T15 (B) `AnswerField`: effect só para focar no mount

- **Onde:** `contact/AnswerField.tsx:44`. `useEffect(() => { if (focusOnMount) controlRef.current?.focus() }, [focusOnMount])`.
- **Proposta:** usar o atributo `autoFocus={focusOnMount}` no `<input>`/`<textarea>`, que o React já trata no mount. Remove o effect, o ref extra
  e a função `attachControl` que só existia para isso (continua a necessidade de repassar o ref do RHF).

### T16 (B) `QuickAccessMenu`: focar o primeiro item dentro de um effect

- **Onde:** `QuickAccessMenu.tsx:49`. O foco no primeiro item acontece num effect que reage a `isOpen`.
- **Proposta:** focar no próprio handler que abre o menu (evento, não efeito). O listener de clique fora fica no effect (legítimo), mas pode
  virar um hook reutilizável `useDismissOnOutsidePointer(ref, onDismiss, isActive)`.

### T17 (C) `CelestialBody`: effect que avisa o pai que a textura terminou

- **Onde:** `CelestialBody.tsx:57` (`useEffect` que chama `onSettled(id)`).
- **Padrão:** "effect para notificar o pai". Alternativa: avisar dentro do `useTexture`, na promessa que já resolve (`onSettled` como opção do
  hook), sem passar pela renderização.

### T18 (C) `SceneEffects`: effect de mount só para chamar `onReady`

- **Onde:** `SceneEffects.tsx:13`. O componente é carregado com `lazy`; o sinal "pronto" pode vir da própria promessa do `import()`
  (`.then(markEffectsReady)`) em vez de um effect no componente carregado.

### T19 (C) `use-camera-takeover`: effect para zerar um ref quando muda o nonce

- **Onde:** `use-camera-takeover.ts:10`. Padrão "resetar estado quando a prop muda". Alternativa: guardar o nonce junto do flag
  (`{ nonce, takenOver }`) e derivar durante o render, sem effect.

### T20 (C) `use-comet`: `isMountedRef` e effect de reduced motion

- **Onde:** `use-comet.ts:131` (guarda `isMountedRef` para não chamar `setState` depois de desmontar). Desde o React 18 não há aviso de
  `setState` após desmontagem, então o guarda é desnecessário; a limpeza do frame e da promessa continua necessária.
- **Também:** `use-comet.ts:121` reage a `reducedMotion` com um effect. Pode ser tratado no `travelTo`/no loop, que já lê o valor.

## Vazamentos de memória

Auditoria de listeners, timers, `requestAnimationFrame`, observers e recursos 3D:

- **OK:** `use-modal-focus`, `use-viewport-size`, `use-prefers-reduced-motion`, `KeyboardZoom`, `use-camera-takeover`, `use-element-width`,
  `use-idle-ready`, `use-intent-target`, `use-decoded-text`, `use-scene-reveal` e `use-comet` (frame cancelado e promessa resolvida no
  desmonte). Texturas são descartadas em `use-texture`; geometrias e materiais JSX são descartados pelo R3F na desmontagem.

## Re-renders desnecessários

### T23 (B) Cada mudança de hover, foco ou seleção re-renderiza a experiência inteira

- **Onde:** o `useBodyInteraction` (reducer) vive em `PortfolioExperience`; cada hover/foco re-renderiza menu, controles de teclado, `TargetLock`
  e a cena (o Loader e todos os `CelestialBody`).
- **Observação:** não é por frame, só por evento, e o React Compiler memoiza as listas derivadas; o custo hoje é baixo. Vira problema se a cena
  crescer (mais astros).
- **Proposta:** medir com o Profiler antes de mexer. Se necessário, um store pequeno com seletores (Zustand) só para o estado de interação, que
  é o caso em que uma store se justifica (ver `DECISIONS.md`); ou passar `highlight` por corpo em vez de `highlightOf` (função nova a cada render).

### T24 (C) `TargetLock` re-renderiza a cada frame publicado

- **Onde:** `useScreenFrame` assina o canal e re-renderiza o overlay quando o frame muda (Mercúrio em órbita com a câmera seguindo quase não muda;
  com a câmera livre muda a cada frame). O trabalho por render é pequeno (layout puro e três filhos).
- **Proposta:** só se aparecer no Profiler: mover o posicionamento para `ref` + `style.transform` fora do React, mantendo o React para o que muda
  pouco (alvo, texto).

### T25 (C) `useViewportSize` em três lugares dispara re-render em todo evento de resize

- **Onde:** `QuickAccessMenu`, `SolarSystemSceneLoader`, `TargetLock`. Durante um redimensionamento contínuo os três re-renderizam a cada evento.
- **Proposta:** limitar a taxa (throttle por frame) dentro do hook, ou derivar só o que cada um precisa (por exemplo, o menu só precisa da faixa de
  largura que muda o raio da órbita).

### T26 (B) O hover se perde quando a textura de um astro termina de carregar com o ponteiro em cima

- **Onde:** `solar-scene/components/bodies/CelestialBody.tsx` e o material do astro (`SunMesh`, `PlanetMesh`).
- **Como reproduzir:** atrasar as texturas em 3,5 s no Playwright (`page.route` em `.webp`), usar movimento reduzido, pairar sobre Mercúrio assim que o
  cursor virar `pointer`. Cerca de 15 ms depois chega `pointerout` sem o mouse se mover e o "alvo travado" some até o mouse se mexer. Acontece com ou
  sem o loader (2 de 4 execuções sem ele), e explica o flake raro do e2e `camera-focus` de movimento reduzido.
- **Hipótese:** a troca do material quando a textura chega recria o objeto raycastado e o R3F emite `pointerout`. Verificar com um log em
  `changeHover` e comparar o `uuid` da malha antes e depois.
- **Pronto quando:** o hover sobrevive à chegada da textura (teste e2e com o atraso acima).
- **Contorno atual:** os helpers de e2e (`hoverSun`, `hoverMercury`) esperam a cena ser revelada antes de pairar.

### T27 (C) Pausar o render da cena enquanto o loader a cobre

- **Onde:** `solar-scene/components/scene/SolarSystemScene.tsx` (`frameloop`) e `portfolio/PortfolioExperience.tsx`.
- **Problema:** durante os ~8 s do loader a cena 3D renderiza (com bloom) por trás de uma camada opaca. Em GPU real o custo é pequeno; em celular fraco ele compete com o loader.
- **Proposta:** `frameloop="demand"` até a cena ser revelada e o loader terminar, invalidando uma vez ao liberar. Medir com `scripts/measure-loader.mjs first` antes e depois.

## Outras observações da varredura

- **`StarField.tsx` usa `useMemo`** (a única ocorrência), contra a regra do projeto de não usá-lo com o React Compiler sem justificativa. Remover
  ou registrar o motivo no `DECISIONS.md` (gera ~2600 posições; vale medir se o compilador já cobre).
- **Casts `as ContactStepIndex` em 4 lugares** (`contact-flow.ts`, `ContactSection.tsx`): o índice da etapa é um número que o tipo não
  garante. Trocar por uma função `toStepIndex(value)` que valida, ou modelar a etapa como união nomeada (`'name' | 'email' | 'message'`).
- **`key` do planeta usa `label`** (`ArcJourney.tsx:75`): está certo enquanto os rótulos forem únicos; o dado deveria ter um `id` próprio.
- **`console` só em `app/actions.ts`** com `eslint-disable` justificado (log de servidor), sem outros usos; nenhuma ação necessária.
