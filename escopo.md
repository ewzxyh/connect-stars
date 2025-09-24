# Escopo do Projeto: Connect The Stars

## 1. Visão Geral
"Connect The Stars" é uma aplicação web interativa que permite aos usuários descobrir o caminho de conexão mais curto entre dois atores de cinema através dos filmes em que atuaram juntos. O projeto serve como uma implementação moderna do conceito "Seis Graus de Separação", utilizando uma interface gráfica para visualizar a rede de conexões.

Use apenas filmes, séries e jogos americanos.

## 2. Funcionamento e Fluxo do Usuário
1.  **Acesso à Página:** O usuário acessa a página principal, que apresenta uma interface limpa com dois campos de entrada principais: "Ator de Partida" e "Ator de Destino".
2.  **Seleção de Atores:** Ao digitar em qualquer um dos campos, uma função de autocompletar fará chamadas à API do TMDB para sugerir atores correspondentes em tempo real. O usuário seleciona um ator para cada campo.
3.  **Início da Busca:** O usuário clica no botão "Conectar". A aplicação inicia um algoritmo de busca (como o Breadth-First Search) para encontrar o caminho mais curto entre os dois atores.
4.  **Processamento de Dados:** O backend (ou funções de servidor do Next.js) interage intensamente com a API do TMDB, buscando os créditos de filmes de um ator para encontrar o elenco desses filmes, expandindo a rede de busca passo a passo.
5.  **Visualização do Grafo:** Uma vez que o caminho é encontrado, o resultado é renderizado visualmente na tela. A biblioteca `react-cytoscapejs` exibirá os atores e os filmes como nós no grafo. As arestas conectarão um ator a um filme em que atuou. O caminho mais curto será destacado.
6.  **Interatividade:** O usuário poderá interagir com o grafo, como dar zoom, arrastar os nós e clicar em um ator ou filme para ver mais detalhes (potencialmente em um modal ou painel lateral).

## 3. Stack de Tecnologia
* **Framework:** **Next.js**
    * **Justificativa:** Utilizado para aproveitar a renderização no lado do servidor (SSR) ou geração de site estático (SSG) para um carregamento inicial rápido e melhor SEO. A estrutura baseada em React facilita a criação de componentes interativos.
* **Componentes de UI:** **shadcn/ui**
    * **Justificativa:** Oferece uma coleção de componentes acessíveis, reutilizáveis e esteticamente agradáveis que podem ser facilmente customizados para se alinhar à identidade visual do projeto, sem impor um estilo rígido.
* **Visualização de Grafo:** **react-cytoscapejs**
    * **Justificativa:** Um wrapper React para a poderosa biblioteca Cytoscape.js, simplificando sua integração no ecossistema do Next.js. Permite a manipulação do grafo de forma declarativa através de props e estado do React.
* **Fonte de Dados:** **The Movie Database (TMDB) API**
    * **Justificativa:** Fornece acesso abrangente e gratuito a uma vasta base de dados de filmes, atores e seus respectivos créditos, que é a espinha dorsal do projeto.

## 4. Requisitos da API (TMDB)
* **Gerenciamento de Chave:** A chave da API do TMDB deve ser armazenada de forma segura como uma variável de ambiente no arquivo `.env.local` e acessada exclusivamente no lado do servidor (`getStaticProps`, `getServerSideProps` ou `Route Handlers`).
* **Internacionalização (i18n):** Todas as chamadas à API do TMDB que buscam dados textuais (ex: títulos de filmes, biografias) **devem sempre** incluir parâmetros para obter os dados em **Inglês (en-US)** e **Português do Brasil (pt-BR)**. Isso pode ser feito através do parâmetro `language` ou utilizando `append_to_response=translations` para garantir que a interface possa alternar entre os idiomas ou exibir informações em ambos, conforme necessário.