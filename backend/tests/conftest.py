import os

# Тесты работают на отдельной БД; переменная должна быть задана до импорта приложения.
os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL", "postgresql+psycopg://finance:finance_dev@localhost:5432/finance_test"
)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import User  # noqa: E402


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        db.add(User(email="demo@example.com", name="Демо"))
        db.commit()
    yield


@pytest.fixture
def client():
    return TestClient(app)
