# Aura Beauty - E-commerce Frontend

Este é um projeto de frontend para um site de e-commerce fictício chamado Aura Beauty, focado em produtos de beleza e cuidados com a pele.

## Páginas

O projeto inclui as seguintes páginas:

- **Home (`index.html`):** Página inicial com banner, destaques e talvez categorias.
- **Produtos (`products.html`):** Exibe a lista de todos os produtos disponíveis.
- **Detalhes do Produto (`product-detail.html`):** Mostra informações detalhadas sobre um produto específico.
- **Carrinho (`cart.html`):** Exibe os itens adicionados ao carrinho de compras.

## Funcionalidades

- Navegação entre as páginas.
- Visualização de produtos.
- Adição de produtos ao carrinho (usando `localStorage`).
- Visualização e gerenciamento básico do carrinho.
- Design responsivo (utilizando Tailwind CSS).

## Tecnologias Utilizadas

- HTML5
- CSS3 (com Tailwind CSS)
- JavaScript (Vanilla JS)

## Como Executar

1.  Clone ou baixe este repositório.
2.  Abra qualquer um dos arquivos `.html` (por exemplo, `index.html`) diretamente no seu navegador web.

Não há necessidade de um servidor web ou processo de build para visualizar as páginas estáticas.

## Deploy

O projeto está disponível online através do Firebase Hosting:

[Aura Beauty - Firebase App](https://gtp-isis-okamoto-study-0001.web.app/index.html)

### Comandos para Deploy (Firebase CLI)

1.  **Instalar o Firebase CLI:**
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login no Firebase:**
    ```bash
    firebase login
    ```
3.  **Inicializar o Firebase no projeto (se ainda não foi feito):**
    Navegue até a pasta raiz do projeto no terminal e execute:
    ```bash
    firebase init
    ```
    - Selecione "Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Action deploys".
    - Escolha um projeto existente ou crie um novo.
    - Especifique o diretório público (geralmente a pasta raiz `.` ou uma pasta como `public` ou `dist`, dependendo da estrutura do seu projeto. Para este projeto, a raiz `.` é adequada se todos os arquivos HTML/CSS/JS estão lá).
    - Configure como single-page app (SPA): Responda **No** se você não estiver usando um framework JS que lida com roteamento.
    - Configure builds e deploys automáticos com GitHub: Escolha **No** por enquanto, a menos que deseje configurar isso.

4.  **Fazer o deploy:**
    Após qualquer alteração que deseje publicar, execute:
    ```bash
    firebase deploy
    ```
