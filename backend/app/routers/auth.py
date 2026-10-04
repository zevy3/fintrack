from fastapi import APIRouter, Response, status
from sqlalchemy import select

from app.deps import AdminUser, CurrentUser, DbSession
from app.models import User
from app.schemas import LoginRequest, RefreshRequest, RegisterRequest, TokenPair, UserOut
from app.services import auth as service

router = APIRouter(prefix="/auth", tags=["Аутентификация"])
admin_router = APIRouter(prefix="/admin", tags=["Администрирование"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: DbSession):
    return service.register(db, data)


@router.post("/login", response_model=TokenPair)
def login(data: LoginRequest, db: DbSession):
    return service.login(db, data.email, data.password)


@router.post("/refresh", response_model=TokenPair)
def refresh(data: RefreshRequest, db: DbSession):
    return service.refresh(db, data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(data: RefreshRequest, db: DbSession):
    service.logout(db, data.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser):
    return user


@admin_router.get("/users", response_model=list[UserOut])
def list_users(db: DbSession, _: AdminUser):
    return list(db.scalars(select(User).order_by(User.id)))
