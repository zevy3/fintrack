from fastapi import APIRouter, Query, Response

from app.deps import CurrentUser, DbSession
from app.schemas import MONTH_RE, MonthSummary
from app.services import reports as service

router = APIRouter(prefix="/reports", tags=["Отчёты"])


@router.get("/summary", response_model=MonthSummary)
def summary(db: DbSession, user: CurrentUser, month: str = Query(pattern=MONTH_RE.pattern)):
    return service.month_summary(db, user.id, month)


@router.get("/export")
def export(db: DbSession, user: CurrentUser, month: str = Query(pattern=MONTH_RE.pattern)):
    content = service.export_csv(db, user.id, month)
    return Response(
        content="﻿" + content,  # BOM, чтобы Excel корректно открыл кириллицу
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="transactions-{month}.csv"'},
    )
