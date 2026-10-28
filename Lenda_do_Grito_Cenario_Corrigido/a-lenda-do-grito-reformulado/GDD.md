# A Lenda do Grito — Game Design Document
**Versão 4.0 · Terror e sobrevivência indie · Protótipo web 3D**

## 1. Visão geral
Um explorador entra em uma escola abandonada para investigar uma lenda conhecida como “O Grito”. Depois que a entrada se fecha, ele precisa encontrar a chave da portaria e escapar, evitando uma entidade que reage aos ruídos.

**Pilares de design**
- Vulnerabilidade: o protagonista não combate a entidade.
- Tensão legível: o jogador percebe sinais de perigo, mas nunca tem certeza da posição exata do monstro.
- Exploração com propósito: salas e objetos contam parte da história.
- Escolhas de risco: correr economiza tempo, mas aumenta o ruído.

## 2. Fantasia do jogador e narrativa
O jogador é um explorador urbano que investiga o desaparecimento de uma antiga funcionária da escola. Um gravador encontrado no local sugere que o grito não veio de uma pessoa, mas de várias salas ao mesmo tempo. A narrativa é entregue por pistas ambientais, bilhetes e uma gravação opcional, sem longas cenas explicativas.

**Nota de campo inicial:** “Se ouvir alguém chamar pelo seu nome, não responda.”
**Revelação final sugerida:** o gravador registra um segundo conjunto de passos acompanhando o protagonista para fora.

## 3. Objetivo e progressão
1. Entrar na escola e aprender os controles.
2. Explorar salas laterais e identificar pistas.
3. Encontrar a gravação opcional.
4. Encontrar a chave da portaria.
5. Voltar pelo corredor enquanto a entidade está mais agressiva.
6. Interagir com o portão e atravessar a saída.

Vitória: atravessar o portão aberto com a chave. Derrota: perder toda a vida após contatos com a entidade.

## 4. Level design
- **Corredor principal:** eixo de navegação, longo e visualmente repetitivo; luminárias falham em intervalos irregulares.
- **Salas laterais:** carteiras deslocadas, armários e objetos que funcionam como pistas e pontos cegos.
- **Bloco B:** sinalização desgastada indica salas 08–13, insinuando uma sala que não deveria existir.
- **Entrada:** portão de metal que vira o objetivo de retorno.
- **Composição:** janelas quebradas, vitrine tombada, manchas abstratas e mobiliário abandonado.

**Recomendação para a próxima versão:** desenhar um mapa top-down com rotas alternativas reais. O protótipo atual usa um corredor central e salas abertas/alcovas, sem mapa minimapa.

## 5. Protagonista e controles
O protagonista não é exibido em terceira pessoa; a câmera em primeira pessoa aumenta a imersão.
- WASD: andar.
- Mouse: olhar.
- Shift: correr.
- Ctrl/C: agachar.
- E: interagir.
- F: lanterna.
- ESC: pausar.

Corrida consome estamina e aumenta o alcance de detecção por ruído. Agachar reduz a velocidade e o ruído. O balanço de câmera é sutil para não prejudicar conforto e leitura.

## 6. A entidade “O Grito”
Criatura procedural alta, com silhueta estreita, rosto pouco legível, olhos avermelhados e membros longos. A falta de detalhes definidos preserva a imaginação do jogador.

**Estados de IA implementados**
- Patrulha: percorre pontos do corredor.
- Investigação: desloca-se para a posição de um ruído recente.
- Perseguição: segue o protagonista e causa 25 pontos de dano por contato, com intervalo entre danos.

**Limitação técnica:** a navegação é baseada em pontos e colisão simples; não é um sistema de pathfinding completo. A criatura pode precisar de ajuste em áreas apertadas.

## 7. Recursos
- **Vida:** inicia em 100; cada contato causa 25 de dano.
- **Estamina:** diminui ao correr e recupera ao andar/parar.
- **Bateria:** diminui lentamente quando a lanterna está ligada; ao esgotar, apaga.
- **Chave:** necessária para abrir o portão.
- **Gravação:** opcional; adiciona contexto narrativo e pode atrair a entidade.

## 8. Direção de arte
**Proposta:** horror cinematográfico estilizado com materiais PBR, sombras, névoa, iluminação fria e pequenas fontes quentes em vermelho. A luz deve permitir ler o caminho sem revelar todo o ambiente.

Paleta sugerida:
- Carvão `#090B0E`
- Aço `#343B40`
- Concreto `#6B6B64`
- Vermelho de alerta `#C73B3B`
- Âmbar gasto `#C5A46B`

A interface usa contraste alto, textos curtos e agrupamento por missão, evidências, recursos e controles. Efeitos de tela são discretos para preservar legibilidade.

## 9. Áudio planejado
A versão atual ainda não inclui arquivos de áudio. Próximas camadas recomendadas:
1. Ambiência contínua de ventilação e fluorescentes.
2. Passos posicionais com superfície diferenciada.
3. Estalos e batidas ocasionais, sem padrão previsível.
4. Vozes distantes usadas com parcimônia.
5. Assinatura sonora da entidade antes de entrar em perseguição.

Evitar sustos sonoros constantes: o silêncio e a antecipação devem ser parte do ritmo.

## 10. Interface e experiência
HUD lateral com missão, integridade, fôlego, bateria e evidências. Toasts comunicam eventos importantes. A interação aparece apenas quando um objeto está ao alcance. A tela de início apresenta premissa e controles; a tela final distingue fuga de captura.

## 11. Tecnologias
- HTML5 e CSS3: interface.
- JavaScript ES Modules: regras e lógica de jogo.
- Three.js: renderização 3D, luzes, materiais, sombras, câmera e névoa.
- CDN: carrega Three.js e fontes externas.

## 12. Testes de aceitação
- A cena carrega e se adapta ao redimensionamento.
- WASD move o jogador; mouse altera a direção da câmera.
- Correr consome estamina; agachar reduz velocidade e ruído.
- F liga/desliga a lanterna; a bateria descarrega.
- A entidade patrulha, investiga ruídos e persegue.
- O contato com a entidade reduz 25 pontos de vida.
- A chave pode ser coletada e atualiza a missão.
- O portão não abre sem a chave.
- A gravação opcional atualiza a evidência e a nota.
- ESC pausa e retomar continua a partida.
- Vida zero encerra a partida; sair pelo portão encerra com vitória.

## 13. Uso de IA e integridade acadêmica
A IA pode apoiar planejamento, prototipagem e revisão. O estudante deve executar, testar, entender e registrar as alterações realmente realizadas. Exemplos de prompts utilizados neste ciclo:
- “Reformule o level design para aumentar a tensão e reforçar a narrativa ambiental.”
- “Implemente estados de patrulha, investigação de ruído e perseguição em Three.js.”
- “Crie uma HUD de sobrevivência com vida, estamina, bateria e objetivos.”
- “Revise os testes de aceitação e documente as limitações do protótipo.”

## 14. Licenças e publicação
O projeto usa Three.js via CDN. Os modelos desta versão são criados proceduralmente no código. Se forem adicionados modelos de terceiros, conferir licença, uso permitido e atribuição. O pipeline GitLab Pages publica a página estática e suas pastas.
