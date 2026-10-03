"""Хеширование паролей (Argon2id) и работа с JWT."""

import uuid
from datetime import UTC, datetime, timedelta
from typing import Literal

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

from app.core.config import settings

TokenType = Literal["access", "refresh"]

_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerificationError, InvalidHashError):
        return False


def needs_rehash(password_hash: str) -> bool:
    return _hasher.check_needs_rehash(password_hash)


class TokenError(Exception):
    """Токен недействителен: подпись, срок действия или тип не подошли."""


def create_token(user_id: int, token_type: TokenType, *, jti: str | None = None, now: datetime | None = None) -> tuple[str, datetime]:
    """Возвращает (токен, момент истечения)."""
    now = now or datetime.now(UTC)
    lifetime = (
        timedelta(minutes=settings.access_token_minutes)
        if token_type == "access"
        else timedelta(days=settings.refresh_token_days)
    )
    expires = now + lifetime
    payload = {
        "sub": str(user_id),
        "type": token_type,
        "jti": jti or uuid.uuid4().hex,
        "iat": int(now.timestamp()),
        "exp": int(expires.timestamp()),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm), expires


def decode_token(token: str, expected_type: TokenType) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["exp", "sub", "jti", "type"]},
        )
    except jwt.ExpiredSignatureError:
        raise TokenError("Срок действия токена истёк") from None
    except jwt.InvalidTokenError:
        raise TokenError("Недействительный токен") from None
    if payload["type"] != expected_type:
        raise TokenError("Неверный тип токена")
    return payload
