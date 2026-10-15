# Easter egg dos 5000 pontos (em standby)

Etapa 16 do plano do Venus Arcade, pausada a pedido do Matheus até ele decidir algo mais interessante. Nada aqui está implementado além do que a seção "Já existe" descreve.

## Já existe

- `ROOT_SCORE = 5000` e `ROOT_HINT_RATIO = 0.6` em `src/features/venus-arcade/engine/constants.ts`.
- `buildRunResult` calcula `reachedRoot` e `showsRootHint`; `saveRunResult` grava `venusArcade.root = 1` (persistente) e `readRecords` lê `isRootUnlocked`.
- A tela de resultados (`ResultsScreen`) mostra a dica "A SEALED CARTRIDGE IN THE ARCADE REACTED TO THAT SCORE." entre 3000 e 4999 e deixa o rank dourado a partir de 5000.
- A prateleira troca o cadeado pelo cartucho ROOT:// (modo Hotfix: drone dourado, tiro triplo a cada 0,10 s, título dourado) quando `isRootUnlocked`.

## O que o handoff pede e não foi feito

1. Bloco dourado "ROOT ACCESS" na tela de resultados, com linhas de terminal digitadas, uma a cada 520 ms:
   - `> sudo mount /dev/venus/root`
   - `ACCESS GRANTED. Hello, root.`
   - `> cat ~/matheus/note.txt`
   - "Most visitors quit at the first glitch. You read the pattern and shipped anyway. That is the job."
   - "If you want that on your team, let's talk."
2. No fim: "ROOT:// CARTRIDGE UNLOCKED · HOTFIX MODE" e o link "Talk to Matheus →", que fecharia o fliperama e abriria o painel de Contato (exige uma ponte entre `ArcadeExperience` e o portfólio, por exemplo uma prop `onOpenContact` em `ImmersiveView`).
3. `rootScore` calibrado jogando (5000 é estimativa do handoff).

## Por que ficou em standby

O formato do handoff é só texto digitado depois do jogo. Falta uma reação no cenário, quase ninguém chega a 5000 e a recompensa (Hotfix) só aparece na prateleira.

## Ideias levantadas (nenhuma aprovada)

- Cruzar 5000 no meio da partida: glitch dourado no HUD e drone Hotfix por alguns segundos.
- Cabines laterais (CAB-01 e CAB-03) acesas: melhor score, "ROOT" aceso, LEDs mudando.
- Cartucho selado que pulsa conforme o melhor score se aproxima do limite.
- Mini terminal na tela de resultados (`help`, `ls`, `contact`).
- Baixar o `rootScore` para algo que um jogador atento alcance em poucas partidas.

## Perguntas em aberto

- O que deve acontecer, em uma frase, quando a pessoa passar dos 5000?
- O segredo deve levar ao Contato, ou só recompensar?
- Quantas partidas, em média, devem ser necessárias para destravar?

## Para retomar

Responder as perguntas acima, ajustar `ROOT_SCORE` se preciso e dizer "vamos para a etapa 16". Depois, seguir o ciclo de sempre: teste primeiro, validação no navegador, um commit e parada para revisão.
