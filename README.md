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

