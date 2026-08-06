"""link anuncios to usuarios

Revision ID: c40aa82e1839
Revises: 3776b0c39502
Create Date: 2026-08-05 16:12:40.622310
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c40aa82e1839'
down_revision = '3776b0c39502'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('anuncios', schema=None) as batch_op:
        batch_op.add_column(sa.Column('usuario_conta_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_anuncios_usuario_conta_id', 'usuarios', ['usuario_conta_id'], ['id'])


def downgrade():
    with op.batch_alter_table('anuncios', schema=None) as batch_op:
        batch_op.drop_constraint('fk_anuncios_usuario_conta_id', type_='foreignkey')
        batch_op.drop_column('usuario_conta_id')