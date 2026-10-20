# A Lenda do Grito

Jogo de terror 2D para navegador, desenvolvido com HTML, CSS e JavaScript puro.

## Como executar
1. Baixe ou extraia a pasta do projeto.
2. Abra `index.html` no navegador.
3. Para desenvolver, recomenda-se usar o Visual Studio Code e a extensão Live Server.

## Como jogar
- **WASD** ou setas: mover o personagem.
- **E**: pegar a chave quando estiver perto.
- **F**: ligar/desligar a lanterna.
- **ESC**: pausar.
- Encontre a chave e alcance a saída sem perder todas as vidas.

## Estrutura
- `index.html`: estrutura e interface.
- `css/style.css`: visual, cores e responsividade.
- `js/game.js`: movimentação, colisões, inimigo, chave, vitória e derrota.
- `GDD.docx`: documento de design do jogo.
- `assets/images/capa.png`: capa conceitual do projeto.

## Publicar no GitLab Pages
1. Crie uma conta no GitLab e um projeto público chamado `a-lenda-do-grito`.
2. Envie todos os arquivos do projeto para a branch `main`.
3. Crie `.gitlab-ci.yml` na raiz com o conteúdo abaixo.
4. Abra **Deploy > Pages** no projeto e confira o endereço publicado.

```yaml
pages:
  stage: deploy
  script:
    - mkdir public
    - cp index.html public/
    - cp -r css js assets public/
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

O endereço costuma seguir o padrão `https://SEU-USUARIO.gitlab.io/a-lenda-do-grito/`, mas use o endereço exato mostrado pelo GitLab. Teste em janela anônima antes de entregar.

## Observação
O jogo é um protótipo educacional com gráficos desenhados por Canvas. Sons, mapas adicionais e inventário avançado podem ser melhorias futuras.
