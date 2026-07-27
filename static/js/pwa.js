/*
 * Registra o Service Worker do CampusFlow.
 *
 * Nesta etapa, ele ainda não utiliza cache
 * nem intercepta requisições.
 */

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            const registro = await navigator.serviceWorker.register(
                "/service-worker.js",
                {
                    scope: "/"
                }
            );

            console.log(
                "Service Worker registrado com sucesso.",
                "Escopo:",
                registro.scope
            );
        } catch (erro) {
            console.error(
                "Não foi possível registrar o Service Worker:",
                erro
            );
        }
    });
} else {
    console.warn(
        "Este navegador não oferece suporte a Service Workers."
    );
}