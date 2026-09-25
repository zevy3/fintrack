from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.routers import budgets, categories, reports, transactions
from app.services.errors import ServiceError

app = FastAPI(title="Личный финучёт API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ServiceError)
def handle_service_error(_: Request, exc: ServiceError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.get("/api/health", tags=["Служебное"])
def health() -> dict[str, str]:
    return {"status": "ok"}


for module in (categories, transactions, budgets, reports):
    app.include_router(module.router, prefix="/api")
