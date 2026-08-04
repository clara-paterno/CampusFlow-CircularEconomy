// Elementos principais da página
const formularioCriarConta = document.getElementById(
    "form-criar-conta"
);

const mensagemCriarConta = document.getElementById(
    "mensagem-criar-conta"
);

const botaoCriarConta = document.querySelector(
    ".botao-criar-conta"
);


// Campos do formulário
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");

const campoConfirmarSenha = document.getElementById(
    "confirmar-senha"
);


/*
 * Intercepta o envio do formulário e envia os dados
 * para a API de cadastro de usuários.
 */
formularioCriarConta.addEventListener(
    "submit",
    async (evento) => {
        evento.preventDefault();

        mensagemCriarConta.textContent = "";

        mensagemCriarConta.classList.remove(
            "mensagem-sucesso",
            "mensagem-erro"
        );

        const nome = campoNome.value.trim();
        const email = campoEmail.value.trim().toLowerCase();
        const senha = campoSenha.value;
        const confirmarSenha = campoConfirmarSenha.value;

        if (senha !== confirmarSenha) {
            mensagemCriarConta.textContent =
                "As senhas informadas não coincidem.";

            mensagemCriarConta.classList.add(
                "mensagem-erro"
            );

            return;
        }

        const dadosUsuario = {
            nome,
            email,
            senha
        };

        try {
            botaoCriarConta.disabled = true;
            botaoCriarConta.textContent = "Criando conta...";

            const resposta = await fetch(
                "/api/auth/cadastro",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(dadosUsuario)
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ||
                    "Não foi possível criar a conta."
                );
            }

            mensagemCriarConta.textContent =
                "Conta criada com sucesso!";

            mensagemCriarConta.classList.add(
                "mensagem-sucesso"
            );

            formularioCriarConta.reset();

            setTimeout(() => {
                window.location.href = "/login";
            }, 1000);

        } catch (erro) {
            mensagemCriarConta.textContent = erro.message;

            mensagemCriarConta.classList.add(
                "mensagem-erro"
            );

            console.error(
                "Erro ao criar conta:",
                erro
            );

        } finally {
            botaoCriarConta.disabled = false;
            botaoCriarConta.textContent = "Criar conta";
        }
    }
);