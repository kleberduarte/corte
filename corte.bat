@echo off
cd /d "%~dp0"
title CORTE — Sistema

:: ═══════════════════════════════════════════════════════════════════
::  Configuracao do totem (edite por maquina/loja)
:: ═══════════════════════════════════════════════════════════════════
set "FRONTEND_URL=https://corte.vercel.app"
set "STORE_SLUG=corte"

:: ═══════════════════════════════════════════════════════════════════
::  Menu principal
:: ═══════════════════════════════════════════════════════════════════
:menu
cls
echo.
echo   ╔══════════════════════════════════════╗
echo   ║        CORTE — Acougue Inteligente   ║
echo   ╚══════════════════════════════════════╝
echo.
echo   [1] Desenvolvimento   (API + Vite dev, porta 5173)
echo   [2] Totem Cliente     (%FRONTEND_URL% + Chrome quiosque)
echo   [3] Totem Operador    (%FRONTEND_URL% + Chrome quiosque operador)
echo   [0] Sair
echo.
set /p MODO="   Escolha: "

if "%MODO%"=="1" goto dev
if "%MODO%"=="2" goto totem_cliente
if "%MODO%"=="3" goto totem_operador
if "%MODO%"=="0" exit /b
goto menu

:: ═══════════════════════════════════════════════════════════════════
::  Configuracao comum
:: ═══════════════════════════════════════════════════════════════════
:setup
echo.
docker ps -a --filter name=cortes-app-postgres --format "{{.Names}}" 2>nul | findstr /i "cortes-app-postgres" >nul
if %errorlevel% NEQ 0 (
  echo [setup] Criando container PostgreSQL...
  docker run -d --name cortes-app-postgres -e POSTGRES_USER=cortes -e POSTGRES_PASSWORD=cortes123 -e POSTGRES_DB=cortes_app -p 5435:5432 postgres:16 >nul 2>&1
  if errorlevel 1 (
    echo ERRO: Nao foi possivel criar cortes-app-postgres. Verifique se o Docker Desktop esta rodando.
    pause & exit /b 1
  )
) else (
  echo [setup] Iniciando PostgreSQL...
  docker start cortes-app-postgres >nul 2>&1
)
call :aguarda_postgres
if not exist ".env"         copy /Y .env.example .env >nul
if not exist "backend\.env" copy /Y backend\.env.example backend\.env >nul
goto :eof

:: ═══════════════════════════════════════════════════════════════════
::  [1] Desenvolvimento
:: ═══════════════════════════════════════════════════════════════════
:dev
call :setup
call :instalar_print_server
call :localiza_chrome
echo [print-server] Iniciando servidor de impressao em http://localhost:3334 (PDFs em print-server\receipts) ...
start /min "CORTE Print" cmd /k "cd /d %~dp0print-server & set SAVE_PDF_DIR=%~dp0print-server\receipts & node server.mjs"
call :aguarda_print_server
echo [dev] Iniciando API em http://localhost:3333 ...
start /min "CORTE API" cmd /k "cd /d %~dp0backend && npm run dev"
call :aguarda_api
echo [dev] Iniciando frontend em http://localhost:5173 ...
start /min "CORTE Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo [aguarda] Esperando frontend ficar pronto...
:aguarda_dev
timeout /t 2 /nobreak >nul
powershell -Command "try{Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing -TimeoutSec 1|Out-Null;exit 0}catch{exit 1}" >nul 2>&1
if %errorlevel% NEQ 0 goto aguarda_dev

echo [chrome] Abrindo totem em modo dev...
start "" "%CHROME%" --kiosk --kiosk-printing --disable-infobars --noerrdialogs --no-first-run --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI http://localhost:5173/
goto fim

:: ═══════════════════════════════════════════════════════════════════
::  Instala dependencias do print-server se necessario
:: ═══════════════════════════════════════════════════════════════════
:instalar_print_server
if not exist "%~dp0print-server\node_modules" (
  echo [print-server] Instalando dependencias...
  cd /d "%~dp0print-server"
  call npm install --silent
  cd /d "%~dp0"
)
if not exist "%~dp0print-server\.env" (
  copy /Y "%~dp0print-server\.env.example" "%~dp0print-server\.env" >nul
  echo [print-server] Criado print-server\.env — configure PRINTER_NAME se necessario.
)
goto :eof

:aguarda_print_server
echo [aguarda] Esperando print-server em http://localhost:3334 ...
:aguarda_print_loop
timeout /t 1 /nobreak >nul
powershell -Command "try{Invoke-WebRequest -Uri 'http://127.0.0.1:3334/health' -UseBasicParsing -TimeoutSec 2|Out-Null;exit 0}catch{exit 1}" >nul 2>&1
if %errorlevel% NEQ 0 goto aguarda_print_loop
goto :eof

:aguarda_postgres
echo [aguarda] Esperando PostgreSQL em localhost:5435 ...
:aguarda_postgres_loop
timeout /t 1 /nobreak >nul
powershell -Command "try{$tcp=New-Object System.Net.Sockets.TcpClient;$tcp.Connect('127.0.0.1',5435);$tcp.Close();exit 0}catch{exit 1}" >nul 2>&1
if %errorlevel% NEQ 0 goto aguarda_postgres_loop
goto :eof

:aguarda_api
echo [aguarda] Esperando API em http://localhost:3333 ...
:aguarda_api_loop
timeout /t 1 /nobreak >nul
powershell -Command "try{Invoke-WebRequest -Uri 'http://127.0.0.1:3333/health' -UseBasicParsing -TimeoutSec 2|Out-Null;exit 0}catch{exit 1}" >nul 2>&1
if %errorlevel% NEQ 0 goto aguarda_api_loop
goto :eof

:: ═══════════════════════════════════════════════════════════════════
::  Rotina compartilhada: print-server local (frontend/API ficam na nuvem)
:: ═══════════════════════════════════════════════════════════════════
:iniciar_producao
call :instalar_print_server

echo [print-server] Iniciando servidor de impressao em http://localhost:3334 ...
start /min "CORTE Print" cmd /k "cd /d %~dp0print-server & node server.mjs"
call :aguarda_print_server
goto :eof

:: ═══════════════════════════════════════════════════════════════════
::  Localiza Chrome
:: ═══════════════════════════════════════════════════════════════════
:localiza_chrome
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" (
  echo ERRO: Chrome nao encontrado.
  pause & exit /b 1
)
goto :eof

:: ═══════════════════════════════════════════════════════════════════
::  [2] Totem Cliente
:: ═══════════════════════════════════════════════════════════════════
:totem_cliente
call :iniciar_producao
call :localiza_chrome
echo [chrome] Abrindo totem cliente em %FRONTEND_URL% (loja: %STORE_SLUG%)...
start "" "%CHROME%" --kiosk --kiosk-printing --disable-infobars --noerrdialogs --no-first-run --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI "%FRONTEND_URL%/?store=%STORE_SLUG%"
goto fim

:: ═══════════════════════════════════════════════════════════════════
::  [3] Totem Operador
:: ═══════════════════════════════════════════════════════════════════
:totem_operador
call :iniciar_producao
call :localiza_chrome
echo [chrome] Abrindo totem operador em %FRONTEND_URL% (loja: %STORE_SLUG%)...
start "" "%CHROME%" --kiosk --disable-infobars --noerrdialogs --no-first-run --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI "%FRONTEND_URL%/?store=%STORE_SLUG%&view=operador"
goto fim

:: ═══════════════════════════════════════════════════════════════════
:fim
echo.
echo Para encerrar, feche a janela "CORTE Print".
echo Impressora: edite print-server\.env (PRINTER_NAME) se o comprovante nao sair.
echo.
