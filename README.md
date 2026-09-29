# Vesper Rift

Roguelike de ação 2D construído com JavaScript, HTML, CSS, PixiJS e Three.js, com arena responsiva, tiro automático, dash, inimigos com comportamentos distintos, upgrades aleatórios, partículas, áudio e interface própria em português.

## Netlify

https://vesperrift-javascript.netlify.app/

## Recursos

* Tela única com a arena carregada diretamente no link.
* Overlay inicial com controles e botão para começar a run.
* Renderização 2D com PixiJS.
* Background decorativo em Three.js, separado do gameplay.
* Jogador com movimentação WASD, dash e mira pelo mouse.
* Disparo automático com variações por upgrade.
* Inimigos melee, ranged e charger com comportamentos diferentes.
* Progressão por XP e checkpoint de upgrade durante a run.
* Escolha customizada de 1 entre 3 upgrades, sem modal nativo do navegador.
* Hit flash, screen shake, partículas e números de dano flutuantes.
* HUD com vida, XP, tempo, onda, inimigos e abates.
* Menu de pausa e tela de fim de run customizados.
* Pooling de projéteis, partículas e textos de dano.
* Spatial partitioning para otimizar colisões.
* Topbar fixa em desktop e mobile, sem menus adicionais.
* Controles touch simples para mobile.
* Layout totalmente responsivo.
* Testes unitários com Vitest.

## Stack

* JavaScript
* HTML
* CSS
* PixiJS
* Three.js
* Vite
* Vitest

## Arquitetura

```txt
src/
 ├── core/         game loop, input, câmera, áudio, eventos, pooling e grid espacial
 ├── components/   componentes lógicos reutilizáveis de jogo
 ├── data/         configurações de inimigos e upgrades
 ├── entities/     jogador, inimigos, projéteis, pickups, partículas e textos
 ├── scenes/       cena principal da arena
 ├── systems/      movimento, combate, IA, colisão, spawn, upgrades e render
 ├── three/        background WebGL em Three.js
 ├── ui/           HUD, toast, overlay de upgrade e controles mobile
 ├── visuals/      arte detalhada e reutilizável das naves
 └── utils/        utilitários gerais
```

A organização separa renderização, regras de jogo, entidades, sistemas e interface. O objetivo é manter o projeto fácil de navegar e permitir evolução da arena sem concentrar toda a lógica em um único arquivo.

## Requisitos

* Node.js 20.16.0 ou superior.
* npm 10 ou superior.

## Como clonar e rodar

```bash
git clone <url-do-repositorio>
cd vesperrift-javascript
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Controles

```txt
WASD       movimentar
Mouse      mirar
Espaço     dash
Esc        pausar
Touch      botões virtuais no mobile
```

## Scripts disponíveis

```bash
npm run dev        # inicia o ambiente de desenvolvimento
npm run build      # gera a versão de produção
npm run preview    # executa a versão gerada localmente
npm test           # executa os testes unitários
npm run test:watch # executa os testes em modo observação
```

## Build

```bash
npm run build
npm run preview
```

A pasta `dist` pode ser publicada em hospedagens estáticas como Netlify.

## Observações técnicas

* O projeto usa JavaScript, HTML, CSS, PixiJS e Three.js para entregar uma experiência de jogo web responsiva, leve e executada diretamente no navegador.
* PixiJS é usado para o gameplay 2D, incluindo sprites vetoriais, textos, partículas e câmera.
* Three.js é usado apenas como camada visual de fundo, mantendo o gameplay independente.
* O sistema de pooling reduz criação e descarte constante de objetos durante combates longos.
* A grade espacial diminui o custo de colisão entre projéteis e inimigos.
* O jogador recebe upgrades por nível de XP e por checkpoint de tempo.
* Os inimigos usam comportamentos simples de state machine para perseguição, distância e investida.


## Atualização visual — Deep Space

Esta atualização é exclusivamente visual: velocidades, dano, hitboxes, spawn,
progressão, controles e regras de combate foram preservados.

* **Naves em camadas:** blindagem com faces claras e escuras, cockpit de vidro,
  painéis, entradas de motor e luzes de navegação. O jogador tem um interceptador
  ciano; melee tem garras frontais vermelhas; ranged tem canhões duplos âmbar;
  charger tem uma fuselagem alongada violeta.
* **Propulsores animados:** exaustão pulsa, aumenta com movimento/dash e se alonga
  durante a investida dos chargers. A orientação visual acompanha a mira e os
  disparos automáticos, inclusive no touch.
* **Combate:** projéteis com núcleo luminoso e cauda orientada pela velocidade,
  estilhaços de impacto e cristais de XP facetados com oscilação suave.
* **Espaço profundo:** nebulosa procedural com distorção animada no shader,
  estrelas em diferentes profundidades, planeta iluminado com atmosfera e anéis
  inclinados, além de asteroides 3D com rotação independente e paralaxe da câmera.
* **Arena e interface:** marcadores de navegação discretos substituem a grade
  opaca; painéis metálicos e detalhes luminosos mantêm a leitura do HUD.

### Orçamento gráfico

O fundo Three.js é decorativo e separado das colisões. Ele é limitado a 30 FPS,
com escala de resolução de 75% no desktop e 60% em telas até 767 px, DPR limitado
em 1,5 e sem antialiasing ou pós-processamento de bloom. O gameplay PixiJS mantém
seu ticker e resolução originais. Não há texturas externas ou novas dependências.

Os asteroides usam `InstancedMesh` (uma chamada de desenho), as estrelas usam um
único `Points` e a nebulosa roda no shader, sem gerar texturas a cada frame.
Em telas pequenas são criados 420 pontos estelares e 22 asteroides, contra 850 e
48 no desktop. A quantidade é escolhida ao carregar a página; a resolução acompanha
redimensionamentos. A geometria das naves é construída na criação/reciclagem;
a animação altera apenas transformações e opacidade. O pooling existente foi mantido.

O fundo suspende a renderização em abas ocultas e congela a animação durante a
pausa/fim da run. `prefers-reduced-motion` reduz as animações decorativas, sem
alterar o gameplay. `destroy()` libera geometrias, materiais, renderer e observador
de tamanho do fundo. O desempenho final depende da GPU, resolução e navegador.

### Onde personalizar

* `src/visuals/shipArt.js`: silhuetas, blindagem, cockpit e paletas das naves.
* `src/systems/RenderSystem.js`: propulsores, cristais e marcadores da arena.
* `src/three/createNebulaBackground.js`: shaders, planeta, anéis, paralaxe e limites gráficos.
* `src/entities/Projectile.js` e `Particle.js`: disparos e estilhaços.

### Validação

`npm run build` e `npm test` verificam o empacotamento e os testes existentes.
Para revisão visual, conferir desktop/mobile, início e pausa, dash, os três tipos
de inimigo, reutilização de entidades e contraste de projéteis sobre a nebulosa.
