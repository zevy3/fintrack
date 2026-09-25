from datetime import date

from app.services.errors import Unprocessable


def parse_month(value: str) -> date:
    """'2026-10' -> date(2026, 10, 1)."""
    try:
        year, month = value.split("-")
        return date(int(year), int(month), 1)
    except ValueError:
        raise Unprocessable("Месяц должен быть в формате YYYY-MM") from None


def month_bounds(month: date) -> tuple[date, date]:
    """Первый день месяца и первый день следующего."""
    nxt = date(month.year + (month.month == 12), month.month % 12 + 1, 1)
    return month, nxt
