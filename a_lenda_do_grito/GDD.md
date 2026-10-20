# A Lenda do Grito — GDD

## 1. Visão geral

A Lenda do Grito é um jogo de terror 2D para navegador. O jogador explora uma floresta escura perto de uma casa abandonada, procura uma chave e tenta alcançar a saída enquanto uma presença misteriosa o persegue.

## 2. Objetivo do jogo

Sobreviver, encontrar a chave dourada e chegar à saída. O jogador perde quando suas três vidas acabam. A partida termina com vitória quando o personagem alcança a saída depois de pegar a chave.

## 3. Público e plataforma

Jogo casual para estudantes e pessoas que gostam de suspense leve. Foi planejado para computadores com navegador moderno. Não exige instalação de motor de jogo.

## 4. Tecnologias utilizadas

HTML5: organiza os elementos da página e a interface. CSS3: define cores, layout, tipografia e adaptação a telas menores. JavaScript: controla movimentação, colisões, inimigo, vida, tempo, chave, lanterna, pausa e condições de vitória/derrota. Canvas 2D: desenha o cenário e os personagens diretamente no navegador.

## 5. Mecânicas e interação

O personagem se move pelo cenário, contorna pedras, procura a chave e evita o fantasma. A lanterna ajuda a criar o clima de exploração. O HUD mostra objetivo, vidas, estado da chave e tempo de partida.

## 6. Controles

W/A/S/D ou setas: movimentar. E: pegar a chave ou interagir quando estiver perto. F: ligar/desligar a lanterna. ESC: pausar. Botão “Reiniciar partida”: recomeçar do início.

## 7. Regras, progresso e pontuação

Vitória: pegar a chave e alcançar a saída. Derrota: perder as três vidas ao encostar no fantasma. Progresso: a interface muda de “Encontre a chave” para “Escape pela saída” depois da coleta. O tempo da partida é mostrado na tela; nesta versão não existe sistema de pontos numéricos.

## 8. Direção visual e áudio

A identidade visual usa tons escuros, vermelho para perigo e dourado para a chave. Árvores, pedras, casa, fantasma e iluminação são desenhados com Canvas. A versão atual não inclui arquivos de áudio; sons ambientes e sustos sonoros são melhorias futuras.

## 9. Uso da inteligência artificial

A IA pode ser usada como apoio para planejar mecânicas, sugerir estrutura de arquivos, explicar funções JavaScript e localizar erros. Exemplos de prompts: “Crie um jogo de terror 2D em JavaScript Canvas com chave, saída e inimigo”; “Explique como funciona a detecção de colisão entre dois círculos”; “Revise meu código e procure erros de sintaxe”; “Sugira melhorias de acessibilidade e responsividade”. O estudante deve testar o código, adaptar as ideias e conseguir explicar as partes principais.

## 10. Problemas e soluções

Problema possível: personagem atravessar obstáculos. Solução: testar as colisões e ajustar o raio dos objetos. Problema possível: jogo rápido demais. Solução: ajustar velocidade do jogador e do inimigo. Problema possível: o GitLab Pages não encontrar os arquivos. Solução: conferir caminhos relativos, nomes de arquivos e o pipeline de publicação. Registre os problemas realmente encontrados durante os testes e substitua estes exemplos quando necessário.

## 11. Testes recomendados

Testar início e reinício; movimento nas quatro direções; colisões com pedras; coleta da chave com E; bloqueio da saída sem chave; vitória com chave; perda das três vidas; pausa com ESC; lanterna com F; layout em janela estreita; acesso público ao GitLab Pages.

## 12. Publicação

O repositório deve conter index.html, css/style.css, js/game.js, assets, README.md, GDD.docx e .gitlab-ci.yml. Depois do envio, abrir Deploy > Pages, copiar a URL publicada e testar em janela anônima ou em outro dispositivo.

## 13. Melhorias futuras

Adicionar efeitos sonoros, mais salas e mapas, itens colecionáveis, níveis de dificuldade, menu de configurações, opções de acessibilidade e recorde de tempo.