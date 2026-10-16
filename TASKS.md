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
- **T3 e T4, props que só atravessavam componentes.** A textura do emblema do Sol virou dado do conteúdo "Sobre" (`AboutContent.emblem.textureUrl`, derivada de `content/textures.ts`, a mesma constante do corpo), então `SectionView` e `AboutSection` perderam a prop `emblemTextureUrl`. `ArcJourney`, `JourneyPlanet`, `DeliveryScene` e `MercuryPlanet` leem `usePrefersReducedMotion()` direto; `ContactSection` não repassa mais `reducedMotion`. Os testes forçam o valor com `stubReducedMotion` (`src/test`).
- **T26, hover perdido quando a textura chega.** Não foi possível reproduzir hoje. Com movimento reduzido e as texturas atrasadas, o ponteiro parado sobre Mercúrio manteve o alvo travado e o cursor `pointer` depois da chegada das texturas em todas as tentativas (8 execuções do teste novo e cerca de 25 de sondagem, variando o atraso entre 0 e 3,5 s e o instante em que o ponteiro chega). O sintoma provavelmente foi corrigido por mudanças posteriores (interação lida pela malha, T2, e revelação da cena). Fica o e2e `hover-texture.spec.ts` como guarda permanente do cenário descrito; se o bug voltar, ele falha.
- **T10, T13, T16 e T28, `QuickAccessMenu`.** O estado do menu (abrir, fechar, foco, pressão, navegação por setas) foi para `useQuickAccessMenu`; o clique fora virou o hook `useDismissOnOutsidePointer`; o foco no primeiro item acontece no mesmo gesto que abre o menu (`flushSync` no handler), sem effect; o anel e o brilho são `OrbitRing`; a lista pronta de destinos (código, posição e atraso) vem de `getOrbitItems`, sem cálculo no JSX. Com mais de três destinos o menu usa a coluna (`MAX_ARC_ITEMS`), em qualquer largura, porque o arco só separa três cartões. `QuickAccessMenu` caiu de 160 para 107 linhas. O `onCreated` da cena, citado no T10, já tinha sido resolvido no T21.
- **T15, T17 e T19, effects dispensáveis.** `AnswerField` foca com `autoFocus` (sem effect, ref extra nem `attachControl`); `useTexture` ganhou o terceiro parâmetro `onSettled`, chamado na própria promessa de carga (ou de imediato quando não há textura), e `CelestialBody` perdeu o effect que avisava a cena; `useCameraTakeover` passou a derivar o estado de `{ nonce, isTakenOver }` e devolve um booleano, sem effect para zerar um ref.
- **T18 e T20, mantidos de propósito.** O effect do `SceneEffects` marca que o compositor de pós-processamento está montado; avisar pela promessa do `import()` sinalizaria só que o código chegou, um instante antes do bloom existir, e exigiria criar o `lazy` dentro do componente. O effect de movimento reduzido do `use-comet` reage a uma preferência que muda com o tween em andamento e é o uso legítimo do effect. O `isMountedRef` citado no T20 já não existe (ver `DECISIONS.md`).
- **T14, arquivos com mais de uma responsabilidade.** `SolarSystemScene` (176 para 116 linhas) agora só monta o `Canvas`, a revelação e o rastreador; a câmera inteira (distância, foco, mergulho, deslocamento, zoom por teclado e `OrbitControls`) é `SceneCamera` e a lista de corpos com o contexto de interação é `SceneBodies`. O `use-comet` (143 para 38 linhas) só liga o React: o motor do cometa (laço de quadros, interpolação, promessas e movimento reduzido) é `createCometEngine`, testável sem React. `domain/celestial-body.ts` ficou só com os tipos e `getInteractiveBodies`; a validação foi para `celestial-body-validation.ts` e os construtores dos testes para `src/test/celestial-body-builders.ts`.
- **T27, cena renderizando atrás do loader.** A cena fica em repouso (`frameloop="never"`) enquanto o loader a cobre e acorda quando ele termina ou é pulado. O `LoadingGate` avisa quando está ativo (`onActiveChange`) e o `PortfolioExperience` junta isso com o fliperama aberto em `isHidden`. Medido com `scripts/measure-loader.mjs first` (CPU 4x mais lenta, 390x844, WebGL por software): quadro mediano 50 ms para 17 ms, p95 133 ms para 17 ms, bloqueio de 866 ms para 86 ms; com CPU 6x, 1275 ms para 215 ms de bloqueio. Em 15 s de janela, que inclui o fim do loader, o p95 continua 17 ms: não há tranco na revelação.
- **T9, T29 e as observações avulsas.** `PlanetMesh` nomeia a chave e a cor emissiva do material antes do JSX; `isValidStep` foi para `lib/time-step` (o fliperama e o loader usam o mesmo; a rotação da cena mantém seu limite próprio, que trata `Infinity` como o teto, e tem teste que exige isso); `toStepIndex` valida o índice da etapa do contato (nenhum `as ContactStepIndex` fora da função); os planetas da jornada têm `id` próprio (`field` da etapa) e a chave deixou de ser o rótulo.
- **T7 e `useMemo` do `StarField`, decididos.** Ver `DECISIONS.md`: a injeção de dependências por props opcionais fica como está, e o `useMemo` do campo de estrelas fica porque o buffer de posições precisa ter identidade estável para o R3F.

## Tasks abertas

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

## Arquivos com mais de uma responsabilidade

## useEffect

### Legítimos (sincronizam com algo de fora do React; manter)

`use-modal-focus` (foco e Escape), `use-element-width` (ResizeObserver), `use-decoded-text`, `use-intent-target`, `use-scene-reveal`,
`use-idle-ready`, `use-texture` (todos com timer ou carga assíncrona e limpeza), `KeyboardZoom`, `use-camera-takeover` (listener),
`BodyTracker` (`invalidate` no modo sob demanda), `CameraDistance` (aplica a distância à câmera 3D), `DeliveryReceipt` (foco no título ao entrar:
`autoFocus` não funciona em `<h2>`).

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

## Outras observações da varredura

- **`console` só em `app/actions.ts`** com `eslint-disable` justificado (log de servidor), sem outros usos; nenhuma ação necessária.
