# Testing Infrastructure

Este documento descreve como rodar e manter os testes do projeto.

## Unit & Integration (Jest)

### Rodar testes:
```
npm test
```

### Watch mode:
```
npm run test:watch
```

### Coverage report:
```
npm run test:coverage
```
Gera a pasta `coverage/` com relatório HTML.

### Estrutura dos testes
- Arquivos em `__tests__/` próximos ao código
- Sufixos: `.test.ts(x)` ou `.spec.ts(x)`

### Mocks Globais
Configurados em `jest.setup.ts`:
- NextAuth (`useSession`, `signIn`, `signOut`)
- Prisma Client (`@/lib/db/prisma`)
- Redis Cache (`@/lib/cache/redis`)
- Router do Next (`next/navigation`)

## E2E (Playwright)

### Rodar testes E2E:
```
npm run test:e2e
```
Inicia o servidor de desenvolvimento (porta 5000) e executa os testes.

### UI Mode (debug):
```
npm run test:e2e:ui
```

### Relatório HTML:
```
npx playwright show-report
```

### Configuração
- Arquivo: `playwright.config.ts`
- Base URL: `http://localhost:5000`
- Browsers: Chromium, Firefox, WebKit

## CI (GitHub Actions)

Workflow: `.github/workflows/tests.yml`
- Job `unit`: Jest + coverage
- Job `e2e`: Playwright (instala browsers e executa)
- Artefatos: `coverage/` e `playwright-report/`

## Boas Práticas
- Foque em casos de uso críticos (auth, trading, portfolio)
- Evite dependências externas (mocks ao invés de DB real)
- Testes E2E devem cobrir o happy path e smoke tests
- Mantenha testes rápidos e determinísticos

## Troubleshooting
- "Request is not defined" em testes de API: use mocks de `next/server` e importe dinamicamente as rotas
- Falhas flakey no Playwright: rode com `--headed` e `--debug` e verifique traces
- Diferenças de número com floats: use `toBeCloseTo`
