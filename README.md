# CampusFlow

O **CampusFlow** é um marketplace de economia circular voltado à comunidade universitária. A plataforma permite que estudantes anunciem, vendam, doem e encontrem itens úteis, como livros, calculadoras, componentes eletrônicos, materiais acadêmicos e outros produtos que possam ser reutilizados dentro do campus.

O projeto foi desenvolvido como uma aplicação única, integrando uma **API REST**, uma **Landing Page responsiva** e uma experiência mobile instalável como **Progressive Web App (PWA)**.

## Status do projeto

✅ Versão funcional em fase de revisão final.

O deploy em nuvem e a implementação de cache offline são melhorias planejadas como diferenciais futuros.

## Funcionalidades

- Landing Page pública e responsiva;
- apresentação da proposta de economia circular;
- exibição de estatísticas simuladas;
- vitrine pública com os anúncios mais recentes;
- filtragem de anúncios por categoria;
- cadastro de itens para venda ou doação;
- edição de anúncios;
- exclusão de anúncios;
- página “Meus anúncios”;
- identificação anônima e persistente por navegador;
- proteção das operações de edição e exclusão por usuário;
- validação dos dados recebidos pela API;
- mensagens de erro e códigos HTTP adequados;
- manifesto de aplicação web;
- Service Worker básico;
- ícones para instalação da PWA;
- layout adaptado para desktop, tablet e dispositivos móveis.

## Arquitetura da aplicação

O Flask é responsável tanto pela API REST quanto pela entrega das páginas HTML, arquivos CSS, JavaScript e recursos da PWA.

O frontend realiza requisições para a API utilizando `fetch`, enquanto o Flask processa as operações e utiliza o SQLAlchemy para persistir os anúncios em um banco de dados SQLite.

Como o projeto não utiliza um sistema completo de autenticação, cada navegador recebe um identificador único armazenado na sessão do Flask. Esse identificador é associado aos anúncios criados e utilizado para controlar quais registros podem ser visualizados, editados ou excluídos na página “Meus anúncios”.

A identificação é específica do navegador. Acessar a aplicação por outro navegador, por uma janela anônima ou após remover os cookies gera um novo identificador.

## Tecnologias utilizadas

### Backend

- Python;
- Flask;
- Flask-SQLAlchemy;
- SQLite;
- python-dotenv.

### Frontend

- HTML5;
- CSS3;
- JavaScript;
- Fetch API;
- Progressive Web App.

### Desenvolvimento e versionamento

- Git;
- GitHub;
- Visual Studio Code.

## Estrutura do projeto

```text
CampusFlow-CircularEconomy/
├── app.py
├── README.md
├── requirements.txt
├── .env.example
├── .gitignore
│
├── templates/
│   ├── index.html
│   ├── cadastrar.html
│   └── meus_anuncios.html
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   ├── index.js
│   │   ├── cadastrar.js
│   │   ├── meus_anuncios.js
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

A pasta `instance/`, o banco de dados local e o arquivo `.env` são gerados ou configurados localmente e não são enviados ao repositório.

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

A mesma chave deve ser mantida entre as reinicializações da aplicação para preservar e validar corretamente os cookies de sessão.

O arquivo `.env` contém informações locais e não deve ser enviado ao repositório.

### 6. Execute a aplicação

```bash
python app.py
```

Na primeira execução, o Flask criará automaticamente o banco de dados SQLite e a tabela utilizada para armazenar os anúncios.

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

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/anuncios` | Lista todos os anúncios cadastrados |
| `GET` | `/api/anuncios?categoria=Livros` | Lista anúncios filtrados por categoria |
| `POST` | `/api/anuncios` | Cadastra um novo anúncio |
| `GET` | `/api/anuncios/meus` | Lista os anúncios associados ao navegador atual |
| `PATCH` | `/api/anuncios/<id>` | Atualiza um anúncio pertencente ao usuário atual |
| `DELETE` | `/api/anuncios/<id>` | Exclui um anúncio pertencente ao usuário atual |

As requisições e respostas da API utilizam o formato JSON.

As rotas de criação e atualização verificam campos obrigatórios, tipos de dados, limites de caracteres, preço, indicação de doação e URL da imagem.

As operações de edição e exclusão também verificam o identificador armazenado na sessão, impedindo que um navegador altere anúncios pertencentes a outro usuário.

### Principais códigos HTTP

| Código | Significado |
|---:|---|
| `200` | Requisição concluída com sucesso |
| `201` | Anúncio criado com sucesso |
| `400` | Dados enviados são inválidos |
| `404` | Anúncio ou rota não encontrado |
| `405` | Método HTTP não permitido |
| `500` | Erro interno inesperado |

## Progressive Web App

O projeto possui:

- arquivo `manifest.json`;
- ícones nos tamanhos 192 × 192 e 512 × 512;
- registro de um Service Worker;
- modo de exibição `standalone`;
- layout responsivo para dispositivos móveis;
- possibilidade de instalação em navegadores compatíveis.

O Service Worker atual é básico e atende ao requisito de registro e instalação da aplicação. Estratégias de cache e funcionamento offline permanecem como melhorias futuras.

Para verificar a configuração da PWA no Chrome ou Edge:

1. execute a aplicação;
2. abra as ferramentas do desenvolvedor com `F12`;
3. acesse a aba **Application**;
4. confira as seções **Manifest** e **Service Workers**;
5. utilize a opção de instalação exibida pelo navegador.

## Diário de Bordo da IA

### Ferramentas utilizadas

- ChatGPT.

A ferramenta foi utilizada como apoio para compreender conceitos, analisar erros, revisar decisões de arquitetura, estruturar testes e melhorar a organização do código.

As respostas não foram aplicadas automaticamente. Cada solução foi analisada, testada e adaptada ao contexto do projeto.

### Compartilhamento de histórico

O chat foi essencial para diagnosticar o problema de persistência da sessão e orientar a configuração correta do `usuario_id`, da `SECRET_KEY` e dos cookies. Também auxiliou na implementação do PWA, explicando e guiando a criação do `manifest.json`, dos ícones e do service worker, sempre com testes e adaptações ao projeto.

https://chatgpt.com/share/6a668bd9-9ab0-83e9-8db6-e7f94394d758


### Estratégia de engenharia de prompts

<details>
<summary><strong>Prompt 1 — Persistência da identificação por sessão</strong></summary>

#### Contexto

Era necessário manter a identificação do mesmo navegador entre diferentes acessos à aplicação. Inicialmente, os anúncios permaneciam no banco, mas deixavam de aparecer na página “Meus anúncios” após a aplicação ser reiniciada.

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

A solução aplicada incluiu:

- uso de uma `SECRET_KEY` fixa carregada pelo arquivo `.env`;
- configuração da sessão como permanente;
- definição de um tempo de duração para a sessão;
- criação do `usuario_id` apenas quando ele ainda não existe;
- associação do identificador aos anúncios cadastrados.

#### Validação e adaptações

A solução foi testada reiniciando a aplicação e acessando novamente pelo mesmo navegador. Os anúncios continuaram aparecendo na página “Meus anúncios”.

Também foram realizados testes em uma janela anônima, que recebeu um identificador diferente, comprovando a separação entre navegadores.

As rotas de edição e exclusão foram adaptadas para consultar simultaneamente o ID do anúncio e o `usuario_id` da sessão, impedindo alterações em anúncios pertencentes a outro navegador.

#### Aprendizado

Esse processo permitiu compreender melhor a relação entre sessões, cookies, `SECRET_KEY` e persistência da identificação no Flask.

Também ficou claro que o cookie não armazena os anúncios. Ele mantém os dados necessários para que o servidor reconheça o navegador e consulte os registros correspondentes no banco de dados.

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

### Reflexão crítica

Durante a implementação da identificação anônima dos usuários, percebi que os anúncios deixavam de aparecer na página “Meus anúncios” após o navegador ou a aplicação serem reiniciados.

A IA identificou corretamente que o problema poderia estar relacionado à perda da sessão e sugeriu torná-la permanente, configurando `session.permanent` e `PERMANENT_SESSION_LIFETIME`.

Entretanto, a primeira solução apresentada utilizava uma chave secreta padrão diretamente no código quando a variável de ambiente não estivesse definida. Embora essa abordagem pudesse funcionar durante o desenvolvimento, ela não seguia adequadamente as boas práticas de segurança, pois uma `SECRET_KEY` previsível poderia comprometer a assinatura dos cookies de sessão.

Identifiquei essa limitação ao comparar a solução com uma análise posterior mais completa, que recomendava gerar a chave apenas uma vez, armazená-la em um arquivo `.env`, impedir seu versionamento pelo Git e manter o mesmo valor entre as reinicializações da aplicação.

Também foi observada a necessidade de validar o `usuario_id` nas operações de edição e exclusão, evitando que um anúncio fosse alterado apenas por meio de seu identificador numérico.

A partir disso, conduzi a IA para uma solução mais adequada ao projeto: mantive a sessão permanente para preservar a identificação do navegador, substituí a chave inserida diretamente no código por uma variável de ambiente e adicionei controles de autorização nas rotas.

Esse processo demonstrou que uma resposta gerada por IA não deve ser copiada automaticamente. Ela precisa ser compreendida, testada e adaptada aos requisitos técnicos e de segurança da aplicação.

### Reflexão crítica

Durante a implementação da identificação anônima dos usuários, percebi que os anúncios deixavam de aparecer na página “Meus anúncios” após o navegador ou a aplicação serem reiniciados. A IA identificou corretamente que o problema poderia estar relacionado à perda da sessão e sugeriu torná-la permanente, configurando `session.permanent` e `PERMANENT_SESSION_LIFETIME`.

Entretanto, a primeira solução apresentada utilizava uma chave secreta padrão diretamente no código quando a variável de ambiente não estivesse definida. Embora essa abordagem pudesse funcionar durante o desenvolvimento, ela não seguia adequadamente as boas práticas de segurança, pois uma `SECRET_KEY` previsível pode comprometer a assinatura dos cookies de sessão.

Identifiquei essa limitação ao comparar a solução com uma segunda análise mais completa, que recomendava gerar a chave apenas uma vez, armazená-la em um arquivo `.env`, impedir seu versionamento pelo Git e manter o mesmo valor entre as reinicializações da aplicação. Também foi observada a necessidade de validar o `usuario_id` nas operações de edição e exclusão, evitando que um anúncio fosse alterado apenas por meio de seu identificador numérico.

A partir disso, conduzi a IA para uma solução mais adequada ao projeto: mantive a sessão permanente para preservar a identificação do navegador, mas substituí a chave inserida diretamente no código por uma variável de ambiente e considerei controles adicionais de autorização. Esse processo mostrou que a resposta inicial da IA não deveria ser copiada automaticamente, mas analisada, testada e adaptada ao contexto e aos requisitos de segurança da aplicação.

## Melhorias futuras

- realizar o deploy da aplicação;
- substituir o SQLite por PostgreSQL em produção;
- adicionar estratégias de cache ao Service Worker;
- permitir o envio de imagens em vez de apenas URLs;
- implementar autenticação completa de usuários;
- criar testes automatizados para a API.