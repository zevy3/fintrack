from fastapi import APIRouter, Query, Response, status

from app.deps import CurrentUser, DbSession
from app.schemas import BudgetCreate, BudgetOut, BudgetUpdate, MONTH_RE
from app.services import budgets as service

router = APIRouter(prefix="/budgets", tags=["Бюджеты"])


@router.get("", response_model=list[BudgetOut])
def list_budgets(db: DbSession, user: CurrentUser, month: str | None = Query(None, pattern=MONTH_RE.pattern)):
    return service.list_budgets(db, user.id, month)


@router.post("", response_model=BudgetOut, status_code=status.HTTP_201_CREATED)
def create_budget(data: BudgetCreate, db: DbSession, user: CurrentUser):
    return service.create_budget(db, user.id, data)


@router.patch("/{budget_id}", response_model=BudgetOut)
def update_budget(budget_id: int, data: BudgetUpdate, db: DbSession, user: CurrentUser):
    return service.update_budget(db, user.id, budget_id, data.limit)


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: int, db: DbSession, user: CurrentUser):
    service.delete_budget(db, user.id, budget_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
