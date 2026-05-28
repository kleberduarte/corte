@echo off
:: CORTE — Totem Operador (tablet do açougueiro)
:: Executa Chromium em modo kiosk na URL do kanban

set CHROMIUM="C:\Program Files\Google\Chrome\Application\chrome.exe"
set URL=http://localhost:4173/?view=operador

:wait_server
timeout /t 2 /nobreak >nul
curl -s --max-time 2 %URL% >nul 2>&1
if errorlevel 1 goto wait_server

start "" %CHROMIUM% ^
  --kiosk ^
  --disable-infobars ^
  --disable-session-crashed-bubble ^
  --no-first-run ^
  --disable-pinch ^
  --overscroll-history-navigation=0 ^
  --disable-features=TranslateUI ^
  --app=%URL%
