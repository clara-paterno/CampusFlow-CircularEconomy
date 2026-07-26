# CampusFlow

O CampusFlow é um marketplace de economia circular desenvolvido para estudantes universitários venderem, doarem e encontrarem itens úteis dentro da comunidade acadêmica.

## Status do projeto

🚧 Em desenvolvimento

## Funcionalidades Atuais

- Landing page pública
- API de anúncios
- Criação de anúncios com método POST
- Atualização de anúncios com método PATCH
- Filtragem de anúncios
- Página de cadastro de produtos

## Tecnologias utilizadas

- Python
- Flask
- Flask-SQLAlchemy
- SQLite
- HTML5
- CSS3
- JavaScript
- Git and GitHub

## Estrutura do projeto

## Como executar localmente

## Endpoints da API

## Diário de Bordo da IA

### Ferramentas utilizadas

ChatGPT

### Estratégia de engenharia de prompts

<details>
<summary><strong>Prompt 1 — Persistência da identificação por sessão</strong></summary>

### Contexto

Necessidade de manter a identificação do mesmo navegador entre diferentes acessos à aplicação.

### Prompt utilizado

> Implementei no Flask uma identificação anônima por navegador usando uma chave armazenada na sessão. Cada navegador recebe um `usuario_id` diferente, e esse identificador é associado aos anúncios cadastrados. A página “Meus anúncios” filtra os registros com base no `usuario_id` da sessão atual.
>
> Durante os testes, os anúncios apareceram corretamente no mesmo navegador. Porém, ao fechar a aplicação e acessá-la novamente no dia seguinte, a página “Meus anúncios” ficou vazia, apesar de os registros continuarem no banco de dados. Isso indica que um novo `usuario_id` pode estar sendo gerado.
>
> Como posso garantir que o mesmo navegador mantenha o mesmo identificador entre diferentes acessos e reinicializações da aplicação?
>
> Analise possíveis causas, como:
>
> - sessão não configurada como permanente;
> - expiração ou remoção do cookie;
> - alteração da `SECRET_KEY` ao reiniciar o Flask;
> - geração de um novo identificador a cada requisição ou execução;
> - configurações de duração e persistência da sessão.
>
> Explique a solução mais simples e adequada ao escopo do projeto antes de apresentar alterações no código.

### Aplicação da resposta

A resposta ajudou a analisar a configuração da sessão do Flask e a permanência do cookie.

### Validação e adaptações

Descreva como você testou, identificou problemas e adaptou a solução.

### Aprendizado

Descreva o que você compreendeu durante o processo.

</details>

### Compartilhamento de histórico

O chat foi essencial para diagnosticar o problema de persistência da sessão e orientar a configuração correta do `usuario_id`, da `SECRET_KEY` e dos cookies. Também auxiliou na implementação do PWA, explicando e guiando a criação do `manifest.json`, dos ícones e do service worker, sempre com testes e adaptações ao projeto.

https://chatgpt.com/share/6a668bd9-9ab0-83e9-8db6-e7f94394d758

### Reflexão crítica




