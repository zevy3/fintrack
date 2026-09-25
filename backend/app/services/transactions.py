from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Kind, Transaction
from app.schemas import TransactionCreate, TransactionUpdate
from app.services.categories import get_category
from app.services.errors import NotFound, Unprocessable


def _check_category(db: Session, user_id: int, category_id: int, kind: Kind) -> None:
    category = get_category(db, user_id, category_id)
    if category.kind != kind:
        raise Unprocessable("Тип операции не совпадает с типом категории")


def list_transactions(
    db: Session,
    user_id: int,
    *,
    kind: Kind | None,
    category_id: int | None,
    date_from: date | None,
    date_to: date | None,
    limit: int,
    offset: int,
) -> tuple[list[Transaction], int]:
    query = select(Transaction).where(Transaction.user_id == user_id)
    if kind:
        query = query.where(Transaction.kind == kind)
    if category_id:
        query = query.where(Transaction.category_id == category_id)
    if date_from:
        query = query.where(Transaction.date >= date_from)
    if date_to:
        query = query.where(Transaction.date <= date_to)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    items = db.scalars(query.order_by(Transaction.date.desc(), Transaction.id.desc()).limit(limit).offset(offset))
    return list(items), total


def get_transaction(db: Session, user_id: int, transaction_id: int) -> Transaction:
    item = db.scalar(select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == user_id))
    if item is None:
        raise NotFound("Операция не найдена")
    return item


def create_transaction(db: Session, user_id: int, data: TransactionCreate) -> Transaction:
    _check_category(db, user_id, data.category_id, data.kind)
    item = Transaction(user_id=user_id, **data.model_dump())
    db.add(item)
    db.commit()
    return item


def update_transaction(db: Session, user_id: int, transaction_id: int, data: TransactionUpdate) -> Transaction:
    item = get_transaction(db, user_id, transaction_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        if value is None:
            continue
        setattr(item, field, value)
    _check_category(db, user_id, item.category_id, item.kind)
    db.commit()
    return item


def delete_transaction(db: Session, user_id: int, transaction_id: int) -> None:
    db.delete(get_transaction(db, user_id, transaction_id))
    db.commit()
