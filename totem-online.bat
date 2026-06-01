@echo off
cd /d "%~dp0"
title CORTE — Totem Online

:: ═══════════════════════════════════════════════════════════════════
::  INSTALACAO AUTOMATICA
::  Coloque um atalho deste .bat em:
::  shell:startup  (pasta de inicialização do Windows)
::  Caminho: C:\Users\<usuario>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
:: ═══════════════════════════════════════════════════════════════════

:: Verifica e instala Node.js se necessario
where node >nul 2>&1
if %errorlevel% NEQ 0 (
  echo [node] Node.js nao encontrado. Baixando instalador...
  powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.13.1/node-v22.13.1-x64.msi' -OutFile '%TEMP%\node-install.msi'"
  echo [node] Instalando Node.js...
  msiexec /i "%TEMP%\node-install.msi" /qn /norestart
  if %errorlevel% NEQ 0 ( echo ERRO: Falha ao instalar Node.js. & pause & exit /b 1 )
  del "%TEMP%\node-install.msi" >nul 2>&1
  echo [node] Node.js instalado. Recarregando variaveis de ambiente...
  call refreshenv >nul 2>&1
  set "PATH=%PATH%;C:\Program Files\nodejs"
  echo [node] Instalacao concluida.
)

:: Instala dependencias do print-server se necessario
if not exist "%~dp0print-server\node_modules" (
  echo [print-server] Instalando dependencias...
  cd /d "%~dp0print-server"
  call npm install --silent
  cd /d "%~dp0"
)

:: Cria .env do print-server se nao existir
if not exist "%~dp0print-server\.env" (
  copy /Y "%~dp0print-server\.env.example" "%~dp0print-server\.env" >nul
  echo [print-server] Criado print-server\.env
  echo [print-server] Se a impressora nao imprimir, configure PRINTER_NAME em print-server\.env
)

:: Inicia o print-server em segundo plano
echo [print-server] Iniciando em http://127.0.0.1:3334 ...
start /min "CORTE Print" cmd /k "cd /d %~dp0print-server && node server.mjs"

:: Aguarda o print-server ficar pronto
echo [aguarda] Esperando print-server...
:aguarda
timeout /t 1 /nobreak >nul
powershell -Command "try{Invoke-WebRequest -Uri 'http://127.0.0.1:3334/health' -UseBasicParsing -TimeoutSec 2|Out-Null;exit 0}catch{exit 1}" >nul 2>&1
if %errorlevel% NEQ 0 goto aguarda

:: Localiza o Chrome
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" (
  echo ERRO: Chrome nao encontrado.
  pause & exit /b 1
)

:: Abre o Chrome em modo quiosque
echo [chrome] Abrindo totem em https://corte.vercel.app/ ...
start "" "%CHROME%" --kiosk --kiosk-printing --disable-infobars --noerrdialogs --no-first-run --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI "https://corte.vercel.app/"
