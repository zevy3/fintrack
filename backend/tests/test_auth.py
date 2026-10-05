from datetime import UTC, datetime, timedelta

import jwt
from sqlalchemy import select, update

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import create_token, hash_password, verify_password
from app.models import RefreshToken, Role, User
from tests.conftest import PASSWORD, register_and_login


def test_password_is_hashed_with_argon2(anon):
    register_and_login()
    with SessionLocal() as db:
        user = db.scalar(select(User))
        assert user.password_hash.startswith("$argon2id$")
        assert PASSWORD not in user.password_hash
    assert verify_password(PASSWORD, hash_password(PASSWORD))
    assert not verify_password("wrong", hash_password(PASSWORD))


def test_register_validation(anon):
    ok = {"email": "a@example.com", "name": "A", "password": PASSWORD}
    assert anon.post("/api/auth/register", json={**ok, "password": "short1"}).status_code == 422
    assert anon.post("/api/auth/register", json={**ok, "password": "onlyletters"}).status_code == 422
    assert anon.post("/api/auth/register", json={**ok, "password": "12345678"}).status_code == 422
    assert anon.post("/api/auth/register", json={**ok, "email": "not-an-email"}).status_code == 422
    assert anon.post("/api/auth/register", json={**ok, "name": "  "}).status_code == 422
    assert anon.post("/api/auth/register", json=ok).status_code == 201


def test_register_duplicate_email_case_insensitive(anon):
    body = {"email": "dup@example.com", "name": "A", "password": PASSWORD}
    assert anon.post("/api/auth/register", json=body).status_code == 201
    assert anon.post("/api/auth/register", json={**body, "email": "DUP@example.com"}).status_code == 409


def test_register_response_has_no_secrets(anon):
    body = anon.post("/api/auth/register", json={"email": "x@example.com", "name": "X", "password": PASSWORD}).json()
    assert set(body) == {"id", "email", "name", "role"} and body["role"] == "user"


def test_login_wrong_credentials(anon):
    register_and_login()
    assert anon.post("/api/auth/login", json={"email": "user@example.com", "password": "Wrong12345"}).status_code == 401
    assert anon.post("/api/auth/login", json={"email": "nobody@example.com", "password": PASSWORD}).status_code == 401


def test_tokens_have_expected_lifetimes():
    tokens = register_and_login()
    access = jwt.decode(tokens["access_token"], settings.secret_key, algorithms=["HS256"])
    refresh = jwt.decode(tokens["refresh_token"], settings.secret_key, algorithms=["HS256"])
    assert access["type"] == "access" and refresh["type"] == "refresh"
    assert access["exp"] - access["iat"] == settings.access_token_minutes * 60
    assert refresh["exp"] - refresh["iat"] == settings.refresh_token_days * 86400
    assert tokens["expires_in"] == settings.access_token_minutes * 60


def test_protected_routes_require_token(anon):
    for path in ("/api/auth/me", "/api/categories", "/api/transactions", "/api/budgets", "/api/reports/summary?month=2026-10"):
        assert anon.get(path).status_code == 401, path
    assert anon.get("/api/categories", headers={"Authorization": "Bearer garbage"}).status_code == 401


def test_me(client):
    me = client.get("/api/auth/me").json()
    assert me["email"] == "user@example.com"


def test_refresh_token_cannot_be_used_as_access(anon):
    tokens = register_and_login()
    r = anon.get("/api/auth/me", headers={"Authorization": f"Bearer {tokens['refresh_token']}"})
    assert r.status_code == 401


def test_access_token_cannot_be_used_for_refresh(anon):
    tokens = register_and_login()
    assert anon.post("/api/auth/refresh", json={"refresh_token": tokens["access_token"]}).status_code == 401


def test_expired_access_token_rejected(anon):
    register_and_login()
    token, _ = create_token(1, "access", now=datetime.now(UTC) - timedelta(hours=1))
    r = anon.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401 and "истёк" in r.json()["detail"]


def test_token_with_wrong_signature_rejected(anon):
    register_and_login()
    forged = jwt.encode({"sub": "1", "type": "access", "jti": "x", "exp": 9999999999}, "other-secret-other-secret-other-1234", algorithm="HS256")
    assert anon.get("/api/auth/me", headers={"Authorization": f"Bearer {forged}"}).status_code == 401


def test_refresh_rotation(anon):
    tokens = register_and_login()
    new = anon.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert new.status_code == 200
    new_tokens = new.json()
    assert new_tokens["refresh_token"] != tokens["refresh_token"]
    r = anon.get("/api/auth/me", headers={"Authorization": f"Bearer {new_tokens['access_token']}"})
    assert r.status_code == 200


def test_reused_refresh_token_revokes_all(anon):
    tokens = register_and_login()
    new = anon.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]}).json()
    # повторное использование старого токена — отказ и отзыв всех токенов пользователя
    assert anon.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]}).status_code == 401
    assert anon.post("/api/auth/refresh", json={"refresh_token": new["refresh_token"]}).status_code == 401


def test_expired_refresh_token_rejected(anon):
    register_and_login()
    token, expires = create_token(1, "refresh", now=datetime.now(UTC) - timedelta(days=30))
    assert anon.post("/api/auth/refresh", json={"refresh_token": token}).status_code == 401


def test_unknown_refresh_token_rejected(anon):
    register_and_login()
    token, _ = create_token(1, "refresh")  # корректная подпись, но не выдан сервером
    assert anon.post("/api/auth/refresh", json={"refresh_token": token}).status_code == 401
    assert anon.post("/api/auth/refresh", json={"refresh_token": "garbage"}).status_code == 401


def test_logout_revokes_refresh_token(anon):
    tokens = register_and_login()
    assert anon.post("/api/auth/logout", json={"refresh_token": tokens["refresh_token"]}).status_code == 204
    assert anon.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]}).status_code == 401
    with SessionLocal() as db:
        assert db.scalar(select(RefreshToken)).revoked_at is not None
    # повторный и «мусорный» выход не падают
    assert anon.post("/api/auth/logout", json={"refresh_token": tokens["refresh_token"]}).status_code == 204
    assert anon.post("/api/auth/logout", json={"refresh_token": "garbage"}).status_code == 204


def test_users_data_is_isolated(client, other_client):
    category = client.post("/api/categories", json={"name": "Продукты", "kind": "expense"}).json()
    item = client.post(
        "/api/transactions",
        json={"kind": "expense", "amount": 10, "date": "2026-10-05", "category_id": category["id"]},
    ).json()
    assert other_client.get("/api/categories").json() == []
    assert other_client.get(f"/api/categories/{category['id']}").status_code == 404
    assert other_client.get(f"/api/transactions/{item['id']}").status_code == 404
    assert other_client.delete(f"/api/transactions/{item['id']}").status_code == 404
    assert other_client.patch(f"/api/categories/{category['id']}", json={"name": "Взлом"}).status_code == 404
    # чужую категорию нельзя использовать в своей операции
    r = other_client.post(
        "/api/transactions",
        json={"kind": "expense", "amount": 10, "date": "2026-10-05", "category_id": category["id"]},
    )
    assert r.status_code == 404


def test_admin_endpoint_requires_admin_role(client):
    assert client.get("/api/admin/users").status_code == 403
    with SessionLocal() as db:
        db.execute(update(User).where(User.email == "user@example.com").values(role=Role.admin))
        db.commit()
    r = client.get("/api/admin/users")
    assert r.status_code == 200 and r.json()[0]["email"] == "user@example.com"
    assert "password_hash" not in r.json()[0]
