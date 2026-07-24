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

    if categoria:
        consulta = consulta.filter(
            Anuncio.categoria.ilike(f"%{categoria}%")
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


if __name__ == "__main__":
    # Cria o arquivo do banco e suas tabelas, caso ainda não existam
    with app.app_context():
        db.create_all()

    app.run(debug=True)