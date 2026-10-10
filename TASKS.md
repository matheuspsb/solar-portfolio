# Tasks futuras (varredura de prop drilling e vizinhança)

Origem: varredura de todos os componentes de `src/` feita depois de corrigir o prop drilling de `targetingCopy` e `onSendContactMessage`.
Critério de "prop drilling": uma prop atravessa um ou mais componentes que **não a usam** só para entregá-la a um descendente.
Cada task tem contexto, onde está, proposta e critério de pronto. Prioridade: **A** (vale fazer logo), **B** (melhora clara), **C** (opcional).

## Já resolvido nesta varredura

- **`onSendContactMessage`** passava por `PortfolioExperience → SectionView → ContactSection` sem ser usada nos dois primeiros.
  Agora a Server Action entra por `ContactSubmitterProvider` (feature `content-panel`) e o `ContactSection` lê com `useContactSubmitter()`.
- **`targetingCopy`** passava pela página e por `PortfolioExperience` até o `TargetCard`. Como é texto estático, a solução é a mais simples: o
  `TargetCard` importa `content/targeting.ts` direto e monta o `kicker` a partir do `code` do corpo (uma primeira versão com contexto era exagero).
- O provider do envio é montado por `PortfolioProviders` (`features/portfolio`), usado em `app/page.tsx`. Ele existe porque a página é um
  Server Component e não pode importar o barrel de uma feature inteira (arrastaria hooks de cliente para o servidor).

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

- **Onde:** `features/content-panel/sections/contact/ContactSection.tsx` (323 linhas).
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
