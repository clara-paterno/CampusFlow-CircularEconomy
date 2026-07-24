from datetime import datetime, timezone

from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)

# Configuração do banco de dados SQLite
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///economia_circular.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Cria a conexão entre o Flask e o banco
db = SQLAlchemy(app)


# Modelo que representa a tabela de anúncios
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
        db.Integer,
        nullable=False,
        default=1
    )

    criado_em = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )


@app.route("/")
def pagina_inicial():
    return render_template("index.html")


@app.route("/sobre")
def pagina_sobre():
    return "Esta é a página sobre o projeto de Economia Circular."

@app.route("/api/anuncios", methods=["POST"])
def criar_anuncio():
    dados = request.get_json(silent=True)

    # Verifica se realmente foi enviado um JSON
    if dados is None:
        return jsonify({
            "erro": "A requisição deve conter um JSON válido."
        }), 400

    # Campos obrigatórios
    campos_obrigatorios = ["titulo", "descricao", "categoria"]

    campos_ausentes = [
        campo
        for campo in campos_obrigatorios
        if not dados.get(campo)
    ]

    if campos_ausentes:
        return jsonify({
            "erro": "Existem campos obrigatórios não preenchidos.",
            "campos_ausentes": campos_ausentes
        }), 400

    doacao = dados.get("doacao", False)
    preco = dados.get("preco")

    # O campo doacao precisa ser verdadeiro ou falso
    if not isinstance(doacao, bool):
        return jsonify({
            "erro": "O campo 'doacao' deve ser true ou false."
        }), 400

    # Se não for doação, o preço é obrigatório
    if not doacao and preco is None:
        return jsonify({
            "erro": "O preço é obrigatório para itens que não são doação."
        }), 400

    # Se for uma doação, o preço será vazio
    if doacao:
        preco = None

    try:
        novo_anuncio = Anuncio(
            titulo=dados["titulo"].strip(),
            descricao=dados["descricao"].strip(),
            categoria=dados["categoria"].strip(),
            preco=preco,
            doacao=doacao,
            imagem_url=dados.get("imagem_url"),
            usuario_id=dados.get("usuario_id", 1)
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

        return jsonify({
            "erro": "Não foi possível cadastrar o anúncio."
        }), 500


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


@app.route("/api/anuncios/<int:anuncio_id>", methods=["DELETE"])
def excluir_anuncio(anuncio_id):
    anuncio = db.session.get(Anuncio,anuncio_id)

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
    

@app.route("/api/anuncios/<int:anuncio_id>", methods=["PATCH"])
def atualizar_anuncio(anuncio_id):
    anuncio = db.session.get(Anuncio, anuncio_id)

    if anuncio is None:
        return jsonify({
            "erro": "Anúncio não encontrado."
        }), 404

    dados = request.get_json(silent=True)

    if dados is None:
        return jsonify({
            "erro": "A requisição deve conter um JSON válido."
        }), 400

    campos_permitidos = {
        "titulo",
        "descricao",
        "categoria",
        "preco",
        "doacao",
        "imagem_url",
        "usuario_id"
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
            "campos_invalidos": list(campos_invalidos)
        }), 400

    # Validação dos campos de texto
    for campo in ["titulo", "descricao", "categoria"]:
        if campo in dados:
            valor = dados[campo]

            if not isinstance(valor, str) or not valor.strip():
                return jsonify({
                    "erro": f"O campo '{campo}' não pode ficar vazio."
                }), 400

            setattr(anuncio, campo, valor.strip())

    # Validação do campo doacao
    if "doacao" in dados:
        if not isinstance(dados["doacao"], bool):
            return jsonify({
                "erro": "O campo 'doacao' deve ser true ou false."
            }), 400

        anuncio.doacao = dados["doacao"]

    # Atualiza os demais campos
    if "imagem_url" in dados:
        anuncio.imagem_url = dados["imagem_url"]

    if "usuario_id" in dados:
        anuncio.usuario_id = dados["usuario_id"]

    if "preco" in dados:
        preco = dados["preco"]

        if preco is not None:
            if not isinstance(preco, (int, float)):
                return jsonify({
                    "erro": "O preço deve ser um número."
                }), 400

            if preco < 0:
                return jsonify({
                    "erro": "O preço não pode ser negativo."
                }), 400

        anuncio.preco = preco

    # Doações não possuem preço
    if anuncio.doacao:
        anuncio.preco = None

    # Itens à venda precisam ter preço
    if not anuncio.doacao and anuncio.preco is None:
        return jsonify({
            "erro": "Itens que não são doação precisam ter um preço."
        }), 400

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

        return jsonify({
            "erro": "Não foi possível atualizar o anúncio."
        }), 500



if __name__ == "__main__":
    # Cria o arquivo do banco e suas tabelas, caso ainda não existam
    with app.app_context():
        db.create_all()

    app.run(debug=True)