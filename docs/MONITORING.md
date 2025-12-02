# Monitoring & Observability

Este documento descreve o sistema de monitoramento e observabilidade implementado na plataforma V2K Music.

## 📊 Visão Geral

O sistema de monitoramento consiste em:
- **Health Checks**: Verificação de saúde do sistema (database, Redis, memória)
- **Metrics API**: Métricas de performance (queries, memória, processo)
- **Sentry**: Error tracking e performance monitoring
- **Dashboard Admin**: Interface visual para monitoramento em tempo real

---

## 🚀 Setup

### 1. Configurar Sentry (Opcional mas Recomendado)

O Sentry é usado para tracking de erros e performance monitoring em produção.

#### Criar Conta no Sentry

1. Acesse https://sentry.io/ e crie uma conta
2. Crie um novo projeto Next.js
3. Copie o DSN fornecido

#### Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Sentry Configuration (opcional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**Nota:** O sistema funciona perfeitamente sem o Sentry configurado. Ele é opcional e usado principalmente em produção.

### 2. Verificar Redis (Opcional)

O Redis é usado para cache e melhor performance. Se já estiver configurado, o sistema de monitoring irá monitorar seu status.

```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 🔍 Endpoints de Monitoramento

### GET /api/health

Retorna o status de saúde do sistema.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-02T12:00:00.000Z",
  "uptime": 3600,
  "responseTime": 45,
  "checks": {
    "database": {
      "status": "healthy",
      "latency": 23
    },
    "redis": {
      "status": "disabled",
      "latency": 0
    },
    "memory": {
      "status": "healthy",
      "usage": 128,
      "limit": 512
    }
  }
}
```

**Status Codes:**
- `200` - Sistema saudável ou degradado
- `503` - Sistema com problemas críticos

**Status Possíveis:**
- `healthy` - Todos os serviços funcionando perfeitamente
- `degraded` - Alguns serviços com latência elevada ou Redis indisponível
- `unhealthy` - Database offline ou problemas críticos

### GET /api/metrics

Retorna métricas detalhadas de performance do sistema.

**Requer:** Autenticação (session)

**Response:**
```json
{
  "timestamp": "2025-12-02T12:00:00.000Z",
  "queries": {
    "total": 1234,
    "averageDuration": 45,
    "slowQueries": 12,
    "slowestQuery": {
      "model": "Track",
      "action": "findMany",
      "duration": 245
    },
    "recentSlowQueries": [...]
  },
  "memory": {
    "heapUsed": 128,
    "heapTotal": 256,
    "external": 32,
    "rss": 512
  },
  "process": {
    "uptime": 3600,
    "pid": 12345,
    "platform": "win32",
    "nodeVersion": "v20.11.0"
  },
  "cache": {
    "enabled": true
  }
}
```

---

## 🎯 Dashboard Administrativo

Acesse o dashboard de monitoramento em: **`/admin/monitoring`**

### Features do Dashboard:

#### 1. **System Status**
- Status geral do sistema
- Uptime
- Response time
- Última verificação

#### 2. **Health Checks**
- **Database**: Status e latência
- **Redis Cache**: Status e latência (ou "Disabled" se não configurado)
- **Memory**: Uso e limite

#### 3. **Database Queries**
- Total de queries executadas
- Duração média
- Queries lentas (>100ms)
- Query mais lenta registrada
- Lista de queries recentes lentas

#### 4. **Memory Usage**
- Heap Used
- Heap Total
- External Memory
- RSS (Resident Set Size)
- Percentual de uso

#### 5. **Process Information**
- Uptime
- Process ID
- Platform
- Node Version
- Status do Cache

### Auto-Refresh

O dashboard possui refresh automático a cada **10 segundos** quando ativado. Você pode:
- Ativar/desativar auto-refresh
- Fazer refresh manual a qualquer momento

---

## 🔧 Query Performance Monitoring

O sistema monitora automaticamente todas as queries do Prisma:

### Threshold de Slow Queries

Queries que levam **mais de 100ms** são consideradas lentas e:
- São logadas no console (desenvolvimento)
- Podem ser enviadas ao Sentry (produção)
- Aparecem no dashboard de métricas

### Exemplo de Log

```
[PRISMA_SLOW_QUERY] Track.findMany took 245ms
{
  model: "Track",
  action: "findMany",
  duration: 245,
  timestamp: "2025-12-02T12:00:00.000Z"
}
```

### Query Metrics

O sistema mantém um histórico das últimas **100 queries** e calcula:
- Total de queries
- Duração média
- Número de queries lentas
- Query mais lenta do período

---

## 🐛 Error Tracking com Sentry

Se o Sentry estiver configurado, todos os erros são automaticamente capturados e enviados.

### Client-Side (Browser)

**Configurado em:** `sentry.client.config.ts`

Features:
- Error tracking
- Performance monitoring
- Session replay (10% das sessões)
- Session replay em erros (100%)
- Filtros para ignorar erros comuns:
  - Erros de extensões do browser
  - Erros de rede
  - ResizeObserver errors

### Server-Side (Node.js)

**Configurado em:** `sentry.server.config.ts`

Features:
- Error tracking
- Performance monitoring
- Node profiling
- Filtros de dados sensíveis:
  - Remove headers de autenticação
  - Remove cookies
  - Remove API keys
  - Remove tokens

### Edge Runtime

**Configurado em:** `sentry.edge.config.ts`

Features:
- Error tracking
- Performance monitoring para Edge Functions

---

## 📊 Alertas e Notificações

### Health Check Alerts

O sistema identifica 3 níveis de saúde:

1. **Healthy (Verde)**
   - Database latency < 100ms
   - Redis latency < 50ms
   - Memory usage < 90%

2. **Degraded (Amarelo)**
   - Database latency ≥ 100ms
   - Redis offline
   - Memory usage ≥ 90%

3. **Unhealthy (Vermelho)**
   - Database offline
   - Sistema não responde

### Recomendações por Status

#### Healthy
✅ Sistema operando normalmente

#### Degraded
⚠️ Ações recomendadas:
- Investigar queries lentas
- Verificar conexão com Redis
- Monitorar uso de memória
- Considerar escalar recursos

#### Unhealthy
🚨 Ações urgentes:
- Verificar conexão com database
- Verificar logs de erros
- Reiniciar serviços se necessário
- Contactar equipe de infraestrutura

---

## 🔐 Segurança

### Acesso ao Dashboard

O endpoint `/api/metrics` requer autenticação. Atualmente verifica:
- Sessão ativa do usuário

**TODO:** Implementar verificação de role admin para acesso restrito.

### Dados Sensíveis

O Sentry está configurado para:
- **Remover** headers de autenticação
- **Remover** cookies
- **Remover** API keys
- **Remover** tokens
- **Mascarar** textos em session replays

---

## 📈 Melhorias Futuras

### Planejado para v2

- [ ] Alertas por email/Slack para status unhealthy
- [ ] Histórico de uptime (últimos 30 dias)
- [ ] Gráficos de tendência de performance
- [ ] Cache hit rate tracking
- [ ] API response time por endpoint
- [ ] Integração com DataDog ou New Relic
- [ ] Custom metrics dashboard
- [ ] Logs centralizados (LogRocket, Logtail)

---

## 🛠️ Troubleshooting

### Dashboard não carrega

**Problema:** Erro ao acessar `/admin/monitoring`

**Solução:**
1. Verificar se está autenticado
2. Verificar se os endpoints `/api/health` e `/api/metrics` respondem
3. Verificar console do browser para erros

### Health Check sempre "degraded"

**Problema:** Redis sempre aparece como "unhealthy" ou "disabled"

**Solução:**
- Se você não configurou Redis, isso é normal. Redis é opcional.
- Se configurou, verificar env vars `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`

### Queries lentas no dashboard

**Problema:** Muitas queries acima de 100ms

**Solução:**
1. Verificar se há índices compostos adequados no schema Prisma
2. Analisar as queries no dashboard para identificar padrões
3. Considerar adicionar cache para endpoints frequentes
4. Revisar N+1 queries (múltiplas queries quando uma seria suficiente)

### Sentry não captura erros

**Problema:** Erros não aparecem no Sentry

**Solução:**
1. Verificar se `SENTRY_DSN` e `NEXT_PUBLIC_SENTRY_DSN` estão configurados
2. Verificar se o DSN está correto
3. Testar com erro intencional: `throw new Error("Test Sentry");`
4. Verificar filtros em `beforeSend` nos configs do Sentry

---

## 📚 Recursos

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)

---

**Última Atualização:** 2025-12-02  
**Sprint:** 53 - Monitoring & Observability  
**Versão:** 1.0
