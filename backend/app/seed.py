"""Заполнение БД демонстрационными данными: python -m app.seed"""

from datetime import date
from decimal import Decimal

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models import Budget, Category, Kind, Transaction, User

CATEGORIES = [
    ("Зарплата", Kind.income),
    ("Подработка", Kind.income),
    ("Продукты", Kind.expense),
    ("Транспорт", Kind.expense),
    ("Развлечения", Kind.expense),
    ("Связь и интернет", Kind.expense),
]

TRANSACTIONS = [
    (Kind.income, "60000", date(2026, 10, 1), "Зарплата", "Аванс"),
    (Kind.income, "8500", date(2026, 10, 3), "Подработка", "Заказ на вёрстку"),
    (Kind.expense, "3240", date(2026, 10, 2), "Продукты", "Продукты на неделю"),
    (Kind.expense, "2100", date(2026, 10, 4), "Транспорт", "Карта «Тройка»"),
    (Kind.expense, "1800", date(2026, 10, 5), "Развлечения", "Кино"),
    (Kind.expense, "650", date(2026, 10, 5), "Связь и интернет", "Мобильная связь"),
    (Kind.expense, "2780", date(2026, 10, 6), "Продукты", "Супермаркет"),
]

BUDGETS = [("Продукты", "15000"), ("Транспорт", "4000"), ("Развлечения", "3000"), ("Связь и интернет", "800")]


def seed() -> None:
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.email == "demo@example.com")):
            print("Демо-данные уже есть, пропускаю")
            return
        user = User(email="demo@example.com", name="Демо-пользователь")
        db.add(user)
        db.flush()
        by_name = {}
        for name, kind in CATEGORIES:
            by_name[name] = Category(user_id=user.id, name=name, kind=kind)
            db.add(by_name[name])
        db.flush()
        for kind, amount, day, cat, note in TRANSACTIONS:
            db.add(Transaction(user_id=user.id, category_id=by_name[cat].id, kind=kind, amount=Decimal(amount), date=day, note=note))
        for cat, limit in BUDGETS:
            db.add(Budget(user_id=user.id, category_id=by_name[cat].id, month=date(2026, 10, 1), amount_limit=Decimal(limit)))
        db.commit()
        print("Демо-данные добавлены")


if __name__ == "__main__":
    seed()
