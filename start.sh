#!/usr/bin/env bash
# Запуск всего проекта одной командой: ./start.sh  (остановка — Ctrl+C)
# Нужны: Node.js, uv, PostgreSQL и заполненный backend/.env (см. README).
set -e
cd "$(dirname "$0")"

if command -v brew >/dev/null 2>&1; then
  brew services start postgresql@16 >/dev/null 2>&1 || true
fi

[ -f backend/.env ] || { echo "Нет backend/.env: скопируйте backend/.env.example и заполните (см. README)"; exit 1; }

(cd backend && uv sync -q && uv run alembic upgrade head)
[ -d frontend/node_modules ] || (cd frontend && npm install)

trap 'kill 0' EXIT INT TERM
(cd backend && uv run uvicorn app.main:app --reload) &
(cd frontend && npm run dev) &

echo
echo "Сайт:       http://localhost:5173"
echo "API (docs): http://localhost:8000/docs"
wait
