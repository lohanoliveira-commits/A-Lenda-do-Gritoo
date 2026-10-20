# A Lenda do Grito — Escola do Terror 3D

## Executar
Extraia o ZIP, abra a pasta no VS Code, instale Live Server, abra `index.html` e clique em **Go Live**. Também funciona com `python -m http.server 8000` e `http://localhost:8000`. Não abra diretamente com `file://`.

## Controles
- WASD: andar
- Mouse: olhar ao redor
- Shift: correr; consome estamina, que recupera quando você para
- E: pegar a chave ou abrir a porta
- F: lanterna
- ESC: pausar

## Mecânicas
A vida começa em 100. Cada vez que o monstro alcança o protagonista, remove 25 pontos. Ao chegar a zero, a partida acaba. A estamina diminui ao correr e recupera ao caminhar/parar. Pegue a chave e volte à entrada para vencer.

## Tecnologias
HTML5, CSS3, JavaScript ES Modules e Three.js. O GLTFLoader tenta carregar `assets/models/chave.glb`.

## Modelos Sketchfab
Os links fornecidos foram usados como referência de arte. Os modelos exatos não são importados automaticamente das páginas Sketchfab; a escola, a criatura e a boneca são representações 3D construídas no código. Para usar modelos oficiais, baixe apenas arquivos disponibilizados pelo autor e confira a licença. Substitua/adicione os arquivos GLB e ajuste os caminhos no código.

## GitLab Pages
O `.gitlab-ci.yml` copia a página, CSS, JS e assets para `public`. Envie os arquivos ao GitLab, confira **Build > Pipelines** e abra **Deploy > Pages** para pegar a URL pública.

## Atualização profissional — portão, iluminação e personagens

- **Portão metálico de duas folhas:** começa fechado e desliza para os lados após encontrar a chave; use `E` perto da saída para concluir a fuga.
- **Iluminação física:** renderer com tone mapping ACES, materiais PBR (`MeshStandardMaterial`), sombras suaves, luz ambiente reduzida e lanterna com `SpotLight`, atenuação e penumbra.
- **Personagem OBJ:** tenta carregar o modelo de demonstração `male02.obj` e materiais do repositório oficial de exemplos do Three.js.
- **Perseguidor MD2:** tenta carregar o modelo `ogro.md2` com textura e tocar uma animação disponível. Se os arquivos externos não estiverem acessíveis, o jogo mantém os personagens procedurais para continuar funcionando.
- Os modelos de demonstração são baixados de `threejs.org` durante a execução, então é necessária conexão com a internet. A disponibilidade dos endereços externos pode mudar.

### Referências técnicas
- Three.js — [luzes físicas](https://threejs.org/examples/#webgl_lights_physical)
- Three.js — [spotlight](https://threejs.org/examples/#webgl_lights_spotlight)
- Three.js — [OBJLoader](https://threejs.org/examples/#webgl_loader_obj)
- Three.js — [MD2Loader](https://threejs.org/examples/#webgl_loader_md2)
