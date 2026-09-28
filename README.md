# Личный финучёт

Учебный full-stack проект (курс «Full-stack», МТУСИ, БПИ2401): учёт личных доходов и расходов,
категории, месячные бюджеты, отчёты и экспорт в CSV.

**Стек:** Python + FastAPI, PostgreSQL + SQLAlchemy, React + TypeScript (Vite, MUI), Git.

## Назначение и сценарии

Приложение помогает вести личный бюджет. Основные пользовательские сценарии:

1. **Обзор** — посмотреть доходы, расходы и баланс за месяц, последние операции.
2. **Операции** — просмотреть список, добавить доход или расход (сумма, дата, категория, комментарий), удалить операцию.
3. **Категории** — посмотреть категории доходов и расходов (в дальнейшем — создавать и редактировать).
4. **Бюджеты** — задать месячный лимит на категорию расходов и следить за его расходованием.
5. **Отчёты** — увидеть расходы по категориям и выгрузить данные в CSV.

## Экраны

| Экран | Маршрут | Назначение |
|---|---|---|
| Обзор | `/` | Сводка и последние операции |
| Операции | `/transactions` | Таблица операций, форма добавления |
| Категории | `/categories` | Категории доходов и расходов |
| Бюджеты | `/budgets` | Лимиты и прогресс по категориям |
| Отчёты | `/reports` | Расходы по категориям, экспорт |
| 404 | любой другой | Страница не найдена |

Скриншоты экранов лежат в [`docs/screenshots`](docs/screenshots).

## Запуск frontend (ЛР1)

Требуется Node.js 22+.

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # проверка типов и production-сборка
```

На этапе ЛР1 данные демонстрационные (`frontend/src/data/demo.ts`), backend не требуется.

## Структура frontend (ЛР1)

```
frontend/src/
  components/   Layout (шапка, меню), PageHeader, StatCard
  pages/        по одной странице на экран
  data/         демонстрационные данные
  utils/        форматирование денег и дат
  types.ts      типы предметной области
```

UI-библиотека — [MUI](https://mui.com): единая тема (`src/theme.ts`), адаптивное меню (постоянное на ширине от 900 px, выдвижное на узких экранах).

## Backend (ЛР2)

FastAPI + SQLAlchemy 2 + PostgreSQL, миграции Alembic. Менеджер пакетов — `uv`.

### Структура

```
backend/
  app/
    main.py            создание приложения, CORS, обработка ошибок, подключение роутеров
    core/config.py     настройки из переменных окружения / .env (pydantic-settings)
    core/database.py   engine, сессия, Base, зависимость get_db
    models.py          модели SQLAlchemy
    schemas.py         схемы валидации Pydantic
    deps.py            зависимости (сессия БД, текущий пользователь)
    routers/           HTTP-слой: categories, transactions, budgets, reports
    services/          бизнес-логика и работа с БД; ошибки — services/errors.py
    seed.py            демонстрационные данные
  migrations/          миграции Alembic
  tests/               автотесты API (pytest)
```

### Модель данных

```
users 1──* categories 1──* transactions
  │            │
  │            └──* budgets
  └──* transactions, budgets (владелец записи)
```

| Таблица | Поля | Ограничения |
|---|---|---|
| `users` | `id` PK, `email` (уникальный), `name`, `created_at` | |
| `categories` | `id` PK, `user_id` FK→users, `name`, `kind` (`income`/`expense`) | уникальны `(user_id, name, kind)` |
| `transactions` | `id` PK, `user_id` FK→users, `category_id` FK→categories, `kind`, `amount` NUMERIC(12,2), `date`, `note` | `amount > 0`; FK на категорию `RESTRICT` |
| `budgets` | `id` PK, `user_id` FK→users, `category_id` FK→categories, `month` (1-е число месяца), `amount_limit` NUMERIC(12,2) | `amount_limit > 0`; уникальны `(user_id, category_id, month)` |

Правила бизнес-логики: тип операции должен совпадать с типом категории; бюджет задаётся только для категории расходов;
категорию с операциями удалить нельзя (409); чужие записи недоступны (404).

### Запуск

Нужны PostgreSQL 14+ и [uv](https://docs.astral.sh/uv/).

```bash
# 1. База данных (один раз)
createuser --pwprompt finance            # задайте свой пароль
createdb -O finance finance_tracker

# 2. Окружение
cd backend
cp .env.example .env                     # впишите в DATABASE_URL своего пользователя и пароль

# 3. Таблицы и демо-данные
uv run alembic upgrade head              # создание таблиц
uv run python -m app.seed                # демонстрационные данные (по желанию)

# 4. Сервер
uv run uvicorn app.main:app --reload     # http://localhost:8000, документация: /docs
```

### Конфигурация

| Переменная | Описание | Пример |
|---|---|---|
| `DATABASE_URL` | строка подключения SQLAlchemy | `postgresql+psycopg://USER:PASSWORD@localhost:5432/finance_tracker` |
| `CORS_ORIGINS` | разрешённые источники frontend (JSON-список) | `["http://localhost:5173"]` |

Файл `.env` не хранится в репозитории; образец — `backend/.env.example`.

### API

Интерактивная документация — `http://localhost:8000/docs` (скриншот: `docs/screenshots/06-api-docs.png`).

| Метод и путь | Назначение |
|---|---|
| `GET/POST /api/categories`, `GET/PATCH/DELETE /api/categories/{id}` | категории |
| `GET/POST /api/transactions`, `GET/PATCH/DELETE /api/transactions/{id}` | операции; фильтры `kind`, `category_id`, `date_from`, `date_to`, `limit`, `offset` |
| `GET/POST /api/budgets?month=YYYY-MM`, `PATCH/DELETE /api/budgets/{id}` | бюджеты с расчётом потраченной суммы |
| `GET /api/reports/summary?month=YYYY-MM` | доходы, расходы, баланс и суммы по категориям |
| `GET /api/reports/export?month=YYYY-MM` | выгрузка операций за месяц в CSV |
| `GET /api/health` | проверка работоспособности |

Коды ошибок: `404` — запись не найдена, `409` — конфликт (дубликат, категория занята), `422` — ошибка валидации.

### Проверка

```bash
createdb -O finance finance_test         # тестовая БД (один раз)
uv run pytest
```

Тесты создают таблицы в `finance_test` (строка подключения — `TEST_DATABASE_URL`), проверяют CRUD, валидацию,
фильтры, бюджеты, отчёт и экспорт.
