# Deploy no Totem — CORTE

## Pré-requisitos
- Node.js 20+ instalado
- Google Chrome instalado em `C:\Program Files\Google\Chrome\Application\chrome.exe`
- `npx serve` disponível (`npm install -g serve`)

## Build de produção

```bat
cd C:\Projetos\cortes-app
npm run build
```

Gera a pasta `dist/`.

## Inicialização (ordem correta)

1. **Servidor** — abre um terminal e executa:
   ```
   kiosk\iniciar_servidor.bat
   ```
   Aguarda a mensagem `Accepting connections at http://localhost:4173`

2. **Totem Cliente** — segundo terminal ou duplo clique:
   ```
   kiosk\iniciar_cliente.bat
   ```

3. **Tablet Operador** — no dispositivo do açougueiro:
   ```
   kiosk\iniciar_operador.bat
   ```
   (aponta para a mesma URL com `?view=operador`)

## Modo de tela cheia manual

Se o kiosk mode não abrir em fullscreen, pressione **F11** no Chrome após abrir.

## Saída de emergência do kiosk

**Alt + F4** fecha o Chrome no modo kiosk.  
Para configurar um atalho de saída para a equipe: `Alt + F4` ou criar um atalho de teclado customizado.

## Startup automático no Windows

Para iniciar automaticamente com o Windows:

1. Pressione `Win + R` → `shell:startup`
2. Copie o atalho de `iniciar_servidor.bat` para a pasta que abriu
3. Copie o atalho de `iniciar_cliente.bat` para a mesma pasta

## Resolução recomendada

Configure a resolução do Windows para **1080×1920** (portrait) antes de rodar o kiosk.

Verificar: `Configurações → Sistema → Tela → Resolução`
