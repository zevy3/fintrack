from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User

DbSession = Annotated[Session, Depends(get_db)]

DEMO_USER_ID = 1


def get_current_user(db: DbSession) -> User:
    """Временная заглушка до ЛР4: все запросы выполняются от имени демо-пользователя."""
    user = db.get(User, DEMO_USER_ID)
    if user is None:
        raise HTTPException(status_code=401, detail="Пользователь не найден. Выполните python -m app.seed")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
