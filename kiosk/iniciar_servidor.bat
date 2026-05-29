@echo off
:: CORTE — Servidor React (build de produção)
:: Rode este script ANTES de iniciar_cliente.bat ou iniciar_operador.bat

cd /d "%~dp0.."
echo Diretorio: %CD%

:: Sempre reconstrói para refletir alterações em src/ no totem (localhost:4173)
echo Gerando build atualizado...
call npm run build
if errorlevel 1 (
  echo ERRO: falha no build.
  pause
  exit /b 1
)

echo Iniciando servidor CORTE em http://localhost:4173 ...
npx serve dist -l 4173 --no-clipboard
if errorlevel 1 (
  echo ERRO: falha ao iniciar o servidor.
  pause
)
