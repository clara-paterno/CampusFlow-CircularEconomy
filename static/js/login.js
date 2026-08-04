// Elementos principais da página
const formularioLogin = document.getElementById(
    "form-login"
);

const mensagemLogin = document.getElementById(
    "mensagem-login"
);

const botaoLogin = document.querySelector(
    ".botao-login"
);


// Campos do formulário
const campoEmailLogin = document.getElementById("email");
const campoSenhaLogin = document.getElementById("senha");


/*
 * Intercepta o envio do formulário e envia os dados
 * para a API de autenticação.
 */
formularioLogin.addEventListener(
    "submit",
    async (evento) => {
        evento.preventDefault();

        mensagemLogin.textContent = "";

        mensagemLogin.classList.remove(
            "mensagem-sucesso",
            "mensagem-erro"
        );

        const dadosLogin = {
            email: campoEmailLogin.value
                .trim()
                .toLowerCase(),

            senha: campoSenhaLogin.value
        };

        try {
            botaoLogin.disabled = true;
            botaoLogin.textContent = "Entrando...";

            const resposta = await fetch(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(dadosLogin)
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ||
                    "Não foi possível realizar o login."
                );
            }

            mensagemLogin.textContent =
                "Login realizado com sucesso!";

            mensagemLogin.classList.add(
                "mensagem-sucesso"
            );

            formularioLogin.reset();

            setTimeout(() => {
                window.location.href = "/meus-anuncios";
            }, 800);

        } catch (erro) {
            mensagemLogin.textContent = erro.message;

            mensagemLogin.classList.add(
                "mensagem-erro"
            );

            console.error(
                "Erro ao realizar login:",
                erro
            );

        } finally {
            botaoLogin.disabled = false;
            botaoLogin.textContent = "Entrar";
        }
    }
);