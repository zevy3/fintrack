from datetime import date

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Budget, Kind, Transaction
from app.schemas import BudgetCreate, BudgetOut
from app.services.categories import get_category
from app.services.dates import month_bounds, parse_month
from app.services.errors import Conflict, NotFound, Unprocessable


def _to_out(budget: Budget, spent) -> BudgetOut:
    return BudgetOut(
        id=budget.id,
        category_id=budget.category_id,
        month=budget.month.strftime("%Y-%m"),
        limit=budget.amount_limit,
        spent=spent or 0,
    )


def _spent(db: Session, user_id: int, category_id: int, month: date):
    start, end = month_bounds(month)
    return db.scalar(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.category_id == category_id,
            Transaction.kind == Kind.expense,
            Transaction.date >= start,
            Transaction.date < end,
        )
    )


def list_budgets(db: Session, user_id: int, month: str | None) -> list[BudgetOut]:
    query = select(Budget).where(Budget.user_id == user_id).order_by(Budget.month.desc(), Budget.id)
    if month:
        query = query.where(Budget.month == parse_month(month))
    return [_to_out(b, _spent(db, user_id, b.category_id, b.month)) for b in db.scalars(query)]


def _get(db: Session, user_id: int, budget_id: int) -> Budget:
    budget = db.scalar(select(Budget).where(Budget.id == budget_id, Budget.user_id == user_id))
    if budget is None:
        raise NotFound("Бюджет не найден")
    return budget


def create_budget(db: Session, user_id: int, data: BudgetCreate) -> BudgetOut:
    category = get_category(db, user_id, data.category_id)
    if category.kind != Kind.expense:
        raise Unprocessable("Бюджет можно задать только для категории расходов")
    budget = Budget(user_id=user_id, category_id=category.id, month=parse_month(data.month), amount_limit=data.limit)
    db.add(budget)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise Conflict("Бюджет на эту категорию и месяц уже существует") from None
    return _to_out(budget, _spent(db, user_id, budget.category_id, budget.month))


def update_budget(db: Session, user_id: int, budget_id: int, limit) -> BudgetOut:
    budget = _get(db, user_id, budget_id)
    budget.amount_limit = limit
    db.commit()
    return _to_out(budget, _spent(db, user_id, budget.category_id, budget.month))


def delete_budget(db: Session, user_id: int, budget_id: int) -> None:
    db.delete(_get(db, user_id, budget_id))
    db.commit()
