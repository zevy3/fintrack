from fastapi import APIRouter, Response, status

from app.deps import CurrentUser, DbSession
from app.schemas import CategoryCreate, CategoryOut, CategoryUpdate
from app.services import categories as service

router = APIRouter(prefix="/categories", tags=["Категории"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: DbSession, user: CurrentUser):
    return service.list_categories(db, user.id)


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(data: CategoryCreate, db: DbSession, user: CurrentUser):
    return service.create_category(db, user.id, data)


@router.get("/{category_id}", response_model=CategoryOut)
def get_category(category_id: int, db: DbSession, user: CurrentUser):
    return service.get_category(db, user.id, category_id)


@router.patch("/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, data: CategoryUpdate, db: DbSession, user: CurrentUser):
    return service.update_category(db, user.id, category_id, data)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: DbSession, user: CurrentUser):
    service.delete_category(db, user.id, category_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
