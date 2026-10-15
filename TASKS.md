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

- **T1, props da cena atravessavam o `SolarSystemSceneLoader`.** O Loader agora lê só `bodies` e `isActive` e repassa `SceneProps` em bloco para a `SolarSystemScene`, cujo tipo é `SceneProps & SceneSettings & { prefersReducedMotion }`. Uma prop nova de interação muda só o tipo `SceneProps` e o consumidor final (ver DECISIONS.md).
- **T2, interação do corpo atravessava `CelestialBody` até a malha.** A cena monta `BodyInteractionProvider`; cada malha chama `useBodyInteraction(id)` (destaque, easing, handlers e cursor) e o corpo lê o destaque e o movimento reduzido do mesmo contexto. `CelestialBody` não repassa nenhuma prop de interação; `SunMesh` caiu de 10 para 5 props e `PlanetMesh` de 9 para 5 (ver DECISIONS.md).
- **T21, listeners do contexto WebGL.** `onCreated` registrava `webglcontextlost` e `webglcontextrestored` sem nunca remover e com os callbacks da primeira renderização. Agora o hook `useWebglContextEvents` (usado pelo componente `WebglContextEvents`, dentro do `Canvas`) registra com `useEffect`, remove no cleanup, troca de alvo se o canvas mudar e chama sempre a versão atual dos callbacks (`useEffectEvent`).
- **T22, o cometa re-renderizava a seção de contato inteira.** A posição do cometa saiu do estado do React: `useComet` guarda `head` e `tail` em um store externo (`comet-store`) e só o `ArcJourney` o lê, com `useCometPosition` (`useSyncExternalStore`). Durante a viagem a `ContactSection` não re-renderiza (teste no `use-comet.test.tsx`).
- **T5, T8 e T11, `ContactSection` concentrava responsabilidades demais.** A lógica (formulário, máquina de estados, cometa, envio com travas, rascunho) foi para o hook `useContactJourney`, que devolve um modelo pronto (`delivered`, `stage`, `form`); `ContactSection` caiu de 338 para 77 linhas e só compõe `JourneyStage`, `ContactForm` (nova, em `question/`), `DeliveryReceipt` e `LinkedInCard`. Os ternários repetidos viraram uma variável de visão (`delivered`) e o contador de caracteres é calculado antes do JSX. `deliverSafely` e `readHoneypot` saíram para `delivery/submit-message`, os atributos dos campos para `question/input-attributes`. O envio agora é testável sem a árvore (9 testes do hook, 5 dos helpers).
- **T6 e T12, textos de interface e `PortfolioExperience`.** Os textos que estavam dentro de componentes (mensagens da cena indisponível, "Fechar painel", "Acesso rápido", rótulos do "Sobre", grupo "Corpos celestes", glifo `←` e a falha inesperada do envio) foram para `content/ui.ts`. `PortfolioExperience` caiu de 212 para 144 linhas: `usePortfolioModel` guarda as listas, a seleção e os handlers, `useSceneShell` a disponibilidade da cena, o canal de frames e a revelação, e `getImmersiveTarget` (em `open-section`) monta o alvo do mergulho.

## Tasks abertas

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

### T9 (C) Lógica e ternários pequenos em props de malha

- **Onde:** `PlanetMesh.tsx:49` e `:52` (`texture ? … : …` em `key` e em `emissive`), `SolarSystemScene.tsx:98` (`frameloop`).
- **Proposta:** nomear o valor antes do JSX (`const materialKey = texture ? 'textured' : 'plain'`). Baixo risco, ganho de leitura.

### T10 (C) `.map` com lógica dentro do JSX e handler de várias linhas

- **Onde:** `quick-access-menu/QuickAccessMenu.tsx:131` (`items.map` com 3 statements: posição, estilo e delay calculados no JSX) e
  `solar-scene/SolarSystemScene.tsx:109` (`onCreated` com 2 statements, registra listeners).
- **Proposta:** pré-calcular uma lista de itens prontos (`getOrbitItems`) e extrair o handler do canvas para um hook (ver T21).

## Arquivos com mais de uma responsabilidade

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

### T28 (B) Menu de acesso rápido com mais de três destinos

- **Onde:** `quick-access-menu/orbit-layout.ts`.
- **Problema:** o arco de 90° a 170° só separa três cartões; com um quarto destino (ex.: Projetos) os vizinhos se sobrepõem mesmo no desktop.
- **Proposta:** distribuir os destinos pela altura do cartão (espaçamento vertical mínimo) em vez de por ângulo fixo, ou usar a coluna também no desktop a partir de quatro itens. Medir com o e2e de caixas reais.

### T29 (C) Três versões da mesma proteção contra passo de tempo inválido

- **Onde:** `solar-scene/lib/rotation.ts` (`clampFrameDelta`), `loading-screen/lib/loader-clock.ts` (`sanitizeDelta`) e `venus-arcade/engine/time-step.ts` (`isValidStep`).
- **Problema:** as três tratam `NaN`, negativo e zero de formas quase iguais, mas com regras de teto diferentes; cada feature não pode importar da outra.
- **Proposta:** promover o núcleo comum (`isValidStep`) para `lib/` quando uma quarta feature precisar, e deixar o teto por conta de cada uma.

## Outras observações da varredura

- **`StarField.tsx` usa `useMemo`** (a única ocorrência), contra a regra do projeto de não usá-lo com o React Compiler sem justificativa. Remover
  ou registrar o motivo no `DECISIONS.md` (gera ~2600 posições; vale medir se o compilador já cobre).
- **Casts `as ContactStepIndex` em 4 lugares** (`contact-flow.ts`, `ContactSection.tsx`): o índice da etapa é um número que o tipo não
  garante. Trocar por uma função `toStepIndex(value)` que valida, ou modelar a etapa como união nomeada (`'name' | 'email' | 'message'`).
- **`key` do planeta usa `label`** (`ArcJourney.tsx:75`): está certo enquanto os rótulos forem únicos; o dado deveria ter um `id` próprio.
- **`console` só em `app/actions.ts`** com `eslint-disable` justificado (log de servidor), sem outros usos; nenhuma ação necessária.
