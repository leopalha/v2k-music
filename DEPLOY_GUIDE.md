# V2K Music - Guia de Deploy

**Última Atualização:** 2025-12-03  
**Status:** ✅ Código pronto para deploy

## 🚀 Deploy para Staging/Produção

### Opção 1: Vercel (Recomendado)

#### 1. Conectar Repositório

```bash
# Se ainda não tem repositório GitHub
# 1. Criar repo no GitHub: https://github.com/new
# 2. Adicionar remote:
git remote add origin https://github.com/SEU_USUARIO/v2k-app.git
git branch -M main
git push -u origin main
```

#### 2. Deploy no Vercel

1. Acesse: https://vercel.com/new
2. Import o repositório GitHub
3. Configure as Environment Variables (ver seção abaixo)
4. Deploy!

**Build Command:** `prisma generate && next build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`

### Opção 2: Deploy Manual

Se o projeto está apenas local:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🔐 Environment Variables para Produção

### Critical (OBRIGATÓRIAS)

```bash
# Database
DATABASE_URL="postgresql://user:pass@ballast.proxy.rlwy.net:37443/railway"

# Auth (GERAR NOVO!)
NEXTAUTH_SECRET="[GERAR COM: openssl rand -base64 32]"
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NEXT_PUBLIC_APP_URL="https://seu-dominio.vercel.app"

# Stripe (MUDAR PARA PRODUCTION!)
STRIPE_SECRET_KEY="sk_live_XXXX"  # Mudar de sk_test_ para sk_live_
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_XXXX"  # Mudar de pk_test_ para pk_live_
STRIPE_WEBHOOK_SECRET="whsec_XXXX"  # Criar webhook para produção

# Cloudinary (Verificar keys)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="abc123xyz"
```

### Optional (Recomendadas)

```bash
# Email
RESEND_API_KEY="re_XXXX"  # Para notificações

# Monitoring
SENTRY_DSN="https://xxx@sentry.io/xxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"

# Cache
REDIS_URL="redis://xxx"  # Upstash recomendado

# Cron
CRON_SECRET="[GERAR: openssl rand -base64 32]"
```

## 🔧 Configuração Pós-Deploy

### 1. Stripe Webhook

1. Acesse: https://dashboard.stripe.com/webhooks
2. Criar endpoint para: `https://seu-dominio.vercel.app/api/webhooks/stripe`
3. Selecionar eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copiar `Signing Secret` e adicionar em `STRIPE_WEBHOOK_SECRET`

### 2. Database Migrations

```bash
# Aplicar migrations em produção
npx prisma migrate deploy

# Seed data (opcional)
npx prisma db seed
```

### 3. Verificar Deploy

Testar endpoints críticos:
- ✅ `GET /` - Homepage carrega
- ✅ `GET /marketplace` - Lista tracks
- ✅ `POST /api/auth/signin` - Login funciona
- ✅ `GET /api/tracks` - API responde
- ✅ Database conectado (ver logs)

## 🧪 Smoke Tests

Execute estes testes manualmente após deploy:

### 1. Auth Flow (5 min)
- [ ] Signup com novo email
- [ ] Confirmar recebimento de email (se Resend configurado)
- [ ] Login com credenciais
- [ ] Logout
- [ ] Login novamente

### 2. Investment Flow (10 min)
- [ ] Browse marketplace
- [ ] Buscar uma música
- [ ] Clicar em track details
- [ ] Tentar investir (usar Stripe test card)
- [ ] Verificar portfolio após investimento

### 3. Artist Flow (10 min)
- [ ] Login como artista (artist@v2k.e2e)
- [ ] Acessar /artist/upload
- [ ] Fazer upload de track
- [ ] Verificar status PENDING

### 4. Admin Flow (10 min)
- [ ] Login como admin (admin@v2k.e2e)
- [ ] Acessar /admin
- [ ] Ver lista de tracks pendentes
- [ ] Aprovar uma track
- [ ] Verificar track LIVE no marketplace

### 5. Portfolio Flow (5 min)
- [ ] Ver holdings
- [ ] Ver transaction history
- [ ] Ver limit orders (se houver)
- [ ] Testar export CSV

## 📊 Monitoring Setup

### Vercel Analytics
1. Ativar em: https://vercel.com/seu-projeto/analytics
2. Grátis para hobby projects

### Sentry (Recomendado)
1. Criar conta: https://sentry.io
2. Criar projeto Next.js
3. Adicionar `SENTRY_DSN` nas env vars
4. Verificar errors no dashboard

### Railway Database
1. Acessar: https://railway.app
2. Verificar métricas de uso
3. Configurar alertas de storage

## 🚨 Rollback Strategy

Se algo der errado:

### Vercel
1. Acessar Deployments tab
2. Encontrar deploy anterior estável
3. Clicar "Promote to Production"
4. Imediato (< 1 min)

### Database
```bash
# Rollback última migration
npx prisma migrate resolve --rolled-back [migration-name]

# Ou restore backup do Railway
```

## 📝 Próximas Etapas Pós-Deploy

### Imediato (Dia 1)
- [ ] Monitorar logs por 1-2h
- [ ] Verificar error rates no Sentry
- [ ] Testar signup/login real
- [ ] Verificar Stripe transactions

### Primeira Semana
- [ ] Coletar feedback usuários beta
- [ ] Ajustar rate limits se necessário
- [ ] Otimizar queries lentas (ver logs)
- [ ] Adicionar mais seed data se necessário

### Primeira Mês
- [ ] Analisar métricas de uso
- [ ] Implementar features A/B testing
- [ ] Otimizar bundle size
- [ ] Configurar CDN para assets estáticos
- [ ] Implementar cache Redis (se tráfego alto)

## 🎯 Métricas de Sucesso

### Performance
- **Lighthouse Score:** > 90
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **API Response Time:** < 500ms (p95)

### Reliability
- **Uptime:** 99.9%
- **Error Rate:** < 0.1%
- **Database Queries:** < 100ms (p95)

### Business
- **Signup Conversion:** Track com analytics
- **Investment Volume:** Monitor via Stripe
- **User Retention:** D1, D7, D30

## 🐛 Troubleshooting Comum

### Build Fails
```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Error
- Verificar `DATABASE_URL` está correto
- Verificar Railway database está up
- Testar conexão: `npx prisma db pull`

### Stripe Webhook Fails
- Verificar endpoint está acessível
- Verificar `STRIPE_WEBHOOK_SECRET` está correto
- Ver logs em Stripe Dashboard > Webhooks > Attempts

### Auth Not Working
- Verificar `NEXTAUTH_SECRET` está setado
- Verificar `NEXTAUTH_URL` match o domínio
- Limpar cookies do browser

## 📞 Suporte

- **Vercel:** https://vercel.com/support
- **Stripe:** https://support.stripe.com
- **Railway:** https://railway.app/help
- **Documentação:** Ver `/docs` no repo

---

## ✅ Checklist Final

Antes de considerar deploy completo:

- [ ] Todas env vars configuradas
- [ ] Stripe production keys ativadas
- [ ] Webhook configurado e testado
- [ ] Smoke tests passando
- [ ] Monitoring configurado
- [ ] Backup strategy definida
- [ ] Rollback strategy testada
- [ ] Team notificado sobre go-live

**Status:** 🟡 Aguardando configuração de production keys

**Deploy estimado:** 2-3h (config) + 1h (testes) = 3-4h total
