@echo off
cd /d "%~dp0"
title CORTE — Sistema

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
echo   [2] Totem Cliente     (build + serve + Chrome quiosque)
echo   [3] Totem Operador    (build + serve + Chrome quiosque operador)
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
if %errorlevel%==0 (
  echo [setup] Iniciando PostgreSQL...
  docker start cortes-app-postgres >nul 2>&1
  timeout /t 2 /nobreak >nul
)
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
echo [print-server] Iniciando servidor de impressao em http://localhost:3334 ...
start /min "CORTE Print" cmd /k "cd /d %~dp0print-server && node server.mjs"
timeout /t 1 /nobreak >nul
echo [dev] Iniciando API em http://localhost:3333 ...
start /min "CORTE API" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul
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
  cd /d "%~dp0print-server" && npm install --silent && cd /d "%~dp0"
)
goto :eof

:: ═══════════════════════════════════════════════════════════════════
::  Rotina compartilhada: build + API + serve dist + print-server
:: ═══════════════════════════════════════════════════════════════════
:iniciar_producao
call :setup
call :instalar_print_server

echo [print-server] Iniciando servidor de impressao em http://localhost:3334 ...
start /min "CORTE Print" cmd /k "cd /d %~dp0print-server && node server.mjs"
timeout /t 1 /nobreak >nul

echo [build] Gerando build de producao...
call npm run build
if errorlevel 1 ( echo ERRO no build. & pause & exit /b 1 )

echo [api] Iniciando API em http://localhost:3333 ...
start /min "CORTE API" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [serve] Servindo frontend em http://localhost:4173 ...
start /min "CORTE Frontend" cmd /k "cd /d %~dp0 && npx serve dist -l 4173 --no-clipboard"

echo [aguarda] Esperando frontend ficar pronto...
:aguarda_prod
timeout /t 2 /nobreak >nul
powershell -Command "try{Invoke-WebRequest -Uri 'http://localhost:4173' -UseBasicParsing -TimeoutSec 1|Out-Null;exit 0}catch{exit 1}" >nul 2>&1
if %errorlevel% NEQ 0 goto aguarda_prod

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
echo [chrome] Abrindo totem cliente...
start "" "%CHROME%" --kiosk --kiosk-printing --disable-infobars --noerrdialogs --no-first-run --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI http://localhost:4173/
goto fim

:: ═══════════════════════════════════════════════════════════════════
::  [3] Totem Operador
:: ═══════════════════════════════════════════════════════════════════
:totem_operador
call :iniciar_producao
call :localiza_chrome
echo [chrome] Abrindo totem operador...
start "" "%CHROME%" --kiosk --disable-infobars --noerrdialogs --no-first-run --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI "http://localhost:4173/?view=operador"
goto fim

:: ═══════════════════════════════════════════════════════════════════
:fim
echo.
echo Para encerrar, feche as janelas "CORTE API", "CORTE Frontend" e "CORTE Print".
echo.
