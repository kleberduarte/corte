@echo off
:: CORTE — Desenvolvimento: API (3333) + frontend (5173)
:: Abre duas janelas. Feche com Ctrl+C em cada uma.

cd /d "%~dp0"

if not exist ".env" (
  echo Criando .env na raiz a partir de .env.example...
  copy /Y .env.example .env >nul
)

if not exist "backend\.env" (
  echo Criando backend\.env a partir de backend\.env.example...
  copy /Y backend\.env.example backend\.env >nul
  echo.
  echo ATENCAO: edite backend\.env e configure DATABASE_URL antes de usar o admin.
  echo.
)

echo Iniciando API em http://localhost:3333 ...
start "CORTE API" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Iniciando frontend em http://localhost:5173 ...
start "CORTE Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Admin:  http://localhost:5173/?view=admin
echo Login:  admin@corte.com.br / corte@admin123  (apos npm run db:seed no backend)
echo.
