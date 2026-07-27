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

//elementos pra edição
const painelEdicao = document.getElementById(
    "painel-edicao-anuncio"
);

const formularioEdicao = document.getElementById(
    "formulario-edicao-anuncio"
);

const campoEdicaoId = document.getElementById(
    "edicao-anuncio-id"
);

const campoEdicaoTitulo = document.getElementById(
    "edicao-titulo"
);

const campoEdicaoDescricao = document.getElementById(
    "edicao-descricao"
);

const campoEdicaoCategoria = document.getElementById(
    "edicao-categoria"
);

const campoEdicaoPreco = document.getElementById(
    "edicao-preco"
);

const campoEdicaoImagemUrl = document.getElementById(
    "edicao-imagem-url"
);

const campoEdicaoDoacao = document.getElementById(
    "edicao-doacao"
);

const grupoPrecoEdicao = document.getElementById(
    "grupo-preco-edicao"
);

const botaoCancelarEdicao = document.getElementById(
    "botao-cancelar-edicao"
);

const botaoFecharEdicao = document.getElementById(
    "botao-fechar-edicao"
);

const botaoSalvarEdicao = document.getElementById(
    "botao-salvar-edicao"
);

const mensagemEdicao = document.getElementById(
    "mensagem-edicao-anuncio"
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


function atualizarCampoPrecoEdicao() {
    const ehDoacao = campoEdicaoDoacao.checked;

    grupoPrecoEdicao.hidden = ehDoacao;
    campoEdicaoPreco.disabled = ehDoacao;

    if (ehDoacao) {
        campoEdicaoPreco.value = "";
    }
}

function fecharFormularioEdicao() {
    painelEdicao.hidden = true;
    formularioEdicao.reset();

    campoEdicaoId.value = "";
    mensagemEdicao.textContent = "";
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
 * Edita um anúncio pertencente à sessão atual.
 */
function abrirFormularioEdicao(anuncio) {
    campoEdicaoId.value = anuncio.id;
    campoEdicaoTitulo.value = anuncio.titulo;
    campoEdicaoDescricao.value = anuncio.descricao;
    campoEdicaoCategoria.value = anuncio.categoria;

    campoEdicaoImagemUrl.value =
        anuncio.imagem_url || "";

    campoEdicaoDoacao.checked =
        anuncio.doacao === true;

    if (anuncio.preco !== null) {
        campoEdicaoPreco.value = anuncio.preco;
    } else {
        campoEdicaoPreco.value = "";
    }

    atualizarCampoPrecoEdicao();
    

    mensagemEdicao.textContent = "";

    painelEdicao.hidden = false;

    painelEdicao.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

formularioEdicao.addEventListener(
    "submit",
    async (evento) => {
        evento.preventDefault();

        const anuncioId = campoEdicaoId.value;
        const ehDoacao = campoEdicaoDoacao.checked;

        if (!ehDoacao && campoEdicaoPreco.value === "") {
            mensagemEdicao.textContent =
                "Informe o preço ou marque o item como doação.";

            return;
        }

        const dadosAtualizados = {
            titulo: campoEdicaoTitulo.value.trim(),
            descricao: campoEdicaoDescricao.value.trim(),
            categoria: campoEdicaoCategoria.value,

            preco: ehDoacao
                ? null
                : Number(campoEdicaoPreco.value),

            doacao: ehDoacao,

            imagem_url:
                campoEdicaoImagemUrl.value.trim() || null
        };

        botaoSalvarEdicao.disabled = true;
        botaoSalvarEdicao.textContent = "Salvando...";

        mensagemEdicao.textContent = "";

        try {
            const resposta = await fetch(
                `/api/anuncios/${anuncioId}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(dadosAtualizados)
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ||
                    "Não foi possível atualizar o anúncio."
                );
            }

            mensagemEdicao.textContent =
                "Anúncio atualizado com sucesso.";

            await carregarMeusAnuncios();

            setTimeout(() => {
                fecharFormularioEdicao();
            }, 700);

        } catch (erro) {
            mensagemEdicao.textContent = erro.message;

            console.error(
                "Erro ao atualizar anúncio:",
                erro
            );

        } finally {
            botaoSalvarEdicao.disabled = false;
            botaoSalvarEdicao.textContent =
                "Salvar alterações";
        }
    }
);

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

    botaoEditar.addEventListener("click", () => {
    abrirFormularioEdicao(anuncio);
    });

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

/*
 * Atualiza a exibição do campo de preço
 * quando o usuário marca ou desmarca a doação.
 */
campoEdicaoDoacao.addEventListener(
    "change",
    atualizarCampoPrecoEdicao
);

/* Fecha o formulário quando o usuário botão Cancelar.*/
botaoCancelarEdicao.addEventListener(
    "click",
    fecharFormularioEdicao
);

/*
 * Fecha o formulário quando o usuário
 * clica no botão X.
 */
botaoFecharEdicao.addEventListener(
    "click",
    fecharFormularioEdicao
);

carregarMeusAnuncios();