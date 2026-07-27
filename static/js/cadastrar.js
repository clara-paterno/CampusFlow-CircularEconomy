// Elementos principais 
const formulario = document.getElementById("form-anuncio");
const mensagemFormulario = document.getElementById("mensagem-formulario");
const botaoPublicar = document.querySelector(".botao-publicar");

// Campos do formulário
const campoTitulo = document.getElementById("titulo");
const campoDescricao = document.getElementById("descricao");
const campoCategoria = document.getElementById("categoria");
const campoPreco = document.getElementById("preco");
const grupoCampoPreco = document.getElementById("campo-preco");
const campoImagemUrl = document.getElementById("imagem_url");

// Opções de venda ou doação
const opcoesTipo = document.querySelectorAll(
    'input[name="tipo"]'
);

/*
 * Mostra ou esconde o campo de preço dependendo
 * do tipo de anúncio selecionado.
 */
function atualizarCampoPreco() {
    const tipoSelecionado = document.querySelector(
        'input[name="tipo"]:checked'
    ).value;

    const ehDoacao = tipoSelecionado === "doacao";

    if (ehDoacao) {
        grupoCampoPreco.hidden = true;
        campoPreco.value = "";
        campoPreco.required = false;
        campoPreco.disabled = true;
    } else {
        grupoCampoPreco.hidden = false;
        campoPreco.required = true;
        campoPreco.disabled = false;
    }
}


// Executa a função sempre que o tipo do anúncio mudar
opcoesTipo.forEach((opcao) => {
    opcao.addEventListener("change", atualizarCampoPreco);
});


// Configura corretamente o campo quando a página carregar
atualizarCampoPreco();


/*
 * Intercepta o envio tradicional do formulário
 * e envia os dados para a API usando JSON.
 */
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    mensagemFormulario.textContent = "";
    mensagemFormulario.classList.remove(
        "mensagem-sucesso",
        "mensagem-erro"
    );

    const tipoSelecionado = document.querySelector(
        'input[name="tipo"]:checked'
    ).value;

    const ehDoacao = tipoSelecionado === "doacao";

    const dadosAnuncio = {
        titulo: campoTitulo.value.trim(),
        descricao: campoDescricao.value.trim(),
        categoria: campoCategoria.value,
        preco: ehDoacao
            ? null
            : Number(campoPreco.value),
        doacao: ehDoacao,
        imagem_url: campoImagemUrl.value.trim() || null,
    };

    try {
        botaoPublicar.disabled = true;
        botaoPublicar.textContent = "Publicando...";

        const resposta = await fetch("/api/anuncios", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(dadosAnuncio)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro ||
                "Não foi possível publicar o anúncio."
            );
        }

        mensagemFormulario.textContent =
            "Anúncio publicado com sucesso!";

        mensagemFormulario.classList.add(
            "mensagem-sucesso"
        );

        formulario.reset();

        // Após o reset, Venda volta a ser a opção selecionada
        atualizarCampoPreco();

    } catch (erro) {
        mensagemFormulario.textContent = erro.message;

        mensagemFormulario.classList.add(
            "mensagem-erro"
        );

        console.error("Erro ao publicar anúncio:", erro);

    } finally {
        botaoPublicar.disabled = false;
        botaoPublicar.textContent = "Publicar anúncio";
    }
});