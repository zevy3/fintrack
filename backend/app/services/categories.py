from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Category, Transaction
from app.schemas import CategoryCreate, CategoryUpdate
from app.services.errors import Conflict, NotFound


def list_categories(db: Session, user_id: int) -> list[Category]:
    return list(db.scalars(select(Category).where(Category.user_id == user_id).order_by(Category.kind, Category.name)))


def get_category(db: Session, user_id: int, category_id: int) -> Category:
    category = db.scalar(select(Category).where(Category.id == category_id, Category.user_id == user_id))
    if category is None:
        raise NotFound("Категория не найдена")
    return category


def create_category(db: Session, user_id: int, data: CategoryCreate) -> Category:
    category = Category(user_id=user_id, name=data.name, kind=data.kind)
    db.add(category)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise Conflict("Такая категория уже существует") from None
    return category


def update_category(db: Session, user_id: int, category_id: int, data: CategoryUpdate) -> Category:
    category = get_category(db, user_id, category_id)
    if data.name is not None:
        category.name = data.name.strip()
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise Conflict("Такая категория уже существует") from None
    return category


def delete_category(db: Session, user_id: int, category_id: int) -> None:
    category = get_category(db, user_id, category_id)
    used = db.scalar(select(func.count()).select_from(Transaction).where(Transaction.category_id == category.id))
    if used:
        raise Conflict("Нельзя удалить категорию, в которой есть операции")
    db.delete(category)
    db.commit()
