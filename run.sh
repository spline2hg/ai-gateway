#!/bin/bash

# Backend
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Frontend
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
