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

### Pré-requisitos

Antes de começar, instale:

- [Python](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)

### 1. Clone o repositório

```bash
git clone https://github.com/clara-paterno/CampusFlow-CircularEconomy
cd EconomiaCircular
```

### 2. Crie um ambiente virtual

```bash
python -m venv .venv
```

### 3. Ative o ambiente virtual

No Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

No Prompt de Comando do Windows:

```cmd
.venv\Scripts\activate
```

No Linux ou macOS:

```bash
source .venv/bin/activate
```

Quando o ambiente estiver ativo, o terminal deverá exibir `(.venv)` antes do caminho atual.

### 4. Instale as dependências

```bash
python -m pip install -r requirements.txt
```

### 5. Configure as variáveis de ambiente

Crie o arquivo `.env` a partir do modelo disponibilizado no projeto.

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

No Linux ou macOS:

```bash
cp .env.example .env
```

Gere uma chave secreta com o comando:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copie o valor gerado e substitua o conteúdo de `SECRET_KEY` no arquivo `.env`:

```env
SECRET_KEY=sua_chave_secreta_gerada
```

O arquivo `.env` contém informações locais e não deve ser enviado ao repositório.

### 6. Execute a aplicação

```bash
python app.py
```

Ao executar o projeto pela primeira vez, o Flask criará automaticamente o banco de dados SQLite e suas tabelas.

### 7. Acesse no navegador

Abra:

```text
http://127.0.0.1:5000
```

A mesma aplicação Flask disponibiliza a API REST, a Landing Page e as páginas da experiência PWA.

### Encerrando a aplicação

Para interromper o servidor, pressione:

```text
Ctrl + C
```

Para sair do ambiente virtual, execute:

```bash
deactivate
```

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

Durante a implementação da identificação anônima dos usuários, percebi que os anúncios deixavam de aparecer na página “Meus anúncios” após o navegador ou a aplicação serem reiniciados. A IA identificou corretamente que o problema poderia estar relacionado à perda da sessão e sugeriu torná-la permanente, configurando `session.permanent` e `PERMANENT_SESSION_LIFETIME`.

Entretanto, a primeira solução apresentada utilizava uma chave secreta padrão diretamente no código quando a variável de ambiente não estivesse definida. Embora essa abordagem pudesse funcionar durante o desenvolvimento, ela não seguia adequadamente as boas práticas de segurança, pois uma `SECRET_KEY` previsível pode comprometer a assinatura dos cookies de sessão.

Identifiquei essa limitação ao comparar a solução com uma segunda análise mais completa, que recomendava gerar a chave apenas uma vez, armazená-la em um arquivo `.env`, impedir seu versionamento pelo Git e manter o mesmo valor entre as reinicializações da aplicação. Também foi observada a necessidade de validar o `usuario_id` nas operações de edição e exclusão, evitando que um anúncio fosse alterado apenas por meio de seu identificador numérico.

A partir disso, conduzi a IA para uma solução mais adequada ao projeto: mantive a sessão permanente para preservar a identificação do navegador, mas substituí a chave inserida diretamente no código por uma variável de ambiente e considerei controles adicionais de autorização. Esse processo mostrou que a resposta inicial da IA não deveria ser copiada automaticamente, mas analisada, testada e adaptada ao contexto e aos requisitos de segurança da aplicação.





