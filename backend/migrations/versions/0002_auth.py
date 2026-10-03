"""Аутентификация: пароли, роли, refresh-токены

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-06 21:07:01.087125

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0002'
down_revision: Union[str, Sequence[str], None] = '0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('refresh_tokens',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('jti', sa.String(length=64), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_refresh_tokens_jti'), 'refresh_tokens', ['jti'], unique=True)
    op.create_index(op.f('ix_refresh_tokens_user_id'), 'refresh_tokens', ['user_id'], unique=False)
    # У уже существующих пользователей пароля нет: '!' — заведомо неверный хеш, войти нельзя,
    # пока пароль не будет задан (для демо-пользователя — python -m app.seed).
    op.add_column('users', sa.Column('password_hash', sa.String(length=255), nullable=False, server_default='!'))
    op.alter_column('users', 'password_hash', server_default=None)
    role = sa.Enum('user', 'admin', name='role')
    role.create(op.get_bind(), checkfirst=True)
    op.add_column('users', sa.Column('role', role, server_default='user', nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'role')
    op.drop_column('users', 'password_hash')
    op.drop_index(op.f('ix_refresh_tokens_user_id'), table_name='refresh_tokens')
    op.drop_index(op.f('ix_refresh_tokens_jti'), table_name='refresh_tokens')
    op.drop_table('refresh_tokens')
    sa.Enum(name='role').drop(op.get_bind(), checkfirst=True)
