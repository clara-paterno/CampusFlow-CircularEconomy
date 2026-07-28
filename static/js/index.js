const listaAnuncios = document.getElementById("lista-anuncios");
const mensagemVitrine = document.getElementById("mensagem-vitrine");

const botoesFiltro = document.querySelectorAll(
    ".filtro-categoria"
);

const cabecalho = document.querySelector(".cabecalho");

function atualizarCabecalhoDuranteRolagem() {
    if (!cabecalho) {
        return;
    }

    cabecalho.classList.toggle(
        "cabecalho-rolado",
        window.scrollY > 10
    );
}

window.addEventListener(
    "scroll",
    atualizarCabecalhoDuranteRolagem,
    { passive: true }
);

atualizarCabecalhoDuranteRolagem();


/*
 * Formata um número para o padrão monetário brasileiro.
 *
 * Exemplo:
 * 40 -> R$ 40,00
 */
function formatarPreco(preco) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(preco);
}


/*
 * Formata a data recebida da API.
 */
function formatarData(data) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(new Date(data));
}


/*
 * Cria visualmente um cartão para um anúncio.
 */
function criarCartaoAnuncio(anuncio) {
    const cartao = document.createElement("article");
    cartao.classList.add("cartao-anuncio");

    const areaImagem = document.createElement("div");
    areaImagem.classList.add("area-imagem-anuncio");

    if (anuncio.imagem_url) {
        const imagem = document.createElement("img");

        imagem.src = anuncio.imagem_url;
        imagem.alt = `Imagem do anúncio ${anuncio.titulo}`;
        imagem.loading = "lazy";

        /*
         * Caso a URL enviada esteja quebrada,
         * exibimos um espaço reservado.
         */
        imagem.addEventListener("error", () => {
            imagem.remove();

            areaImagem.classList.add("imagem-indisponivel");
            areaImagem.textContent = "♻";
        });

        areaImagem.appendChild(imagem);
    } else {
        areaImagem.classList.add("imagem-indisponivel");
        areaImagem.textContent = "♻";
    }

    const conteudo = document.createElement("div");
    conteudo.classList.add("conteudo-cartao-anuncio");

    const categoria = document.createElement("span");
    categoria.classList.add("categoria-anuncio");
    categoria.textContent = anuncio.categoria;

    const titulo = document.createElement("h3");
    titulo.textContent = anuncio.titulo;

    const descricao = document.createElement("p");
    descricao.classList.add("descricao-anuncio");
    descricao.textContent = anuncio.descricao;

    const rodape = document.createElement("div");
    rodape.classList.add("rodape-cartao-anuncio");

    const preco = document.createElement("strong");
    preco.classList.add("preco-anuncio");

    if (anuncio.doacao || anuncio.preco === null) {
        preco.textContent = "Doação";
        preco.classList.add("preco-doacao");
    } else {
        preco.textContent = formatarPreco(anuncio.preco);
    }

    const data = document.createElement("span");
    data.classList.add("data-anuncio");
    data.textContent = formatarData(anuncio.criado_em);

    rodape.append(preco, data);

    conteudo.append(
        categoria,
        titulo,
        descricao,
        rodape
    );

    cartao.append(areaImagem, conteudo);

    return cartao;
}


/*
 * Consulta a API e exibe os anúncios.
 */
async function carregarAnuncios(categoria = "") {
    listaAnuncios.replaceChildren();

    mensagemVitrine.textContent = "Carregando anúncios...";
    mensagemVitrine.classList.remove("mensagem-erro-vitrine");

    let enderecoApi = "/api/anuncios";

    if (categoria) {
        enderecoApi += (
            `?categoria=${encodeURIComponent(categoria)}`
        );
    }

    try {
        const resposta = await fetch(enderecoApi);
        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro ||
                "Não foi possível carregar os anúncios."
            );
        }

        /*
         * A API já entrega os mais recentes primeiro.
         * A vitrine mostra no máximo os seis primeiros.
         */
        const anunciosRecentes = resultado.anuncios.slice(0, 6);

        if (anunciosRecentes.length === 0) {
            mensagemVitrine.textContent =
                categoria
                    ? "Nenhum anúncio encontrado nesta categoria."
                    : "Ainda não existem anúncios cadastrados.";

            return;
        }

        anunciosRecentes.forEach((anuncio) => {
            const cartao = criarCartaoAnuncio(anuncio);
            listaAnuncios.appendChild(cartao);
        });

        mensagemVitrine.textContent = "";

    } catch (erro) {
        mensagemVitrine.textContent = erro.message;

        mensagemVitrine.classList.add(
            "mensagem-erro-vitrine"
        );

        console.error(
            "Erro ao carregar os anúncios:",
            erro
        );
    }
}


/*
 * Observa os cliques nos botões de categoria.
 */
botoesFiltro.forEach((botao) => {
    botao.addEventListener("click", () => {
        botoesFiltro.forEach((outroBotao) => {
            outroBotao.classList.remove("ativo");
        });

        botao.classList.add("ativo");

        const categoria = botao.dataset.categoria;

        carregarAnuncios(categoria);
    });
});


/*
 * Carrega todos os anúncios quando a página é aberta.
 */
carregarAnuncios();