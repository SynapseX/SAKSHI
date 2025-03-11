@echo off
:: Start the backend FastAPI server in the background
start cmd /k "cd backend && uvicorn api.main:app --host 0.0.0.0 --port 8000"

:: Start the frontend React development server in the background
start cmd /k "cd frontend && npm start"

:: Keep the batch file open (to avoid closing immediately)
pause
