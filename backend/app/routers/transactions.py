from datetime import date

from fastapi import APIRouter, Query, Response, status

from app.deps import CurrentUser, DbSession
from app.models import Kind
from app.schemas import TransactionCreate, TransactionOut, TransactionPage, TransactionUpdate
from app.services import transactions as service

router = APIRouter(prefix="/transactions", tags=["Операции"])


@router.get("", response_model=TransactionPage)
def list_transactions(
    db: DbSession,
    user: CurrentUser,
    kind: Kind | None = None,
    category_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    items, total = service.list_transactions(
        db,
        user.id,
        kind=kind,
        category_id=category_id,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )
    return TransactionPage(items=items, total=total)  # type: ignore[arg-type]


@router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(data: TransactionCreate, db: DbSession, user: CurrentUser):
    return service.create_transaction(db, user.id, data)


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(transaction_id: int, db: DbSession, user: CurrentUser):
    return service.get_transaction(db, user.id, transaction_id)


@router.patch("/{transaction_id}", response_model=TransactionOut)
def update_transaction(transaction_id: int, data: TransactionUpdate, db: DbSession, user: CurrentUser):
    return service.update_transaction(db, user.id, transaction_id, data)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: DbSession, user: CurrentUser):
    service.delete_transaction(db, user.id, transaction_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
