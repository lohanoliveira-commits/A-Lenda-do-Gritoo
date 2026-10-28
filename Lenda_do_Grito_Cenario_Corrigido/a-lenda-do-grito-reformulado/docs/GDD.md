# A Lenda do Grito — Game Design Document
**Versão 4.0 · Terror e sobrevivência indie · Protótipo web 3D**

## Conceito
Um explorador entra em uma escola abandonada para investigar a lenda “O Grito”. A entrada fecha e ele precisa encontrar a chave da portaria, enquanto uma entidade reage aos ruídos e patrulha os corredores.

## Pilares
- Vulnerabilidade: sem combate direto.
- Tensão legível: sinais de ameaça sem revelar sua posição o tempo todo.
- Exploração com propósito: objetos e espaços contam a história.
- Risco e recompensa: correr acelera a fuga, mas faz barulho.

## Loop principal
Explorar → encontrar pistas → administrar bateria e fôlego → evitar a entidade → encontrar a chave → retornar ao portão → escapar.

## Mapa
O corredor principal orienta a navegação; salas laterais e alcovas oferecem pistas e pontos cegos. O Bloco B tem sinalização desgastada indicando salas 08–13. A entrada é o ponto de retorno. O protótipo atual usa corredor central e áreas laterais abertas, sem minimapa ou rotas alternativas plenamente conectadas.

## Entidade
Modelo procedural alto, com silhueta estreita, rosto pouco legível e olhos avermelhados. IA implementada:
- Patrulha por pontos definidos.
- Investigação da posição de ruído recente.
- Perseguição do protagonista.
- Dano de 25 pontos por contato, com intervalo entre danos.

A navegação é simplificada e não substitui pathfinding completo.

## Recursos e controles
- Vida: 100; contato causa 25 de dano.
- Estamina: cai ao correr e recupera ao caminhar/parar.
- Bateria: cai lentamente enquanto a lanterna está ligada.
- WASD: mover; mouse: olhar; Shift: correr; Ctrl/C: agachar; E: interagir; F: lanterna; ESC: pausar.

## Direção de arte
Horror cinematográfico estilizado, materiais PBR, sombras, névoa, luz fria e acentos vermelhos. Paleta: carvão `#090B0E`, aço `#343B40`, concreto `#6B6B64`, vermelho `#C73B3B` e âmbar `#C5A46B`.

## Áudio
Ainda sem arquivos de áudio integrados. Recomenda-se ambiência de ventilação, fluorescentes, passos posicionais, ruídos distantes e uma assinatura sonora da entidade.

## Tecnologias e publicação
HTML, CSS, JavaScript ES Modules e Three.js. O `.gitlab-ci.yml` publica `index.html`, `css`, `js` e `assets` pelo GitLab Pages.

## Testes
Testar movimento, câmera, corrida, agachamento, bateria, lanterna, estados da entidade, dano, coleta da chave, portão trancado, vitória, derrota, pausa e publicação.
