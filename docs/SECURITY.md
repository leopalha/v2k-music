# Security Guidelines

## Implementações de Segurança

### 1. Content Security Policy (CSP)
Configurado em `next.config.ts`:
- `default-src 'self'` - Apenas recursos do mesmo domínio
- `script-src` - Permite Stripe e scripts necessários
- `connect-src` - APIs permitidas (Stripe, Railway, Upstash, Sentry)
- `frame-src` - Apenas Stripe frames

### 2. Security Headers
- **HSTS**: Força HTTPS por 2 anos
- **X-Frame-Options**: Previne clickjacking
- **X-Content-Type-Options**: Previne MIME sniffing
- **X-XSS-Protection**: Ativa proteção XSS do browser
- **Referrer-Policy**: Controla informações de referência
- **Permissions-Policy**: Desabilita APIs não usadas

### 3. Input Sanitization
Biblioteca em `src/lib/security/sanitize.ts`:
- `sanitizeString()` - Remove HTML e scripts
- `sanitizeEmail()` - Valida formato de email
- `sanitizeCPF()` - Valida CPF brasileiro
- `sanitizeURL()` - Valida URLs
- `sanitizeJSON()` - Sanitiza objetos JSON
- `sanitizeObjectKeys()` - Previne prototype pollution

**Uso:**
```ts
import { sanitizeString, sanitizeEmail } from '@/lib/security/sanitize';

const clean = sanitizeString(userInput);
const email = sanitizeEmail(formData.email);
```

### 4. Audit Logging
Sistema em `src/lib/security/audit-log.ts`:
- Registra ações sensíveis (auth, trading, payments)
- Captura IP e User-Agent
- Log em console (dev) e preparado para DB/monitoring

**Uso:**
```ts
import { logAuthEvent, AuditAction } from '@/lib/security/audit-log';

await logAuthEvent(
  AuditAction.LOGIN,
  userId,
  ipAddress,
  userAgent,
  'SUCCESS'
);
```

### 5. Rate Limiting
Implementado em Sprint 51 com Redis/Upstash:
- Sliding window algorithm
- Configurável por endpoint
- Graceful fallback sem Redis

### 6. SQL Injection Prevention
- **Prisma ORM**: Previne SQL injection automaticamente
- Queries parametrizadas
- Never use raw SQL com user input

## TODOs (Próximas implementações)

### Prioridade Alta
- [ ] CSRF tokens em forms críticos
- [ ] Session timeout e refresh tokens
- [ ] 2FA / MFA para usuários premium
- [ ] API key rotation system

### Prioridade Média
- [ ] Penetration testing
- [ ] Audit logs em database dedicada
- [ ] IP whitelist para API keys
- [ ] Account lockout após tentativas falhas

### Prioridade Baixa
- [ ] Biometric authentication
- [ ] Hardware security keys (WebAuthn)
- [ ] Advanced threat detection

## Checklist de Segurança

### Para Desenvolvedores
- [ ] Sanitizar todos os inputs de usuário
- [ ] Usar Prisma para queries (nunca raw SQL)
- [ ] Validar permissões em todas as APIs
- [ ] Log ações sensíveis no audit log
- [ ] Nunca expor secrets no código
- [ ] Rate limiting em endpoints públicos

### Para Deploy
- [ ] Configurar variáveis de ambiente
- [ ] Habilitar HTTPS (Vercel/Railway fazem automaticamente)
- [ ] Configurar Sentry DSN
- [ ] Testar CSP headers
- [ ] Verificar rate limits funcionando

## Reportar Vulnerabilidades

Se encontrar uma vulnerabilidade de segurança:
1. **NÃO** abra issue pública
2. Envie email para: security@v2kmusic.com (se configurado)
3. Inclua descrição detalhada e steps para reproduzir
4. Aguarde resposta em até 48h

## Recursos
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist#security)
- [Prisma Security](https://www.prisma.io/docs/guides/database/prototyping-schema-db-push#warnings-and-data-loss)
