import csv
import io
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Category, Kind, Transaction
from app.schemas import CategoryTotal, MonthSummary
from app.services.dates import month_bounds, parse_month


def month_summary(db: Session, user_id: int, month: str) -> MonthSummary:
    start, end = month_bounds(parse_month(month))
    rows = db.execute(
        select(Category.id, Category.name, Category.kind, func.sum(Transaction.amount))
        .join(Transaction, Transaction.category_id == Category.id)
        .where(Transaction.user_id == user_id, Transaction.date >= start, Transaction.date < end)
        .group_by(Category.id, Category.name, Category.kind)
        .order_by(func.sum(Transaction.amount).desc())
    ).all()
    by_category = [CategoryTotal(category_id=r[0], category_name=r[1], kind=r[2], total=r[3]) for r in rows]
    income = sum((c.total for c in by_category if c.kind == Kind.income), Decimal(0))
    expense = sum((c.total for c in by_category if c.kind == Kind.expense), Decimal(0))
    return MonthSummary(month=month, income=income, expense=expense, balance=income - expense, by_category=by_category)


def export_csv(db: Session, user_id: int, month: str) -> str:
    start, end = month_bounds(parse_month(month))
    rows = db.execute(
        select(Transaction.date, Transaction.kind, Category.name, Transaction.amount, Transaction.note)
        .join(Category, Category.id == Transaction.category_id)
        .where(Transaction.user_id == user_id, Transaction.date >= start, Transaction.date < end)
        .order_by(Transaction.date, Transaction.id)
    ).all()
    buffer = io.StringIO()
    writer = csv.writer(buffer, delimiter=";")
    writer.writerow(["Дата", "Тип", "Категория", "Сумма", "Комментарий"])
    for day, kind, name, amount, note in rows:
        writer.writerow([day.isoformat(), "доход" if kind == Kind.income else "расход", name, f"{amount:.2f}", note])
    return buffer.getvalue()
