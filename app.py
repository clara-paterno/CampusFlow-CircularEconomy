import os
from uuid import uuid4

from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    session,
    send_from_directory,
)

from flask_sqlalchemy import SQLAlchemy

# Carrega as variáveis definidas no arquivo .env
load_dotenv()

app = Flask(__name__)

secret_key = os.getenv("SECRET_KEY")

if not secret_key:
    raise RuntimeError(
        "A variável SECRET_KEY não foi configurada no arquivo .env."
    )

app.config["SECRET_KEY"] = secret_key

# Configuração da duração e segurança da sessão
app.config.update(
    PERMANENT_SESSION_LIFETIME=timedelta(days=180),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,
    SESSION_REFRESH_EACH_REQUEST=True,
)

# Para que o Json identifique acentuação
app.json.ensure_ascii = False

# Configuração do banco de dados SQLite
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///economia_circular.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Cria a conexão entre o Flask e o banco
db = SQLAlchemy(app)

@app.before_request
def identificar_usuario():
    # Faz o cookie permanecer após o navegador ser fechado
    session.permanent = True

    # Gera o identificador apenas no primeiro acesso
    if "usuario_id" not in session:
        session["usuario_id"] = str(uuid4())

# Modelo/classe anúncio
#region ANUNCIO
class Anuncio(db.Model):
    __tablename__ = "anuncios"

    id = db.Column(db.Integer, primary_key=True)

    titulo = db.Column(
        db.String(150),
        nullable=False
    )

    descricao = db.Column(
        db.Text,
        nullable=False
    )

    categoria = db.Column(
        db.String(100),
        nullable=False
    )

    preco = db.Column(
        db.Numeric(10, 2),
        nullable=True
    )

    doacao = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )

    imagem_url = db.Column(
        db.String(500),
        nullable=True
    )

    usuario_id = db.Column(
        db.String(36),
        nullable=False
    )

    criado_em = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
#endregion

#region PAGES
# Landing page do projeto 
@app.route("/")
def pagina_inicial():
    return render_template("index.html")

# Redireciona para a página de cadastro do produto
@app.route("/cadastrar")
def pagina_cadastrar():
    return render_template("cadastrar.html")

# Redireciona para a página de meus anúncios
@app.route("/meus-anuncios")
def pagina_meus_anuncios():
    return render_template("meus_anuncios.html")

#Permite o navegador a acessasr arquivos fora de static
@app.route("/service-worker.js")
def disponibilizar_service_worker():
    resposta = send_from_directory(
        app.static_folder,
        "service-worker.js",
        mimetype="application/javascript"
    )

    resposta.headers["Cache-Control"] = "no-cache"

    return resposta

#endregion

# region POST
@app.route("/api/anuncios", methods=["POST"])
def criar_anuncio():
    dados = request.get_json(silent=True)

    # O corpo precisa ser um objeto JSON
    if not isinstance(dados, dict):
        return jsonify({
            "erro": "A requisição deve conter um objeto JSON válido."
        }), 400

    # Recupera os campos de texto
    titulo = dados.get("titulo")
    descricao = dados.get("descricao")
    categoria = dados.get("categoria")

    # Validação do título
    if not isinstance(titulo, str) or not titulo.strip():
        return jsonify({
            "erro": "O campo 'titulo' é obrigatório e deve conter texto."
        }), 400

    titulo = titulo.strip()

    if len(titulo) > 150:
        return jsonify({
            "erro": "O título deve possuir no máximo 150 caracteres."
        }), 400

    # Validação da descrição
    if not isinstance(descricao, str) or not descricao.strip():
        return jsonify({
            "erro": "O campo 'descricao' é obrigatório e deve conter texto."
        }), 400

    descricao = descricao.strip()

    # Validação da categoria
    if not isinstance(categoria, str) or not categoria.strip():
        return jsonify({
            "erro": "O campo 'categoria' é obrigatório e deve conter texto."
        }), 400

    categoria = categoria.strip()

    if len(categoria) > 100:
        return jsonify({
            "erro": "A categoria deve possuir no máximo 100 caracteres."
        }), 400

    # Validação do tipo do anúncio
    doacao = dados.get("doacao", False)

    if not isinstance(doacao, bool):
        return jsonify({
            "erro": "O campo 'doacao' deve ser true ou false."
        }), 400

    # Validação do preço
    preco = dados.get("preco")

    if doacao:
        preco = None

    else:
        if preco is None:
            return jsonify({
                "erro": (
                    "O preço é obrigatório para itens "
                    "que não são doação."
                )
            }), 400

        # Em Python, bool também é considerado int.
        # Por isso, ele precisa ser rejeitado primeiro.
        if isinstance(preco, bool) or not isinstance(
            preco,
            (int, float)
        ):
            return jsonify({
                "erro": "O preço deve ser um número."
            }), 400

        if preco < 0:
            return jsonify({
                "erro": "O preço não pode ser negativo."
            }), 400

    # Validação da URL da imagem
    imagem_url = dados.get("imagem_url")

    if imagem_url is not None:
        if not isinstance(imagem_url, str):
            return jsonify({
                "erro": "A URL da imagem deve ser um texto."
            }), 400

        imagem_url = imagem_url.strip() or None

        if imagem_url is not None and len(imagem_url) > 500:
            return jsonify({
                "erro": (
                    "A URL da imagem deve possuir "
                    "no máximo 500 caracteres."
                )
            }), 400

    # Identificador do navegador atual
    usuario_id = session["usuario_id"]

    try:
        novo_anuncio = Anuncio(
            titulo=titulo,
            descricao=descricao,
            categoria=categoria,
            preco=preco,
            doacao=doacao,
            imagem_url=imagem_url,
            usuario_id=usuario_id
        )

        db.session.add(novo_anuncio)
        db.session.commit()

        return jsonify({
            "mensagem": "Anúncio cadastrado com sucesso.",
            "anuncio": {
                "id": novo_anuncio.id,
                "titulo": novo_anuncio.titulo,
                "descricao": novo_anuncio.descricao,
                "categoria": novo_anuncio.categoria,
                "preco": (
                    float(novo_anuncio.preco)
                    if novo_anuncio.preco is not None
                    else None
                ),
                "doacao": novo_anuncio.doacao,
                "imagem_url": novo_anuncio.imagem_url,
                "usuario_id": novo_anuncio.usuario_id,
                "criado_em": novo_anuncio.criado_em.isoformat()
            }
        }), 201

    except Exception:
        db.session.rollback()

        app.logger.exception(
            "Ocorreu um erro ao cadastrar o anúncio."
        )

        return jsonify({
            "erro": "Não foi possível cadastrar o anúncio."
        }), 500

#endregion

#region GET
@app.route("/api/anuncios", methods=["GET"])
def listar_anuncios():
    categoria = request.args.get("categoria")

    consulta = Anuncio.query

    # Aplica o filtro somente quando uma categoria for enviada
    if categoria:
        categoria = categoria.strip()

        consulta = consulta.filter(
            Anuncio.categoria.ilike(categoria)
        )

    # Os anúncios mais recentes aparecem primeiro
    anuncios = consulta.order_by(
        Anuncio.criado_em.desc()
    ).all()

    resultado = []

    for anuncio in anuncios:
        resultado.append({
            "id": anuncio.id,
            "titulo": anuncio.titulo,
            "descricao": anuncio.descricao,
            "categoria": anuncio.categoria,
            "preco": (
                float(anuncio.preco)
                if anuncio.preco is not None
                else None
            ),
            "doacao": anuncio.doacao,
            "imagem_url": anuncio.imagem_url,
            "usuario_id": anuncio.usuario_id,
            "criado_em": anuncio.criado_em.isoformat()
        })

    return jsonify({
        "quantidade": len(resultado),
        "categoria": categoria,
        "anuncios": resultado
    }), 200

#endregion

#region GET MEUS 

@app.route("/api/anuncios/meus", methods=["GET"])
def listar_meus_anuncios():
    usuario_id = session["usuario_id"]

    consulta = Anuncio.query.filter_by(
        usuario_id=usuario_id
    )

    anuncios = consulta.order_by(
        Anuncio.criado_em.desc()
    ).all()

    resultado = []

    for anuncio in anuncios:
        resultado.append({
            "id": anuncio.id,
            "titulo": anuncio.titulo,
            "descricao": anuncio.descricao,
            "categoria": anuncio.categoria,
            "preco": (
                float(anuncio.preco)
                if anuncio.preco is not None
                else None
            ),
            "doacao": anuncio.doacao,
            "imagem_url": anuncio.imagem_url,
            "usuario_id": anuncio.usuario_id,
            "criado_em": anuncio.criado_em.isoformat()
        })

    return jsonify({
        "quantidade": len(resultado),
        "anuncios": resultado
    }), 200

#endregion

#region DELETE
@app.route("/api/anuncios/<int:anuncio_id>", methods=["DELETE"])
def excluir_anuncio(anuncio_id):
    anuncio = Anuncio.query.filter_by(
    id=anuncio_id,
    usuario_id=session["usuario_id"]
    ).first()

    if anuncio is None:
        return jsonify({
            "erro": "anúncio não encontrado."
        }), 404

    try:
        db.session.delete(anuncio)
        db.session.commit()

        return jsonify({
            "mensagem":"anúncio deletado com sucesso.",
            "id_excluido":anuncio_id
        }),200
    
    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": "Não foi possível excluir o anúncio."
        }), 500
    
#endregion

#region PATCH
@app.route("/api/anuncios/<int:anuncio_id>", methods=["PATCH"])
def atualizar_anuncio(anuncio_id):
    anuncio = Anuncio.query.filter_by(
        id=anuncio_id,
        usuario_id=session["usuario_id"]
    ).first()

    if anuncio is None:
        return jsonify({
            "erro": "Anúncio não encontrado."
        }), 404

    dados = request.get_json(silent=True)

    if not isinstance(dados, dict):
        return jsonify({
            "erro": "A requisição deve conter um objeto JSON válido."
        }), 400

    campos_permitidos = {
        "titulo",
        "descricao",
        "categoria",
        "preco",
        "doacao",
        "imagem_url"
    }

    campos_enviados = set(dados.keys())

    if not campos_enviados:
        return jsonify({
            "erro": "Nenhum campo foi enviado para atualização."
        }), 400

    campos_invalidos = campos_enviados - campos_permitidos

    if campos_invalidos:
        return jsonify({
            "erro": "Um ou mais campos não podem ser atualizados.",
            "campos_invalidos": sorted(campos_invalidos)
        }), 400

    # Começa com os valores atuais do anúncio
    titulo_novo = anuncio.titulo
    descricao_nova = anuncio.descricao
    categoria_nova = anuncio.categoria
    preco_novo = anuncio.preco
    doacao_nova = anuncio.doacao
    imagem_url_nova = anuncio.imagem_url

    # Validação do título
    if "titulo" in dados:
        titulo = dados["titulo"]

        if not isinstance(titulo, str) or not titulo.strip():
            return jsonify({
                "erro": (
                    "O campo 'titulo' é obrigatório "
                    "e deve conter texto."
                )
            }), 400

        titulo = titulo.strip()

        if len(titulo) > 150:
            return jsonify({
                "erro": "O título deve possuir no máximo 150 caracteres."
            }), 400

        titulo_novo = titulo

    # Validação da descrição
    if "descricao" in dados:
        descricao = dados["descricao"]

        if not isinstance(descricao, str) or not descricao.strip():
            return jsonify({
                "erro": (
                    "O campo 'descricao' é obrigatório "
                    "e deve conter texto."
                )
            }), 400

        descricao_nova = descricao.strip()

    # Validação da categoria
    if "categoria" in dados:
        categoria = dados["categoria"]

        if not isinstance(categoria, str) or not categoria.strip():
            return jsonify({
                "erro": (
                    "O campo 'categoria' é obrigatório "
                    "e deve conter texto."
                )
            }), 400

        categoria = categoria.strip()

        if len(categoria) > 100:
            return jsonify({
                "erro": (
                    "A categoria deve possuir "
                    "no máximo 100 caracteres."
                )
            }), 400

        categoria_nova = categoria

    # Validação do campo de doação
    if "doacao" in dados:
        doacao = dados["doacao"]

        if not isinstance(doacao, bool):
            return jsonify({
                "erro": "O campo 'doacao' deve ser true ou false."
            }), 400

        doacao_nova = doacao

    # Validação do preço
    if "preco" in dados:
        preco = dados["preco"]

        if preco is not None:
            if isinstance(preco, bool) or not isinstance(
                preco,
                (int, float)
            ):
                return jsonify({
                    "erro": "O preço deve ser um número."
                }), 400

            if preco < 0:
                return jsonify({
                    "erro": "O preço não pode ser negativo."
                }), 400

        preco_novo = preco

    # Validação da URL da imagem
    if "imagem_url" in dados:
        imagem_url = dados["imagem_url"]

        if imagem_url is not None:
            if not isinstance(imagem_url, str):
                return jsonify({
                    "erro": "A URL da imagem deve ser um texto."
                }), 400

            imagem_url = imagem_url.strip() or None

            if imagem_url is not None and len(imagem_url) > 500:
                return jsonify({
                    "erro": (
                        "A URL da imagem deve possuir "
                        "no máximo 500 caracteres."
                    )
                }), 400

        imagem_url_nova = imagem_url

    # Verifica a combinação final entre doação e preço
    if doacao_nova:
        preco_novo = None

    elif preco_novo is None:
        return jsonify({
            "erro": (
                "Itens que não são doação "
                "precisam ter um preço."
            )
        }), 400

    # Somente após todas as validações o objeto é alterado
    anuncio.titulo = titulo_novo
    anuncio.descricao = descricao_nova
    anuncio.categoria = categoria_nova
    anuncio.preco = preco_novo
    anuncio.doacao = doacao_nova
    anuncio.imagem_url = imagem_url_nova

    try:
        db.session.commit()

        return jsonify({
            "mensagem": "Anúncio atualizado com sucesso.",
            "anuncio": {
                "id": anuncio.id,
                "titulo": anuncio.titulo,
                "descricao": anuncio.descricao,
                "categoria": anuncio.categoria,
                "preco": (
                    float(anuncio.preco)
                    if anuncio.preco is not None
                    else None
                ),
                "doacao": anuncio.doacao,
                "imagem_url": anuncio.imagem_url,
                "usuario_id": anuncio.usuario_id,
                "criado_em": anuncio.criado_em.isoformat()
            }
        }), 200

    except Exception:
        db.session.rollback()

        app.logger.exception(
            "Ocorreu um erro ao atualizar o anúncio."
        )

        return jsonify({
            "erro": "Não foi possível atualizar o anúncio."
        }), 500

#endregion

#region RUN APP
if __name__ == "__main__":
    # Cria o arquivo do banco e suas tabelas, caso ainda não existam
    with app.app_context():
        db.create_all()

    app.run(debug=True)

#endregion