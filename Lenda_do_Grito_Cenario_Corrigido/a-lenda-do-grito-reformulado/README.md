# A Lenda do Grito — Escola do Terror

Protótipo reformulado de terror e sobrevivência em Three.js. O foco desta versão é reforçar a leitura visual, a tensão sonora sugerida pelo comportamento da entidade, a exploração e a clareza da interface.

## O que foi reformulado
- Interface UI/UX com hierarquia visual, HUD de vida, fôlego e bateria.
- Cenário 3D escolar com corredores longos, salas laterais, armários, carteiras, janelas, luzes oscilantes, névoa e portão metálico.
- Entidade procedural com estados de patrulha, investigação de ruído e perseguição.
- Chave de saída, gravação opcional, nota narrativa e objetivo de fuga.
- Lanterna com bateria, corrida com gasto de fôlego e agachamento que reduz ruído.
- Efeitos visuais leves, luz física, sombras e tratamento de cor.
- GDD atualizado e pipeline de GitLab Pages mantido.

## Como executar
1. Extraia a pasta e abra-a no VS Code.
2. Instale a extensão **Live Server**.
3. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.
4. É necessária conexão com a internet para carregar Three.js pelo CDN e as fontes. Se a escola não renderizar, confira o console do navegador (F12).

Alternativa: na pasta do projeto, execute `python -m http.server 8000` e abra `http://localhost:8000`.

## Controles
- **WASD**: mover
- **Mouse**: olhar ao redor (clique na cena para capturar o mouse)
- **Shift**: correr; gasta fôlego e faz mais barulho
- **Ctrl** ou **C**: agachar e reduzir ruído
- **E**: coletar item / abrir o portão
- **F**: ligar/desligar a lanterna
- **ESC**: pausar

## Loop de jogo
1. Explorar o bloco escolar e observar as pistas.
2. Encontrar a gravação opcional para aprofundar a narrativa.
3. Localizar a chave da portaria.
4. Gerenciar fôlego, lanterna e distância da entidade.
5. Voltar à entrada, abrir o portão e atravessar a saída.

A entidade patrulha o mapa, investiga sons e persegue quando detecta o jogador. Correr ajuda a escapar no curto prazo, mas aumenta a chance de chamar a ameaça.

## Estrutura
```text
a-lenda-do-grito-reformulado/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── game.js
├── assets/
│   ├── audio/
│   └── models/
├── docs/
│   ├── GDD.md
│   └── GDD.docx
├── .gitlab-ci.yml
└── README.md
```

## GitLab Pages
O `.gitlab-ci.yml` copia `index.html`, `css`, `js` e `assets` para `public`. Faça commit e push para a branch padrão; depois confira **Build > Pipelines** e **Deploy > Pages** no GitLab.

## Limitações conhecidas do protótipo
- O monstro e os itens são modelos procedurais; não dependem de arquivos externos licenciados.
- A gravação é representada por um item visual e texto, ainda sem arquivo de áudio narrativo.
- A IA usa patrulha e movimento de perseguição simples; não possui pathfinding completo para contornar todos os obstáculos.
- A bateria consome lentamente enquanto a lanterna está ligada; não há itens de recarga nesta versão.
- O sistema de colisão é simplificado e precisa de testes em diferentes tamanhos de janela.

## Próximas melhorias recomendadas
1. Pathfinding por waypoints/navegação para a entidade.
2. Sons posicionais próprios: passos, fluorescentes, portas, respiração e vocalização distante.
3. Modelos e animações licenciados, com atribuição conforme a licença.
4. Testes de acessibilidade, controles touch e otimização para dispositivos modestos.
5. Testes de playtest para ajustar velocidade, distância de detecção e frequência de dano.


## Se o cenário ficar preso em “Preparando a ocorrência”

1. Extraia o ZIP inteiro para uma pasta local.
2. No VS Code, abra essa pasta e execute `index.html` com a extensão **Live Server** (não abra com `file://`).
3. Confirme que a internet está ativa, pois o Three.js é carregado por CDN. O jogo tenta duas CDNs automaticamente.
4. Se continuar travado, pressione `F12`, abra **Console** e confira a primeira mensagem vermelha.
5. Atualize com `Ctrl + F5`. Se aparecer erro de WebGL, atualize o navegador/driver gráfico ou teste outro navegador moderno.
