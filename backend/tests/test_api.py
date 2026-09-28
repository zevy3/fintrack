def make_category(client, name="Продукты", kind="expense"):
    response = client.post("/api/categories", json={"name": name, "kind": kind})
    assert response.status_code == 201, response.text
    return response.json()


def make_transaction(client, category_id, kind="expense", amount=100, day="2026-10-05"):
    response = client.post(
        "/api/transactions",
        json={"kind": kind, "amount": amount, "date": day, "category_id": category_id, "note": "тест"},
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_category_crud_and_duplicate(client):
    category = make_category(client)
    assert client.get("/api/categories").json() == [category]
    assert client.post("/api/categories", json={"name": "Продукты", "kind": "expense"}).status_code == 409
    renamed = client.patch(f"/api/categories/{category['id']}", json={"name": "Еда"})
    assert renamed.json()["name"] == "Еда"
    assert client.delete(f"/api/categories/{category['id']}").status_code == 204
    assert client.get(f"/api/categories/{category['id']}").status_code == 404


def test_category_validation(client):
    assert client.post("/api/categories", json={"name": "   ", "kind": "expense"}).status_code == 422
    assert client.post("/api/categories", json={"name": "X", "kind": "other"}).status_code == 422


def test_cannot_delete_category_with_transactions(client):
    category = make_category(client)
    make_transaction(client, category["id"])
    assert client.delete(f"/api/categories/{category['id']}").status_code == 409


def test_transaction_crud(client):
    category = make_category(client)
    item = make_transaction(client, category["id"], amount=250.5)
    assert item["amount"] == 250.5
    updated = client.patch(f"/api/transactions/{item['id']}", json={"amount": 300})
    assert updated.json()["amount"] == 300
    page = client.get("/api/transactions").json()
    assert page["total"] == 1 and page["items"][0]["id"] == item["id"]
    assert client.delete(f"/api/transactions/{item['id']}").status_code == 204
    assert client.get(f"/api/transactions/{item['id']}").status_code == 404


def test_transaction_validation(client):
    category = make_category(client)
    base = {"kind": "expense", "date": "2026-10-05", "category_id": category["id"]}
    assert client.post("/api/transactions", json={**base, "amount": 0}).status_code == 422
    assert client.post("/api/transactions", json={**base, "amount": -5}).status_code == 422
    assert client.post("/api/transactions", json={**base, "amount": 1.234}).status_code == 422
    assert client.post("/api/transactions", json={**base, "amount": 10, "date": "не дата"}).status_code == 422
    assert client.post("/api/transactions", json={**base, "amount": 10, "category_id": 999}).status_code == 404
    # тип операции должен совпадать с типом категории
    assert client.post("/api/transactions", json={**base, "amount": 10, "kind": "income"}).status_code == 422


def test_transaction_filters(client):
    food = make_category(client)
    salary = make_category(client, "Зарплата", "income")
    make_transaction(client, food["id"], day="2026-09-30")
    make_transaction(client, food["id"], day="2026-10-02")
    make_transaction(client, salary["id"], kind="income", amount=1000, day="2026-10-03")
    assert client.get("/api/transactions?kind=income").json()["total"] == 1
    assert client.get(f"/api/transactions?category_id={food['id']}").json()["total"] == 2
    assert client.get("/api/transactions?date_from=2026-10-01&date_to=2026-10-31").json()["total"] == 2
    assert client.get("/api/transactions?limit=1").json()["items"].__len__() == 1


def test_budget_flow(client):
    food = make_category(client)
    salary = make_category(client, "Зарплата", "income")
    make_transaction(client, food["id"], amount=400, day="2026-10-02")
    make_transaction(client, food["id"], amount=900, day="2026-11-02")  # другой месяц
    created = client.post("/api/budgets", json={"category_id": food["id"], "month": "2026-10", "limit": 1000})
    assert created.status_code == 201
    body = created.json()
    assert body["spent"] == 400 and body["limit"] == 1000 and body["month"] == "2026-10"
    assert client.post("/api/budgets", json={"category_id": food["id"], "month": "2026-10", "limit": 5}).status_code == 409
    assert client.post("/api/budgets", json={"category_id": salary["id"], "month": "2026-10", "limit": 5}).status_code == 422
    assert client.post("/api/budgets", json={"category_id": food["id"], "month": "2026-13", "limit": 5}).status_code == 422
    assert client.patch(f"/api/budgets/{body['id']}", json={"limit": 2000}).json()["limit"] == 2000
    assert len(client.get("/api/budgets?month=2026-10").json()) == 1
    assert client.get("/api/budgets?month=2026-11").json() == []
    assert client.delete(f"/api/budgets/{body['id']}").status_code == 204


def test_report_summary_and_export(client):
    food = make_category(client)
    salary = make_category(client, "Зарплата", "income")
    make_transaction(client, salary["id"], kind="income", amount=1000)
    make_transaction(client, food["id"], amount=300)
    summary = client.get("/api/reports/summary?month=2026-10").json()
    assert summary["income"] == 1000 and summary["expense"] == 300 and summary["balance"] == 700
    assert len(summary["by_category"]) == 2
    assert client.get("/api/reports/summary?month=bad").status_code == 422
    export = client.get("/api/reports/export?month=2026-10")
    assert export.status_code == 200
    assert "attachment" in export.headers["content-disposition"]
    assert "Продукты" in export.text and "300.00" in export.text
