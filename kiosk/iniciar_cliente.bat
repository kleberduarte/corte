@echo off
:: CORTE — Totem Cliente
:: Executa Chromium em modo kiosk na URL do totem cliente

set CHROMIUM="C:\Program Files\Google\Chrome\Application\chrome.exe"
set URL=http://localhost:4173/

:: Aguarda o servidor React estar disponível
:wait_server
timeout /t 2 /nobreak >nul
curl -s --max-time 2 %URL% >nul 2>&1
if errorlevel 1 goto wait_server

:: Abre em kiosk mode
start "" %CHROMIUM% ^
  --kiosk ^
  --disable-infobars ^
  --disable-session-crashed-bubble ^
  --disable-restore-session-state ^
  --no-first-run ^
  --disable-pinch ^
  --overscroll-history-navigation=0 ^
  --disable-features=TranslateUI ^
  --disable-context-menu ^
  --autoplay-policy=no-user-gesture-required ^
  --app=%URL%
