import re
import datetime as dt
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, PlainSerializer, field_validator

from app.models import Kind, Role

# Деньги хранятся как Decimal, а в JSON отдаются числом.
Money = Annotated[Decimal, PlainSerializer(float, return_type=float, when_used="json")]
PositiveMoney = Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=2)]

MONTH_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- категории ---
class CategoryCreate(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=100)]
    kind: Kind

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Название не может быть пустым")
        return value


class CategoryUpdate(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=100)] | None = None


class CategoryOut(ORMModel):
    id: int
    name: str
    kind: Kind


# --- операции ---
class TransactionCreate(BaseModel):
    kind: Kind
    amount: PositiveMoney
    date: dt.date
    category_id: int
    note: Annotated[str, Field(max_length=255)] = ""


class TransactionUpdate(BaseModel):
    kind: Kind | None = None
    amount: PositiveMoney | None = None
    date: dt.date | None = None
    category_id: int | None = None
    note: Annotated[str, Field(max_length=255)] | None = None


class TransactionOut(ORMModel):
    id: int
    kind: Kind
    amount: Money
    date: dt.date
    category_id: int
    note: str


class TransactionPage(BaseModel):
    items: list[TransactionOut]
    total: int


# --- бюджеты ---
class BudgetCreate(BaseModel):
    category_id: int
    month: str = Field(description="Месяц в формате YYYY-MM")
    limit: PositiveMoney

    @field_validator("month")
    @classmethod
    def check_month(cls, value: str) -> str:
        if not MONTH_RE.match(value):
            raise ValueError("Месяц должен быть в формате YYYY-MM")
        return value


class BudgetUpdate(BaseModel):
    limit: PositiveMoney


class BudgetOut(BaseModel):
    id: int
    category_id: int
    month: str
    limit: Money
    spent: Money


# --- отчёты ---
class CategoryTotal(BaseModel):
    category_id: int
    category_name: str
    kind: Kind
    total: Money


class MonthSummary(BaseModel):
    month: str
    income: Money
    expense: Money
    balance: Money
    by_category: list[CategoryTotal]


# --- пользователи и аутентификация ---
class UserOut(ORMModel):
    id: int
    email: str
    name: str
    role: Role


class RegisterRequest(BaseModel):
    email: EmailStr
    name: Annotated[str, Field(min_length=1, max_length=100)]
    password: Annotated[str, Field(min_length=8, max_length=128)]

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Имя не может быть пустым")
        return value

    @field_validator("password")
    @classmethod
    def check_password(cls, value: str) -> str:
        if not any(ch.isalpha() for ch in value) or not any(ch.isdigit() for ch in value):
            raise ValueError("Пароль должен содержать буквы и цифры")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Срок жизни access-токена, секунд")
