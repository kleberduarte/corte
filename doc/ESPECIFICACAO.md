# CORTE — Especificação Funcional e Técnica
## Sistema de Autoatendimento em Totem para Açougues de Supermercado

**Versão:** 1.0  
**Data:** 2026-05-28  
**Escopo:** Totem Cliente + Totem Operador (MVP)

---

## 1. Visão Geral

O **CORTE** é uma plataforma SaaS multi-tenant que digitaliza o atendimento de açougues em redes de supermercado via totem de autoatendimento. O cliente escolhe o corte, personaliza peso e tipo de preparo, agenda a retirada e recebe confirmação via WhatsApp + comprovante impresso. O açougueiro gerencia a fila em tempo real por um Kanban dedicado.

### 1.1 Dois Modos de Operação

| Modo | URL / Entrada | Quem usa |
|------|--------------|----------|
| `?view=cliente` | Totem voltado ao público | Clientes do supermercado |
| `?view=operador` | Totem / tablet do açougueiro | Operador / açougueiro |

---

## 2. Especificação Funcional

### 2.1 Fluxo do Cliente (8 telas)

```
Tela Inicial → Categorias → Catálogo → Detalhe → Agendamento → WhatsApp → Impressão → [retorna ao início]
```

#### Tela 1 — Tela Inicial (Attract Screen)
- Carrossel de imagens em tela cheia com produtos em destaque (auto-play 5 s, swipe touch)
- Exibe nome do produto, tag descritiva e preço por kg em overlay sobre a foto
- Botão CTA principal: **"Toque aqui para iniciar"** com animação de pulso para atrair atenção
- Indicador de status (ponto verde "Aberto") e identidade da loja (logo + nome tenant)
- **Inatividade:** retorna à tela inicial automaticamente após 90 s sem interação

#### Tela 2 — Categorias
- Grid 2×3 de cards fotográficos com overlay escuro e nome da categoria
- Categorias: Carnes · Frangos · Linguiças · Peixes · Frutos do Mar
- Último card ocupa largura total (wide) para destaque visual
- Navegação: botão "← Voltar" retorna à Tela Inicial

#### Tela 3 — Catálogo
- Chips de filtro horizontal por categoria (Todos / Bovino / Aves / Suíno / Peixe / Especiais)
- Grid 2 colunas de cards de produto com: foto, nome, descrição, preço/kg, avaliação em estrelas, badge (Premium / Nobre / Popular)
- Botão `+` adiciona ao carrinho sem sair da tela
- FAB flutuante "Agendar cortes" aparece ao adicionar o primeiro item; exibe contador e direciona ao Agendamento
- Pagamento no caixa — não há cobrança no totem

#### Tela 4 — Detalhe do Produto
- Foto hero 248 px com overlay gradiente
- Informações: categoria, nome, avaliação (estrelas + nota + contagem), descrição completa
- **Seletor de tipo de corte:** grid 2×2 — Peça Inteira / Bife Alto / Bife Fino / Iscas & Tiras (extensível via configuração)
- Tags informativos (origem, processo, certificação)
- Controle de quantidade em kg (incremento 0,5 kg), com estimativa de preço calculada em tempo real
- Banner informativo: "Pagamento no caixa"
- Botão "Agendar este corte" → avança para Agendamento

#### Tela 5 — Agendamento
- Resumo compacto do produto selecionado (foto + nome)
- **Peso:** chips rápidos (500 g / 1,5 kg / 2 kg / 3 kg)
- **Data:** apenas "Hoje" (agendamento same-day); hint explicativo
- **Horário:** slots em grid 3–4 colunas; slots ocupados marcados como riscados/desabilitados
- Resumo consolidado antes da confirmação: "Hoje · 09h30 · 1,5 kg"
- Botão "Confirmar agendamento" → avança para WhatsApp
- Hint: "Pagamento no caixa do mercado"

#### Tela 6 — WhatsApp / Identificação
- Resumo do pedido (produto + data/hora + peso)
- Campo de telefone com prefixo +55, inputmode="tel" para teclado numérico no touch
- Botão "Enviar informações e imprimir pedido"
- Hint sobre privacidade (LGPD)
- Campo é **opcional** — se o cliente não quiser, haverá opção de pular e apenas imprimir

#### Tela 7 — Impressão Térmica
- Animação de impressora com barra de progresso shinning
- Recibo térmico simulado (fonte monospace, largura 80 mm) aparece progressivamente
- Conteúdo do recibo: logo, store name, código alfanumérico do pedido, produto, tipo de corte, peso, horário de retirada, instrução "Dirija-se ao açougue com este comprovante", código QR do pedido
- Após impressão: tela de sucesso com ✓, mensagem de confirmação, botão "Voltar ao início"
- Timeout de 30 s retorna automaticamente ao início

#### Regras de Negócio — Cliente
- **Slot atômico:** reserva com UPDATE … WHERE status = 'disponível' evita duplo agendamento
- **Preço snapshot:** preço gravado no pedido no momento da criação (não sofre alterações posteriores)
- **Código de retirada:** alfanumérico 6 caracteres (ex: `A-7824`), gerado server-side
- **Timeout de sessão:** 90 s de inatividade em qualquer tela retorna à Tela Inicial e limpa o carrinho

---

### 2.2 Fluxo do Operador / Açougueiro

#### Tela Kanban (tela única, tempo real)

**Header**
- Logo + nome da loja + relógio em tempo real + nome/turno do operador
- Badge de notificação com contador de novos pedidos

**Métricas rápidas (strip superior)**
- Aguardando · Em Preparo · Prontos · Total do dia · Urgente · Tempo médio de preparo

**Colunas Kanban**
1. **Aguardando Corte** — pedidos confirmados, ainda não iniciados (ordenados por horário de retirada)
2. **Em Preparo** — pedido iniciado pelo operador (timer visível por card)
3. **Pronto · Aguardando Retirada** — corte finalizado, cliente convocado

**Card de pedido (por coluna)**
- Código alfanumérico do pedido
- Timer com código de cor: verde (≥ 10 min) / laranja (5–10 min) / vermelho (< 5 min)
- Foto miniatura + nome do produto + tipo de corte
- Peso solicitado + horário de retirada + nome do cliente
- Borda esquerda vermelha para pedidos urgentes
- Ações contextuais por coluna:
  - Aguardando → **"Iniciar preparo"** + "Detalhes"
  - Em Preparo → **"Marcar como Pronto"** + "Detalhes"
  - Pronto → **"Confirmar Retirada"** + "Detalhes"

**Dock inferior**
- Botão **"▶ Iniciar próximo"** (atalho para o primeiro da fila; desabilitado quando fila vazia)
- Botão ↺ Reset de demo (apenas em ambiente de desenvolvimento)

**Comportamento em tempo real**
- Novos pedidos chegam ao topo de "Aguardando" com animação slide-in
- Ao mover um card entre colunas, o backend é notificado via WebSocket e o cliente recebe push/WhatsApp com atualização de status
- Status possíveis: `aguardando` → `em_preparo` → `pronto` → `retirado`

---

## 3. Especificação Técnica

### 3.1 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        TOTEM FÍSICO                         │
│  ┌───────────────────────┐  ┌───────────────────────────┐   │
│  │  Frontend Cliente     │  │  Frontend Operador        │   │
│  │  (Kiosk Browser)      │  │  (Tablet / Totem interno) │   │
│  │  React PWA            │  │  React PWA                │   │
│  └───────────┬───────────┘  └───────────┬───────────────┘   │
└──────────────┼──────────────────────────┼───────────────────┘
               │ HTTPS / WSS              │ HTTPS / WSS
┌──────────────▼──────────────────────────▼───────────────────┐
│                       API GATEWAY                           │
│            (NGINX + rate-limit + JWT validation)            │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
┌──────────────▼──────┐     ┌─────────────▼─────────────────┐
│   REST API (Node)   │     │  WebSocket Server (Socket.io) │
│   + BullMQ workers  │     │  Canal: pedido:{store_id}     │
└──────────────┬──────┘     └─────────────┬─────────────────┘
               │                          │
┌──────────────▼──────────────────────────▼───────────────────┐
│                    PostgreSQL (RLS por tenant)               │
│              Redis (cache, filas BullMQ, pub/sub)           │
└─────────────────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    Serviços externos                        │
│  WhatsApp Business API  ·  Impressora térmica (ESC/POS)    │
│  FCM Push (tablet op.)  ·  ERP webhook (catálogo/preços)   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | React 18 + Vite + TypeScript | Componentização, hot-reload, tipagem |
| Estilo | CSS custom properties (tokens de tema) + Tailwind utilitários | Tema dinâmico por tenant via variáveis CSS injetadas |
| Estado global | Zustand | Leve, sem boilerplate Redux |
| Real-time | Socket.io client | WebSocket com fallback long-polling |
| Backend API | Node.js + Fastify | Alta performance I/O-bound, schema validation nativa |
| ORM | Prisma | Migrations versionadas, RLS via `SET app.tenant_id` |
| Banco | PostgreSQL 16 | RLS nativa, transações ACID para reserva atômica de slot |
| Cache / Fila | Redis 7 | Pub/sub, BullMQ para jobs assíncronos |
| WebSocket | Socket.io + Redis adapter | Escala horizontal com múltiplos pods |
| Impressora | escpos (npm) | Driver ESC/POS para impressora térmica 80 mm |
| WhatsApp | Twilio WhatsApp API ou Meta Cloud API | Confiabilidade, compliance |
| Infraestrutura | Docker Compose (dev) → Kubernetes (prod) | Escalabilidade horizontal |
| CI/CD | GitHub Actions | Build + test + deploy automático |

### 3.3 Multi-tenancy

- **Isolamento via RLS (Row-Level Security) no PostgreSQL**
- Toda query executa `SET LOCAL app.tenant_id = '{id}'` antes das operações
- Política RLS: `USING (tenant_id = current_setting('app.tenant_id')::uuid)`
- Tema visual (cores, logo, tipografia) entregue via endpoint `/api/theme/{tenant_id}` com cache HTTP `ETag`
- Variáveis CSS (`--red`, `--gold`, etc.) sobrescritas por JSON de tema via `style.setProperty()`

### 3.4 Modelo de Dados (Entidades Principais)

```sql
-- Hierarquia: Tenant → Store → Product → Order

tenants (id, slug, name, theme_json, created_at)
stores  (id, tenant_id, name, address, timezone, open_time, close_time)
products (id, store_id, tenant_id, name, description, category, price_per_kg,
          cut_types jsonb, images jsonb, rating_avg, rating_count, active)
slots   (id, store_id, date, time, capacity, reserved, status)
orders  (id, store_id, tenant_id, product_id, slot_id,
         customer_phone, customer_name,
         cut_type, weight_kg, price_per_kg_snapshot, estimated_price,
         pickup_code varchar(8),
         status enum('aguardando','em_preparo','pronto','retirado','cancelado'),
         created_at, updated_at)
order_events (id, order_id, from_status, to_status, operator_id, ts)
```

### 3.5 Reserva Atômica de Slot

```sql
-- Reserva sem race condition
UPDATE slots
SET    reserved = reserved + 1
WHERE  id = $slot_id
  AND  reserved < capacity
  AND  status = 'disponivel'
RETURNING id;
-- Se 0 rows retornado → slot esgotado, retorna 409 ao cliente
```

### 3.6 Endpoints REST Principais

```
GET  /api/{tenant}/{store}/products          → catálogo com filtro por categoria
GET  /api/{tenant}/{store}/products/:id      → detalhe do produto
GET  /api/{tenant}/{store}/slots?date=today  → slots disponíveis do dia
POST /api/{tenant}/{store}/orders            → cria pedido (reserva slot atomicamente)
GET  /api/{tenant}/{store}/orders/:code      → status pelo código de retirada
PATCH /api/{tenant}/{store}/orders/:id/status → operador avança status
GET  /api/theme/{tenant}                     → JSON de tema (cache ETag)
```

### 3.7 WebSocket — Protocolo de Eventos

```
Canal: pedido:{store_id}

Servidor → Operador:
  order:new        { order }          → novo pedido aparece no Kanban
  order:updated    { order_id, status } → status mudou (ex: via outro dispositivo)

Servidor → Cliente (totem):
  order:status     { order_id, status, message }

Cliente → Servidor:
  order:move       { order_id, to_status }  → operador move card
```

### 3.8 Integração com Impressora Térmica

- Driver: **escpos** (Node.js) ou **WebUSB** (browser, se impressora USB)
- Comunicação: USB Serial (recomendado) ou TCP/IP (impressora em rede local)
- Conteúdo do recibo (80 mm):
  - Cabeçalho: logo ASCII + nome da loja
  - Código do pedido em destaque (fonte grande + QR Code)
  - Produto, tipo de corte, peso, horário
  - Instrução de retirada
  - Rodapé: "Pagamento no caixa · LGPD: dados usados apenas para este pedido"
- Fallback: se impressora offline, exibe QR Code na tela para o cliente fotografar

### 3.9 Integração WhatsApp

- Disparo assíncrono via BullMQ (não bloqueia resposta da API)
- Eventos que disparam mensagem:
  1. Pedido confirmado → "Seu corte foi agendado para 09h30 · Código: A-7824"
  2. Status "em_preparo" → "Seu corte está sendo preparado"
  3. Status "pronto" → "Seu corte está pronto! Dirija-se ao açougue"
- Número do cliente armazenado apenas na sessão do pedido (LGPD: não retido após retirada)

---

## 4. Arquitetura do Totem (Hardware + Software)

### 4.1 Configuração de Hardware Recomendada

| Componente | Especificação mínima |
|-----------|---------------------|
| Processador | Intel Core i3 10ª gen (ou equivalente ARM) |
| RAM | 8 GB |
| Armazenamento | SSD 128 GB |
| Tela | 21" touchscreen capacitivo, 1080×1920 (portrait) |
| OS | Windows 10 IoT Enterprise LTSC ou Ubuntu 22.04 LTS |
| Impressora | Epson TM-T20III ou similar (ESC/POS, USB) |
| Rede | Ethernet (obrigatório) + WiFi backup |

### 4.2 Modo Kiosk

- Browser: **Chromium** em modo kiosk (`--kiosk --disable-infobars --disable-session-crashed-bubble`)
- Inicialização automática via script de serviço (systemd / Windows Task Scheduler)
- URL de boot: `http://localhost:3000/?view=cliente` (ou `?view=operador` no tablet do açougueiro)
- **Watchdog:** processo que reinicia o Chromium se ele travar (ex: PM2 ou systemd restart)
- Bloqueio de teclado físico e gestos de saída do kiosk
- **Offline mode:** service worker com cache dos assets estáticos; ao perder conexão exibe banner "Sistema temporariamente indisponível" e continua exibindo o carrossel

### 4.3 Segurança do Totem

- SO com auto-update desabilitado em produção (atualizado em janela de manutenção)
- VPN ou rede isolada da loja com whitelist de IPs para a API
- Sem acesso a disco do usuário (kiosk user sem privilégios)
- Logs de sessão: início/fim de cada atendimento (sem dados pessoais antes do opt-in WhatsApp)

---

## 5. Temas Dinâmicos por Tenant

O sistema suporta white-label completo por rede de supermercado:

```json
// Exemplo: tema Pão de Açúcar
{
  "tenant_id": "pao-de-acucar",
  "colors": {
    "primary": "#C0272D",
    "primary_dark": "#7A1015",
    "accent": "#F5EDDB"
  },
  "logo_url": "https://cdn.cortes.app/tenants/pao-de-acucar/logo.svg",
  "font_serif": "Playfair Display",
  "font_sans": "Inter",
  "border_radius": "16px",
  "store_name": "Pão de Açúcar Moema"
}
```

- Tema carregado na inicialização do totem via GET `/api/theme/{tenant}`
- Cache local com `ETag` — só re-baixa se o tema mudar
- Variáveis CSS injetadas em `document.documentElement.style`
- Fallback: tema padrão CORTE se endpoint indisponível

---

## 6. Catálogo de Produtos

### Categorias (MVP)

| Categoria | Exemplos |
|-----------|---------|
| Bovino | Picanha Angus, Filé Mignon, Costela, Contrafilé, Alcatra |
| Aves | Frango Inteiro, Sobrecoxa, Peito, Coxa/Sobrecoxa, Asa, Sassami, Coração, Caipira, Chester |
| Suíno | Costelinha Suína, Linguiça Toscana |
| Peixe | Salmão em Posta, Tilápia Filé |
| Frutos do Mar | Camarão VG |
| Especiais | Wagyu Ribeye A5, Carré de Cordeiro |

### Tipos de Corte por Produto (configurável)

```json
"cut_types": [
  { "id": "inteiro",  "name": "Peça Inteira",  "desc": "Como sai da peça" },
  { "id": "bife_alto","name": "Bife Alto",      "desc": "2–3 cm espessura" },
  { "id": "bife_fino","name": "Bife Fino",      "desc": "0,5–1 cm espessura" },
  { "id": "iscas",    "name": "Iscas / Tiras",  "desc": "Para chapa ou wok" }
]
```

### Atualização de Preços

- Via **webhook ERP** (push, tempo real) — preferencial
- Via **CSV upload** (painel admin) — fallback manual
- Via **polling** (GET ao ERP a cada 15 min) — legado
- Histórico de preços imutável; snapshot gravado no pedido no momento da criação

---

## 7. Gestão de Slots e Capacidade

- Slots configuráveis por loja: duração (15 / 30 / 60 min), capacidade simultânea, horário de funcionamento
- Slot "hoje" é o único período disponível no totem (agendamento same-day)
- Slots exibidos com status: disponível / quase cheio (≤ 2 vagas) / esgotado (riscado)
- Regra anti-overbooking: transação ACID no banco (UPDATE atômico)

---

## 8. Conformidade e Privacidade (LGPD)

- Número de WhatsApp: coletado com consentimento explícito na Tela 6
- Finalidade: entrega de informações do pedido (uso único)
- Retenção: dados de pedido retidos por 30 dias para auditoria; número de telefone anonimizado após retirada
- Opt-out: campo opcional — cliente pode imprimir sem fornecer telefone
- RLS no banco: operadores só veem pedidos do seu próprio tenant/loja

---

## 9. Monitoramento e Manutenção

| Componente | Ferramenta |
|-----------|-----------|
| Logs de aplicação | Pino (estruturado JSON) → Loki |
| Métricas | Prometheus + Grafana |
| Alertas | PagerDuty (slot timeout, impressora offline, pod down) |
| Uptime do totem | Heartbeat a cada 60 s para API `/health` |
| Deploy | GitHub Actions → Docker Hub → Kubernetes rolling update |
| Rollback | `kubectl rollout undo` em < 2 min |

---

## 10. Roadmap de Implementação

### Fase 1 — MVP (M1–M3)
- [ ] Infraestrutura base: PostgreSQL + Redis + Node API + React totem
- [ ] Multi-tenancy RLS + sistema de temas
- [ ] Telas 1–7 do totem cliente
- [ ] Kanban operador com WebSocket
- [ ] Integração impressora térmica (ESC/POS)
- [ ] Integração WhatsApp Business API
- [ ] Modo kiosk + watchdog

### Fase 2 (M4–M6)
- [ ] Pagamento via PIX no totem (QR Code gerado na confirmação)
- [ ] Painel admin web (catálogo, slots, métricas)
- [ ] Integração ERP via webhook
- [ ] App mobile cliente (iOS + Android)

### Fase 3 (M7–M12)
- [ ] Programa de fidelidade
- [ ] Recomendação ML ("clientes que pediram X também levaram Y")
- [ ] Relatórios avançados de corte e desperdício
- [ ] White-label completo para novas redes

---

## 11. Glossário

| Termo | Definição |
|-------|-----------|
| Tenant | Uma rede de supermercado (ex: Pão de Açúcar, Carrefour) |
| Store | Uma loja específica dentro da rede |
| Slot | Janela de tempo disponível para retirada (ex: 09h30) |
| Pickup Code | Código alfanumérico de 6 chars para identificar o pedido |
| Kanban | Quadro de gestão de pedidos do operador (3 colunas) |
| ESC/POS | Protocolo de comandos para impressoras térmicas |
| RLS | Row-Level Security — isolamento de dados por tenant no PostgreSQL |
