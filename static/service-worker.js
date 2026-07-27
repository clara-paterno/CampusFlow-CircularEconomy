/*
 * Service Worker básico do CampusFlow.
 *
 * Nesta etapa, ele apenas registra os eventos
 * de instalação e ativação.
 *
 * Ainda não há cache nem interceptação
 * de requisições.
 */

self.addEventListener("install", () => {
    console.log("Service Worker do CampusFlow instalado.");
});


self.addEventListener("activate", () => {
    console.log("Service Worker do CampusFlow ativado.");
});