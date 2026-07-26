// Elementos da página
const listaMeusAnuncios = document.getElementById(
    "lista-meus-anuncios"
);

const quantidadeMeusAnuncios = document.getElementById(
    "quantidade-meus-anuncios"
);

const estadoVazio = document.getElementById(
    "estado-vazio-meus-anuncios"
);

const mensagemMeusAnuncios = document.getElementById(
    "mensagem-meus-anuncios"
);


/*
 * Converte para o formato monetário brasileiro.
 */
function formatarPreco(preco) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(preco);
}


/*
 * Mostra o símbolo de reciclagem quando:
 * - o anúncio não possui imagem;
 * - a URL da imagem está quebrada.
 */
function mostrarImagemPadrao(areaImagem) {
    areaImagem.replaceChildren();
    areaImagem.textContent = "♻";
}

/*
 * Exclui um anúncio pertencente à sessão atual.
 */
async function excluirAnuncio(anuncioId) {
    const confirmouExclusao = window.confirm(
        "Tem certeza de que deseja excluir este anúncio?"
    );

    if (!confirmouExclusao) {
        return;
    }

    try {
        const resposta = await fetch(
            `/api/anuncios/${anuncioId}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro ||
                "Não foi possível excluir o anúncio."
            );
        }

        mensagemMeusAnuncios.textContent =
            resultado.mensagem;

        await carregarMeusAnuncios();

    } catch (erro) {
        mensagemMeusAnuncios.textContent = erro.message;

        console.error(
            "Erro ao excluir anúncio:",
            erro
        );
    }
}

/*
 * Cria um card HTML usando os dados de um anúncio.
 */
function criarCardMeuAnuncio(anuncio) {
    // Card principal
    const card = document.createElement("article");
    card.classList.add("cartao-meu-anuncio");


    // Área da imagem
    const areaImagem = document.createElement("div");
    areaImagem.classList.add("imagem-meu-anuncio");

    if (anuncio.imagem_url) {
        const imagem = document.createElement("img");

        imagem.src = anuncio.imagem_url;
        imagem.alt = `Imagem do anúncio ${anuncio.titulo}`;
        imagem.loading = "lazy";

        /*
         * O evento error acontece quando o navegador
         * não consegue carregar a URL da imagem.
         */
        imagem.addEventListener("error", () => {
            mostrarImagemPadrao(areaImagem);
        });

        areaImagem.appendChild(imagem);
    } else {
        mostrarImagemPadrao(areaImagem);
    }


    // Conteúdo textual do card
    const conteudo = document.createElement("div");
    conteudo.classList.add("conteudo-meu-anuncio");


    // Categoria
    const categoria = document.createElement("span");
    categoria.classList.add("categoria-meu-anuncio");
    categoria.textContent = anuncio.categoria;


    // Título
    const titulo = document.createElement("h2");
    titulo.textContent = anuncio.titulo;


    // Descrição
    const descricao = document.createElement("p");
    descricao.classList.add("descricao-meu-anuncio");
    descricao.textContent = anuncio.descricao;


    // Preço ou indicação de doação
    const preco = document.createElement("strong");
    preco.classList.add("preco-meu-anuncio");

    if (anuncio.doacao || anuncio.preco === null) {
        preco.textContent = "Doação";
        preco.classList.add("doacao");
    } else {
        preco.textContent = formatarPreco(anuncio.preco);
    }


    // Área dos botões
    const acoes = document.createElement("div");
    acoes.classList.add("acoes-meu-anuncio");


    // Botão de editar
    const botaoEditar = document.createElement("button");

    botaoEditar.type = "button";
    botaoEditar.classList.add("botao-editar-anuncio");
    botaoEditar.textContent = "Editar";

    /*
     * Guardamos o ID no próprio botão.
     * Ele será utilizado quando implementarmos a edição.
     */
    botaoEditar.dataset.anuncioId = anuncio.id;


    // Botão de excluir
    const botaoExcluir = document.createElement("button");

    botaoExcluir.type = "button";
    botaoExcluir.classList.add("botao-excluir-anuncio");
    botaoExcluir.textContent = "Excluir";

    botaoExcluir.dataset.anuncioId = anuncio.id;

    botaoExcluir.addEventListener("click", () => {
    excluirAnuncio(anuncio.id);
    });

    // Montagem da área de ações
    acoes.append(
        botaoEditar,
        botaoExcluir
    );


    // Montagem do conteúdo
    conteudo.append(
        categoria,
        titulo,
        descricao,
        preco,
        acoes
    );


    // Montagem final do card
    card.append(
        areaImagem,
        conteudo
    );

    return card;
}


/*
 * Busca os anúncios associados à sessão atual
 * e os apresenta na página.
 */
async function carregarMeusAnuncios() {
    mensagemMeusAnuncios.textContent =
        "Carregando seus anúncios...";

    // Remove cards antigos antes de carregar novamente
    listaMeusAnuncios.replaceChildren();

    // Começa com o estado vazio escondido
    estadoVazio.hidden = true;

    try {
        const resposta = await fetch("/api/anuncios/meus");

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro ||
                "Não foi possível carregar seus anúncios."
            );
        }

        // Atualiza a quantidade mostrada na página
        quantidadeMeusAnuncios.textContent =
            resultado.quantidade;


        /*
         * Caso a API não tenha retornado nenhum anúncio,
         * mostramos a mensagem de estado vazio.
         */
        if (resultado.anuncios.length === 0) {
            estadoVazio.hidden = false;
            mensagemMeusAnuncios.textContent = "";

            return;
        }


        /*
         * Para cada anúncio recebido da API,
         * criamos um card e colocamos na lista.
         */
        resultado.anuncios.forEach((anuncio) => {
            const card = criarCardMeuAnuncio(anuncio);

            listaMeusAnuncios.appendChild(card);
        });

        mensagemMeusAnuncios.textContent = "";

    } catch (erro) {
        mensagemMeusAnuncios.textContent = erro.message;

        console.error(
            "Erro ao carregar meus anúncios:",
            erro
        );
    }
}

carregarMeusAnuncios();