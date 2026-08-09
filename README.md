# CampusFlow

O **CampusFlow** é um marketplace de economia circular voltado à comunidade universitária. A plataforma permite que estudantes anunciem, vendam, doem e encontrem itens úteis, como livros, calculadoras, componentes eletrônicos, materiais acadêmicos e outros produtos que possam ser reutilizados dentro do campus.

O projeto foi desenvolvido como uma aplicação única, integrando uma **API REST**, uma **Landing Page responsiva**, autenticação de usuários e uma experiência mobile instalável como **Progressive Web App (PWA)**.

## Status do projeto

✅ Versão funcional e publicada em produção.

O CampusFlow está disponível em ambiente de produção por meio do Render, utilizando PostgreSQL como banco de dados.

A aplicação conta com autenticação de usuários, gerenciamento completo de anúncios, responsividade para desktop e dispositivos móveis, configuração PWA e migrations para controle da estrutura do banco de dados.

A implementação de estratégias de cache offline permanece como uma possível melhoria futura.

## Funcionalidades

- Landing Page pública e responsiva;
- apresentação da proposta de economia circular;
- exibição de estatísticas simuladas;
- vitrine pública com os anúncios mais recentes;
- filtragem de anúncios por categoria;
- criação de conta;
- login e logout de usuários;
- proteção de páginas e recursos que exigem autenticação;
- cadastro de itens para venda ou doação;
- edição de anúncios;
- exclusão de anúncios;
- página “Meus anúncios” vinculada ao usuário autenticado;
- proteção das operações de edição e exclusão por usuário;
- validação dos dados recebidos pela API;
- tratamento de erros e códigos HTTP adequados;
- manifesto de aplicação web;
- Service Worker básico;
- ícones para instalação da PWA;
- menu mobile em formato de painel lateral;
- layout adaptado para desktop, tablet e dispositivos móveis;
- estrutura de migrations para evolução do banco de dados;
- suporte a SQLite em desenvolvimento e PostgreSQL em produção.

## Arquitetura da aplicação

O Flask é responsável tanto pela **API REST** quanto pela entrega das páginas HTML, arquivos CSS, JavaScript e recursos necessários para a PWA.

O frontend utiliza JavaScript e a **Fetch API** para realizar requisições à API. No backend, o Flask processa as operações e utiliza o **SQLAlchemy** para persistência dos dados.

Em desenvolvimento local, quando nenhuma variável `DATABASE_URL` é fornecida, a aplicação utiliza um banco **SQLite**. A estrutura também suporta PostgreSQL por meio da variável `DATABASE_URL`. Em produção, essa variável é configurada no Render para conectar a aplicação ao banco PostgreSQL.

As alterações de estrutura do banco são controladas utilizando **Flask-Migrate/Alembic**, permitindo manter um histórico versionado das migrations.

### Autenticação

O CampusFlow possui um modelo de usuário com nome, e-mail e senha armazenada de forma segura por meio de hash.

Após o login, o identificador da conta autenticada é armazenado na sessão do Flask. As páginas de cadastro de anúncios e “Meus anúncios”, assim como as operações de criação, edição e exclusão, exigem autenticação.

Cada novo anúncio é associado à conta que o criou. Dessa forma, a página “Meus anúncios” consulta apenas os registros pertencentes ao usuário autenticado, e as operações de edição e exclusão verificam essa associação antes de alterar o banco de dados.

A aplicação também mantém configurações de segurança para os cookies de sessão, incluindo `HttpOnly`, `SameSite` e uso de cookie seguro quando executada em ambiente de produção.

## Tecnologias utilizadas

### Backend

- Python;
- Flask;
- Flask-SQLAlchemy;
- Flask-Migrate;
- SQLAlchemy;
- Werkzeug;
- python-dotenv;
- SQLite para desenvolvimento local;
- PostgreSQL em produção;
- psycopg2-binary;
- Gunicorn para execução em produção no Render.

### Frontend

- HTML5;
- CSS3;
- JavaScript;
- Fetch API;
- Progressive Web App (PWA);
- Web App Manifest;
- Service Worker.

### Desenvolvimento e versionamento

- Git;
- GitHub;
- Visual Studio Code;
- Alembic para versionamento da estrutura do banco de dados.

## Estrutura do projeto

```text
CampusFlow-CircularEconomy/
├── app.py
├── README.md
├── requirements.txt
├── .env.example
├── .gitignore
│
├── migrations/
│   ├── versions/
│   │   ├── ...create_anuncios_table.py
│   │   ├── ...create_usuarios_table.py
│   │   └── ...link_anuncios_to_usuarios.py
│   ├── alembic.ini
│   ├── env.py
│   ├── README
│   └── script.py.mako
│
├── templates/
│   ├── index.html
│   ├── cadastrar.html
│   ├── meus_anuncios.html
│   ├── criar_conta.html
│   └── login.html
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   ├── index.js
│   │   ├── cadastrar.js
│   │   ├── meus_anuncios.js
│   │   ├── criar_conta.js
│   │   ├── login.js
│   │   └── pwa.js
│   │
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   │
│   ├── manifest.json
│   └── service-worker.js
│
└── instance/
    └── economia_circular.db
```

A pasta `instance/`, o banco de dados SQLite local e o arquivo `.env` são utilizados localmente e não devem ser enviados ao repositório.

A pasta `migrations/`, por outro lado, é versionada e mantém o histórico das alterações realizadas na estrutura do banco.

## Como executar localmente

### Pré-requisitos

Antes de começar, instale:

- [Python](https://www.python.org/downloads/);
- [Git](https://git-scm.com/downloads).

### 1. Clone o repositório

```bash
git clone https://github.com/clara-paterno/CampusFlow-CircularEconomy.git
cd CampusFlow-CircularEconomy
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
.venv\Scripts\activate.bat
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

Gere uma chave secreta:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copie o valor gerado e substitua o conteúdo de `SECRET_KEY` no arquivo `.env`:

```env
SECRET_KEY=sua_chave_secreta_gerada
```

A `SECRET_KEY` é utilizada pelo Flask para assinar os dados da sessão e deve permanecer privada.

O arquivo `.env` contém informações locais e não deve ser enviado ao repositório.

### 6. Aplique as migrations

Com o ambiente virtual ativo, execute:

```bash
python -m flask --app app db upgrade
```

Esse comando aplica as migrations existentes e prepara a estrutura do banco de dados local.

Quando `DATABASE_URL` não está configurada, a aplicação utiliza automaticamente o SQLite.

### 7. Execute a aplicação

```bash
python -m flask --app app run --debug
```

### 8. Acesse no navegador

Abra:

```text
http://127.0.0.1:5000
```

A mesma aplicação Flask disponibiliza a Landing Page, as páginas da aplicação, os recursos da PWA e os endpoints da API REST.

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

### Anúncios

| Método | Endpoint | Descrição | Autenticação |
|---|---|---|---|
| `GET` | `/api/anuncios` | Lista os anúncios cadastrados | Não |
| `GET` | `/api/anuncios?categoria=Livros` | Lista anúncios filtrados por categoria | Não |
| `POST` | `/api/anuncios` | Cadastra um novo anúncio | Sim |
| `GET` | `/api/anuncios/meus` | Lista os anúncios do usuário autenticado | Sim |
| `PATCH` | `/api/anuncios/<id>` | Atualiza um anúncio pertencente ao usuário | Sim |
| `DELETE` | `/api/anuncios/<id>` | Exclui um anúncio pertencente ao usuário | Sim |

### Autenticação

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/cadastro` | Cria uma nova conta |
| `POST` | `/api/auth/login` | Autentica um usuário |
| `POST` | `/api/auth/logout` | Encerra a sessão autenticada |
| `GET` | `/api/auth/sessao` | Informa o estado atual da autenticação |

As requisições e respostas da API utilizam o formato JSON.

As rotas de criação e atualização de anúncios verificam campos obrigatórios, tipos de dados, limites de caracteres, preço, indicação de doação e URL da imagem.

As operações relacionadas aos próprios anúncios utilizam o identificador da conta autenticada armazenado na sessão. Com isso, um usuário não pode editar ou excluir anúncios pertencentes a outra conta apenas conhecendo seu identificador numérico.

As senhas não são armazenadas diretamente no banco de dados. O backend utiliza funções de hash e verificação de senha disponibilizadas pelo Werkzeug.

### Principais códigos HTTP

| Código | Significado |
|---:|---|
| `200` | Requisição concluída com sucesso |
| `201` | Recurso criado com sucesso |
| `400` | Dados enviados são inválidos |
| `401` | Autenticação necessária ou credenciais inválidas |
| `404` | Recurso ou rota não encontrado |
| `405` | Método HTTP não permitido |
| `409` | Conflito, como tentativa de cadastrar um e-mail já existente |
| `500` | Erro interno inesperado |

## Progressive Web App

O projeto possui:

- arquivo `manifest.json`;
- ícones nos tamanhos 192 × 192 e 512 × 512;
- registro de um Service Worker;
- modo de exibição `standalone`;
- layout responsivo para dispositivos móveis;
- possibilidade de instalação em navegadores compatíveis;
- navegação mobile adaptada para uma experiência semelhante à de um aplicativo.

O Service Worker atual é básico e atende ao requisito de registro e instalação da aplicação. Estratégias adicionais de cache e funcionamento offline permanecem como melhorias futuras.

Para verificar a configuração da PWA no Chrome ou Edge:

1. execute a aplicação;
2. abra as ferramentas do desenvolvedor com `F12`;
3. acesse a aba **Application**;
4. confira as seções **Manifest** e **Service Workers**;
5. utilize a opção de instalação exibida pelo navegador.

## Deploy e ambiente de produção

A aplicação foi publicada no **Render** como um serviço web Flask.

O ambiente de produção utiliza:

- PostgreSQL como banco de dados;
- Gunicorn como servidor WSGI;
- Flask-Migrate/Alembic para aplicação das migrations;
- variáveis de ambiente para configuração da aplicação;
- HTTPS disponibilizado pelo Render;
- cookies de sessão configurados de forma apropriada para o ambiente de produção.

Durante o processo de deploy, as migrations são aplicadas ao banco PostgreSQL antes da inicialização da aplicação.

### Aplicação em produção

**CampusFlow:** [(https://campusflow-6t6o.onrender.com)]

## Diário de Bordo da IA

### Ferramentas utilizadas

- ChatGPT.

A ferramenta foi utilizada como apoio para compreender conceitos, analisar erros, revisar decisões de arquitetura, estruturar testes e melhorar a organização do código.

As respostas não foram aplicadas automaticamente. Cada solução foi analisada, testada e adaptada ao contexto do projeto.

### Compartilhamento de histórico

O chat foi utilizado durante diferentes etapas do desenvolvimento, incluindo o diagnóstico da persistência da sessão, configuração da `SECRET_KEY`, implementação da PWA, análise do Service Worker e evolução da arquitetura do projeto.

Histórico compartilhado:

https://chatgpt.com/share/6a668bd9-9ab0-83e9-8db6-e7f94394d758

### Estratégia de engenharia de prompts

<details>
<summary><strong>Prompt 1 — Persistência da identificação por sessão</strong></summary>

#### Contexto

Durante uma etapa inicial do desenvolvimento, antes da implementação da autenticação por contas, o CampusFlow utilizava uma identificação anônima por navegador.

Era necessário manter essa identificação entre diferentes acessos à aplicação. Inicialmente, os anúncios permaneciam no banco, mas deixavam de aparecer na página “Meus anúncios” após a aplicação ser reiniciada.

#### Prompt utilizado

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

#### Aplicação da resposta

A análise mostrou que o identificador era armazenado na sessão do Flask, mas sua permanência dependia da configuração do cookie e da manutenção da mesma `SECRET_KEY`.

A solução aplicada naquela etapa incluiu:

- uso de uma `SECRET_KEY` fixa carregada pelo arquivo `.env`;
- configuração da sessão como permanente;
- definição de um tempo de duração para a sessão;
- criação do `usuario_id` apenas quando ele ainda não existia;
- associação desse identificador aos anúncios cadastrados.

#### Validação e adaptações

A solução foi testada reiniciando a aplicação e acessando novamente pelo mesmo navegador. Os anúncios continuaram aparecendo na página “Meus anúncios”.

Também foram realizados testes em uma janela anônima, que recebeu um identificador diferente, comprovando a separação entre navegadores.

As operações de edição e exclusão também foram protegidas para impedir a alteração de registros associados a outra identificação.

#### Evolução posterior

Posteriormente, o projeto evoluiu para um sistema de **criação de conta e login**.

A propriedade atual dos anúncios passou a ser vinculada à conta autenticada, permitindo que o usuário acesse seus anúncios de forma independente da identificação anônima originalmente utilizada no navegador.

Essa evolução foi importante porque transformou uma solução inicialmente adequada ao requisito mínimo do desafio em uma estrutura de autenticação mais completa.

#### Aprendizado

Esse processo permitiu compreender melhor a relação entre sessões, cookies, `SECRET_KEY` e persistência de identificação no Flask.

Também ficou claro que o cookie de sessão não armazena os anúncios. Ele mantém informações que permitem ao backend identificar a sessão e realizar as consultas apropriadas no banco de dados.

</details>

<details>
<summary><strong>Prompt 2 — Planejamento e implementação inicial da PWA</strong></summary>

#### Contexto

Após corrigir e testar a persistência da sessão e do `usuario_id`, a próxima etapa foi transformar o CampusFlow em uma aplicação instalável.

Como eu ainda não conhecia completamente a função de cada arquivo de uma PWA, solicitei que a implementação fosse conduzida de forma gradual, começando pela análise da estrutura do projeto antes de qualquer alteração no código.

#### Prompt utilizado

> A persistência da sessão e do `usuario_id` já foi corrigida e testada. Agora quero iniciar a implementação do PWA e do service worker no CampusFlow.
>
> Quero fazer essa implementação passo a passo, sem receber todos os arquivos prontos de uma vez.
>
> Vamos começar somente pela primeira etapa: analisar a estrutura atual do projeto e definir quais arquivos e alterações serão necessários para transformar a aplicação Flask em um PWA instalável.
>
> Nesta etapa:
>
> - explique a função do `manifest.json`, do service worker e dos ícones;
> - verifique onde esses arquivos devem ficar no projeto;
> - avalie como disponibilizar o service worker com escopo sobre toda a aplicação;
> - indique quais trechos do `app.py` e dos templates precisarão ser analisados;
> - não implemente ainda o cache offline nem intercepte as requisições da API.
>
> Depois da explicação, peça que eu envie apenas os arquivos necessários para começarmos pelo manifesto e pelo registro básico do service worker.

#### Aplicação da resposta

A resposta ajudou a dividir a implementação da PWA em etapas menores e a compreender a responsabilidade de cada componente:

- o `manifest.json` descreve a identidade e o comportamento instalável da aplicação;
- os ícones representam o CampusFlow na tela inicial e em outros elementos do sistema;
- o Service Worker é registrado pelo navegador e pode controlar requisições dentro de seu escopo;
- o arquivo JavaScript de registro conecta as páginas da aplicação ao Service Worker.

A partir da análise, os arquivos da PWA foram organizados dentro da pasta `static/`, juntamente com os demais recursos públicos da aplicação.

Também foi identificada a necessidade de disponibilizar o Service Worker por uma rota no nível raiz:

```text
/service-worker.js
```

A implementação foi mantida inicialmente simples para atender ao requisito obrigatório de instalação da PWA. Estratégias de cache e funcionamento offline foram deixadas para uma possível evolução posterior.

#### Aprendizado

A implementação passo a passo ajudou a diferenciar o papel do manifesto, do Service Worker e do código responsável pelo seu registro.

Também permitiu compreender por que o escopo do Service Worker é relevante e por que uma implementação básica pode atender ao requisito de instalação sem necessariamente implementar funcionamento offline.

</details>

### Reflexão crítica

Um dos momentos mais importantes do uso da IA ocorreu durante a implementação inicial da identificação de usuários por sessão.

A IA identificou corretamente que a perda da identificação entre diferentes execuções poderia estar relacionada à duração da sessão e sugeriu o uso de `session.permanent` e `PERMANENT_SESSION_LIFETIME`.

Entretanto, uma das primeiras soluções apresentadas utilizava uma chave secreta padrão diretamente no código quando a variável de ambiente não estivesse definida.

Embora essa abordagem pudesse funcionar durante o desenvolvimento, ela não seguia adequadamente as boas práticas de segurança. Como os cookies de sessão do Flask são assinados utilizando a `SECRET_KEY`, publicar uma chave previsível no repositório poderia comprometer a segurança das sessões.

Ao revisar a solução, identifiquei que a chave deveria ser gerada apenas uma vez, armazenada localmente em um arquivo `.env`, mantida entre as reinicializações da aplicação e excluída do versionamento pelo Git.

A implementação passou então a exigir explicitamente a variável:

```python
load_dotenv()

secret_key = os.getenv("SECRET_KEY")

if not secret_key:
    raise RuntimeError(
        "A variável SECRET_KEY não foi configurada no arquivo .env."
    )

app.config["SECRET_KEY"] = secret_key
```

Outra evolução importante ocorreu na autorização dos anúncios.

A primeira implementação associava os registros apenas ao identificador anônimo do navegador. Posteriormente, com a criação de contas e login, os anúncios passaram a ser associados também ao usuário autenticado.

As operações protegidas atualmente verificam a conta armazenada na sessão antes de modificar um anúncio:

```python
anuncio = Anuncio.query.filter_by(
    id=anuncio_id,
    usuario_conta_id=session["usuario_logado_id"]
).first()
```

Além disso, as senhas das contas não são armazenadas diretamente. A aplicação utiliza funções de geração e verificação de hash para realizar a autenticação.

Esse processo reforçou que uma resposta de IA não deve ser copiada automaticamente. Mesmo quando uma sugestão funciona tecnicamente, ela precisa ser compreendida, testada e revisada de acordo com os requisitos de segurança, arquitetura e evolução do projeto.

## Melhorias futuras

- adicionar estratégias de cache ao Service Worker para funcionamento offline;
- permitir upload de imagens em vez de utilizar apenas URLs;
- implementar recuperação de senha e outras funcionalidades de gerenciamento de conta;
- criar testes automatizados para a API e para os fluxos de autenticação;
- continuar refinando acessibilidade e experiência da interface mobile.