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
call :iniciar_print_server
call :localiza_chrome
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
::  Print-server (porta 3334)
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

:iniciar_print_server
echo [print-server] Iniciando em http://127.0.0.1:3334 ...
start /min "CORTE Print" cmd /k "cd /d %~dp0print-server && node server.mjs"
call :aguarda_print_server
goto :eof

:aguarda_print_server
echo [aguarda] Esperando print-server...
:aguarda_print_loop
timeout /t 1 /nobreak >nul
powershell -Command "try{Invoke-WebRequest -Uri 'http://127.0.0.1:3334/health' -UseBasicParsing -TimeoutSec 2|Out-Null;exit 0}catch{exit 1}" >nul 2>&1
if %errorlevel% NEQ 0 goto aguarda_print_loop
goto :eof

:: ═══════════════════════════════════════════════════════════════════
::  Rotina compartilhada: build + API + serve dist
:: ═══════════════════════════════════════════════════════════════════
:iniciar_producao
call :setup
call :instalar_print_server
call :iniciar_print_server

echo [build] Gerando build do totem (API local 127.0.0.1)...
call npm run build:totem
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
call :resolve_totem_url
echo [chrome] Abrindo totem cliente em %TOTEM_URL% ...
start "" "%CHROME%" --kiosk --kiosk-printing --disable-infobars --noerrdialogs --no-first-run --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI "%TOTEM_URL%"
goto fim

:resolve_totem_url
set "TOTEM_URL=http://localhost:4173/"
if exist "%~dp0.env.totem" for /f "usebackq tokens=1,* delims==" %%a in (`findstr /B /I "VITE_TOTEM_UI_URL=" "%~dp0.env.totem" 2^>nul`) do set "TOTEM_URL=%%b"
set "TOTEM_URL=%TOTEM_URL:"=%"
if "%TOTEM_URL:~-1%"=="/" goto :eof
set "TOTEM_URL=%TOTEM_URL%/"
goto :eof

:: ═══════════════════════════════════════════════════════════════════
::  [3] Totem Operador
:: ═══════════════════════════════════════════════════════════════════
:totem_operador
call :iniciar_producao
call :localiza_chrome
echo [chrome] Abrindo totem operador...
start "" "%CHROME%" --kiosk --kiosk-printing --disable-infobars --noerrdialogs --no-first-run --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI "http://localhost:4173/?view=operador"
goto fim

:: ═══════════════════════════════════════════════════════════════════
:fim
echo.
echo Para encerrar, feche as janelas "CORTE API", "CORTE Frontend" e "CORTE Print".
echo Impressora: edite print-server\.env (PRINTER_NAME) se o comprovante nao sair.
echo.

