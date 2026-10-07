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
| Вход | `/login` | Аутентификация (ЛР4) |
| Регистрация | `/register` | Создание аккаунта (ЛР4) |
| 404 | любой другой | Страница не найдена |

Скриншоты экранов лежат в [`docs/screenshots`](docs/screenshots).

### История изменений интерфейса

- **ЛР3:** страницы переведены с демо-данных на асинхронную загрузку; добавлены формы с валидацией, фильтры и постраничный вывод операций, выбор месяца, уведомления; скриншоты `01–05` обновлены.
- **ЛР4:** добавлены экраны входа и регистрации, в шапке — имя пользователя и «Выйти».
- **ЛР5:** демо-данные заменены ответами backend; в ЛР1 планировавшаяся кнопка экспорта CSV (была неактивной) теперь скачивает файл. Скриншоты `30–41` сняты на реальных данных.

## Архитектура frontend (ЛР3)

Код организован по упрощённой Feature-Sliced Design: слои `app → pages → features → entities → shared`,
каждый слой импортирует только нижележащие.

```
frontend/src/
  app/        провайдеры (React Query, тема, уведомления, роутер), маршруты, layout, тема MUI
  pages/      страницы: dashboard, transactions, categories, budgets, reports, not-found
  features/   пользовательские действия: transaction-form, transaction-delete, category-manage,
              budget-manage, report-export
  entities/   предметные сущности: transaction, category, budget, report
              (model/types, model/queries, api, ui)
  shared/     api (HTTP-клиент, токены, ошибки), config, lib (форматирование, скачивание), ui (общие компоненты)
```

- **Типизация.** Все данные описаны TypeScript-типами в `entities/*/model/types.ts`; форма типов совпадает с ответами backend.
- **Состояние.** Серверные данные — TanStack Query (кэш, перезагрузка после изменений); формы — React Hook Form.
- **Клиентская валидация.** Схемы [zod](https://zod.dev) в формах операции, категории и бюджета: обязательные поля,
  положительная сумма не более чем с двумя знаками после запятой, длина комментария; серверные ошибки показываются в форме.
- **Состояния данных.** Компонент `shared/ui/LoadState` единообразно показывает загрузку, ошибку (с кнопкой «Повторить»),
  пустой список и данные.
- **Анимации.** Плавное появление страниц (`Fade`), карточек (`Grow`), анимация индикаторов бюджета и полос отчёта.
- **Уведомления.** Snackbar об успешных и неудачных действиях.

Скриншоты ЛР3 (сняты на mock-данных до подключения backend): `01–05` — основные экраны, `10-loading`, `11-form-validation`, `12-after-add`, `13-error`, `14-empty`, `15-404`, `16-mobile`.

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
DEMO_PASSWORD='ваш-пароль1' uv run python -m app.seed   # демо-пользователь demo@example.com и данные (по желанию)

# 4. Сервер
uv run uvicorn app.main:app --reload     # http://localhost:8000, документация: /docs
```

### Конфигурация

| Переменная | Описание | Пример |
|---|---|---|
| `DATABASE_URL` | строка подключения SQLAlchemy | `postgresql+psycopg://USER:PASSWORD@localhost:5432/finance_tracker` |
| `CORS_ORIGINS` | разрешённые источники frontend (JSON-список) | `["http://localhost:5173"]` |
| `SECRET_KEY` | секрет подписи JWT, обязателен | `openssl rand -hex 32` |
| `ACCESS_TOKEN_MINUTES` | срок жизни access-токена | `15` |
| `REFRESH_TOKEN_DAYS` | срок жизни refresh-токена | `7` |

Файл `.env` не хранится в репозитории; образец — `backend/.env.example`.

### API

Интерактивная документация — `http://localhost:8000/docs` (скриншот: `docs/screenshots/06-api-docs.png`).

| Метод и путь | Назначение |
|---|---|
| `POST /api/auth/register`, `/login`, `/refresh`, `/logout`, `GET /api/auth/me` | аутентификация (см. раздел «Аутентификация») |
| `GET /api/admin/users` | список пользователей, только роль `admin` |
| `GET/POST /api/categories`, `GET/PATCH/DELETE /api/categories/{id}` | категории |
| `GET/POST /api/transactions`, `GET/PATCH/DELETE /api/transactions/{id}` | операции; фильтры `kind`, `category_id`, `date_from`, `date_to`, `limit`, `offset` |
| `GET/POST /api/budgets?month=YYYY-MM`, `PATCH/DELETE /api/budgets/{id}` | бюджеты с расчётом потраченной суммы |
| `GET /api/reports/summary?month=YYYY-MM` | доходы, расходы, баланс и суммы по категориям |
| `GET /api/reports/export?month=YYYY-MM` | выгрузка операций за месяц в CSV |
| `GET /api/health` | проверка работоспособности |

Все маршруты, кроме `/api/health`, `/api/auth/register|login|refresh|logout`, требуют заголовок `Authorization: Bearer <access>`.

Коды ошибок: `401` — нет или недействительный токен, `403` — недостаточно прав, `404` — запись не найдена, `409` — конфликт (дубликат, категория занята), `422` — ошибка валидации.

### Проверка

```bash
createdb -O finance finance_test         # тестовая БД (один раз)
uv run pytest
```

Тесты создают таблицы в `finance_test` (строка подключения — `TEST_DATABASE_URL`), проверяют CRUD, валидацию,
фильтры, бюджеты, отчёт и экспорт.

## Аутентификация и авторизация (ЛР4)

**Backend** (`app/core/security.py`, `app/services/auth.py`, `app/routers/auth.py`, `app/deps.py`):

- **Пароли** хешируются Argon2id (`argon2-cffi`) с солью; в БД хранится только хеш. При входе хеш при необходимости обновляется под актуальные параметры.
  Политика: от 8 символов, обязательны буквы и цифры. Ответы не раскрывают, существует ли e-mail.
- **Access-токен** — JWT (HS256), живёт `ACCESS_TOKEN_MINUTES` (15 мин), передаётся в `Authorization: Bearer`.
- **Refresh-токен** — JWT со сроком `REFRESH_TOKEN_DAYS` (7 дней); идентификатор (`jti`) хранится в таблице `refresh_tokens`.
  Тип токена проверяется: refresh нельзя использовать как access и наоборот.
- **Обновление** `POST /auth/refresh`: токен проверяется (подпись, срок, тип, наличие в БД, не отозван); старый токен отзывается, выдаётся новая пара
  (ротация). Неверный, истёкший или отозванный токен → `401`. Повторное предъявление уже использованного токена
  считается компрометацией — отзываются все refresh-токены пользователя.
- **Выход** `POST /auth/logout` отзывает переданный refresh-токен (повторный выход безопасен).
- **Защита маршрутов:** зависимость `get_current_user` (все данные и отчёты); **проверка прав:** данные всегда выбираются с фильтром по владельцу
  (чужая запись → `404`), административный маршрут `/api/admin/users` требует роль `admin` (`403` для обычных пользователей).

**Frontend** (`entities/user`, `features/auth`, `pages/login`, `pages/register`, `app/guards`, `shared/api/http.ts`):

- Формы входа и регистрации с клиентской валидацией (e-mail, длина и состав пароля, совпадение паролей), ошибки сервера выводятся в форме.
- Токены хранятся в `localStorage`; HTTP-клиент добавляет `Authorization` и при ответе `401` один раз обновляет пару по refresh-токену и повторяет запрос.
  Если обновить не удалось — токены удаляются, кэш данных очищается, пользователь попадает на `/login`.
- `RequireAuth` не пускает гостей к страницам приложения (после входа возвращает на запрошенную страницу), `PublicOnly` не показывает вход уже вошедшим.
- Выход вызывает `/auth/logout` (отзыв refresh), очищает токены и кэш запросов и ведёт на `/login`.

Скриншоты: `20–24` в `docs/screenshots`.

Проверка: `uv run pytest` (в т. ч. `tests/test_auth.py`: хеширование, сроки токенов, истёкший/подделанный/отозванный токен, ротация и повторное использование,
изоляция данных, роли).

## Интеграция frontend и backend (ЛР5)

Демонстрационные данные удалены, все экраны работают через REST API (`entities/*/api`, общий клиент `shared/api/http.ts`).
В dev-режиме Vite проксирует `/api` на `http://localhost:8000` (`frontend/vite.config.ts`), поэтому CORS настраивать не нужно;
для другого адреса задайте `VITE_API_URL` (см. `frontend/.env.example`).

| Экран | Запросы |
|---|---|
| Обзор | `GET /reports/summary`, `GET /transactions?limit=5`, `GET /categories` |
| Операции | `GET/POST/PATCH/DELETE /transactions` (фильтры и постраничный вывод — параметры запроса), `GET /categories` |
| Категории | `GET/POST/DELETE /categories` |
| Бюджеты | `GET/POST/PATCH/DELETE /budgets?month=` |
| Отчёты | `GET /reports/summary`, `GET /reports/export` (CSV скачивается как файл) |
| Вход / регистрация | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me` |

Форматы запросов и ответов едины: поля в `snake_case`, суммы — числа, даты — `YYYY-MM-DD`, месяцы — `YYYY-MM`; типы TypeScript
(`entities/*/model/types.ts`) соответствуют схемам Pydantic (`backend/app/schemas.py`). Ошибки сервера (`detail`, в том числе список ошибок валидации)
разбираются в `http.ts` и показываются в формах, уведомлениях и блоках загрузки; обрыв связи даёт сообщение «Нет связи с сервером».
Состояния «загрузка / ошибка / пусто» работают на реальных запросах (`shared/ui/LoadState`).

Скриншоты на реальных данных: `30–41` в `docs/screenshots`.

## Полный запуск проекта

Требуются Node.js 22+, Python 3.12+, [uv](https://docs.astral.sh/uv/), PostgreSQL 14+.

```bash
# 1. База данных (один раз)
createuser --pwprompt finance
createdb -O finance finance_tracker

# 2. Backend (терминал 1)
cd backend
cp .env.example .env                     # заполнить DATABASE_URL и SECRET_KEY (openssl rand -hex 32)
uv run alembic upgrade head
DEMO_PASSWORD='ваш-пароль1' uv run python -m app.seed
uv run uvicorn app.main:app --reload     # http://localhost:8000/docs

# 3. Frontend (терминал 2)
cd frontend
npm install
npm run dev                              # http://localhost:5173
```

Откройте http://localhost:5173 и войдите как `demo@example.com` (пароль — значение `DEMO_PASSWORD`) либо зарегистрируйте нового пользователя.
Демо-операции относятся к октябрю 2026 — выберите этот месяц в селекторе месяца.

### Проверка

```bash
cd backend && uv run pytest              # 28 автотестов API
cd frontend && npm run lint && npm run build
```

Ручной сценарий проверки (выполнен при сдаче ЛР5): регистрация → создание категорий → добавление 12 операций (постраничный вывод, фильтры) →
редактирование и удаление операции → попытка удалить категорию с операциями (ошибка 409 в интерфейсе) → бюджет и превышение лимита →
отчёт и скачивание CSV → выход → повторный вход → недоступность чужих данных и защищённых страниц без токена.
