import os

from dotenv import dotenv_values

# Тесты работают на отдельной БД; переменные должны быть заданы до импорта приложения.
# TEST_DATABASE_URL, иначе — DATABASE_URL из .env с именем базы finance_test.
_url = os.environ.get("TEST_DATABASE_URL") or dotenv_values(".env").get("DATABASE_URL")
if not _url:
    raise RuntimeError("Задайте TEST_DATABASE_URL или DATABASE_URL в backend/.env")
if not os.environ.get("TEST_DATABASE_URL"):
    _url = _url.rsplit("/", 1)[0] + "/finance_test"
os.environ["DATABASE_URL"] = _url
os.environ["SECRET_KEY"] = "test-secret-key-for-pytest-only-0123456789abcdef"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.core.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402

PASSWORD = "Passw0rd123"


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield


def register_and_login(email: str = "user@example.com", name: str = "Тестовый") -> dict:
    """Регистрирует пользователя и возвращает ответ /auth/login (пару токенов)."""
    anon = TestClient(app)
    assert anon.post("/api/auth/register", json={"email": email, "name": name, "password": PASSWORD}).status_code == 201
    response = anon.post("/api/auth/login", json={"email": email, "password": PASSWORD})
    assert response.status_code == 200, response.text
    return response.json()


@pytest.fixture
def anon():
    """Клиент без авторизации."""
    return TestClient(app)


@pytest.fixture
def client():
    """Клиент, авторизованный как первый пользователь."""
    tokens = register_and_login()
    c = TestClient(app)
    c.headers["Authorization"] = f"Bearer {tokens['access_token']}"
    return c


@pytest.fixture
def other_client():
    """Клиент второго пользователя (для проверки изоляции данных)."""
    tokens = register_and_login("other@example.com", "Другой")
    c = TestClient(app)
    c.headers["Authorization"] = f"Bearer {tokens['access_token']}"
    return c
