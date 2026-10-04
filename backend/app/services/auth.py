from datetime import UTC, datetime

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import TokenError, create_token, decode_token, hash_password, needs_rehash, verify_password
from app.models import RefreshToken, User
from app.schemas import RegisterRequest, TokenPair
from app.services.errors import Conflict, ServiceError


class Unauthorized(ServiceError):
    status_code = 401


# Хеш для выравнивания времени ответа, когда пользователь не найден (защита от перебора e-mail).
_DUMMY_HASH = hash_password("dummy-password-1")


def _issue_pair(db: Session, user: User) -> TokenPair:
    access, _ = create_token(user.id, "access")
    refresh, expires = create_token(user.id, "refresh")
    jti = decode_token(refresh, "refresh")["jti"]
    db.add(RefreshToken(jti=jti, user_id=user.id, expires_at=expires))
    db.commit()
    return TokenPair(access_token=access, refresh_token=refresh, expires_in=settings.access_token_minutes * 60)


def register(db: Session, data: RegisterRequest) -> User:
    user = User(email=data.email.lower(), name=data.name, password_hash=hash_password(data.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise Conflict("Пользователь с таким e-mail уже зарегистрирован") from None
    return user


def login(db: Session, email: str, password: str) -> TokenPair:
    user = db.scalar(select(User).where(User.email == email.lower()))
    if user is None:
        verify_password(password, _DUMMY_HASH)
        raise Unauthorized("Неверный e-mail или пароль")
    if not verify_password(password, user.password_hash):
        raise Unauthorized("Неверный e-mail или пароль")
    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(password)
    return _issue_pair(db, user)


def _revoke_all(db: Session, user_id: int) -> None:
    db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
    )
    db.commit()


def refresh(db: Session, refresh_token: str) -> TokenPair:
    """Обмен refresh-токена на новую пару (ротация). Повторное использование отозванного токена
    считается компрометацией: отзываются все токены пользователя."""
    try:
        payload = decode_token(refresh_token, "refresh")
    except TokenError as exc:
        raise Unauthorized(str(exc)) from None
    row = db.scalar(select(RefreshToken).where(RefreshToken.jti == payload["jti"]))
    if row is None:
        raise Unauthorized("Недействительный токен")
    if row.revoked_at is not None:
        _revoke_all(db, row.user_id)
        raise Unauthorized("Токен отозван")
    user = db.get(User, row.user_id)
    if user is None:
        raise Unauthorized("Пользователь не найден")
    row.revoked_at = datetime.now(UTC)
    return _issue_pair(db, user)


def logout(db: Session, refresh_token: str) -> None:
    """Отзыв refresh-токена. Недействительный токен молча игнорируется: выход всегда успешен."""
    try:
        payload = decode_token(refresh_token, "refresh")
    except TokenError:
        return
    db.execute(
        update(RefreshToken)
        .where(RefreshToken.jti == payload["jti"], RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
    )
    db.commit()


def user_from_access_token(db: Session, token: str) -> User:
    try:
        payload = decode_token(token, "access")
    except TokenError as exc:
        raise Unauthorized(str(exc)) from None
    user = db.get(User, int(payload["sub"]))
    if user is None:
        raise Unauthorized("Пользователь не найден")
    return user
