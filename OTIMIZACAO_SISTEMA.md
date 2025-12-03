# 🔧 Otimização do Sistema - Auditoria de Processos

**Data:** 2025-12-03  
**RAM Total:** 32GB  
**Problema:** Uso de 100% RAM + PageFile ativo (8.9GB)

---

## 🔍 Análise dos Processos Identificados

### ✅ PROCESSOS NORMAIS (Manter)
- **Warp Terminal** - 1979MB (sua ferramenta de trabalho)
- **Claude Desktop** - 517MB (AI assistant)
- **VS Code** - ~1.5GB total (15+ processos) - IDE em uso
- **Windows Explorer** - 384MB (sistema operacional)
- **Windows Defender** - 360MB (antivírus)

### ⚠️ PROCESSOS SUSPEITOS/DESNECESSÁRIOS

#### 1. **PJeOffice Pro** - 86MB ❌
```
Processo: javaw.exe
Path: C:\Program Files\PJeOffice Pro\jre\bin\javaw.exe
Status: DESNECESSÁRIO se você não usa regularmente
```
**O que é:** Software jurídico (TJ-SP) que roda em Java  
**Problema:** Consome RAM mesmo quando não está em uso  
**Ação:** Desabilitar inicialização automática

#### 2. **Adobe Acrobat Sync** - 24MB (2 processos) ⚠️
```
Processo: AdobeCollabSync.exe (2x)
Path: C:\Program Files\Adobe\Acrobat DC\Acrobat\
Status: DESNECESSÁRIO se você não usa colaboração em PDFs
```
**O que é:** Sincronização de documentos Adobe na nuvem  
**Problema:** Roda em background constantemente  
**Ação:** Desabilitar sync ou desinstalar Acrobat (usar alternativa)

#### 3. **Spybot Search & Destroy** - 10MB ⚠️
```
Processo: SDTray.exe
Path: C:\Program Files (x86)\Spybot - Search & Destroy 2\
Status: REDUNDANTE (você já tem Windows Defender)
```
**O que é:** Antimalware/antispyware  
**Problema:** Conflito com Windows Defender  
**Ação:** DESINSTALAR (Windows Defender é suficiente)

#### 4. **AnyDesk** - 7MB ⚠️
```
Processo: AnyDesk.exe
Path: C:\Program Files (x86)\AnyDesk\
Status: DESNECESSÁRIO se não usa acesso remoto
```
**O que é:** Acesso remoto ao computador  
**Problema:** Vulnerabilidade de segurança se não usado  
**Ação:** Desabilitar inicialização ou desinstalar

#### 5. **Python (3 processos)** - 15MB ⚠️
```
Processo: python.exe (3x)
Path: C:\Python313\python.exe
Comando: bullmq_worker.py (3 instâncias)
Started: 17:17, 21:30, 22:55 (02/12/2025)
Status: WORKERS EM BACKGROUND - pode ser de projeto anterior
```
**O que é:** BullMQ workers (fila de mensagens Redis/Node.js)  
**Problema:** 3 workers rodando sem supervisão, script não encontrado em C:\Python313\  
**Ação:** 
- Se não está usando: fechar todos
- Se é do projeto V2K: mover para pasta projeto
- Se é de outro projeto: documentar ou desabilitar

#### 6. **Git Bash (6 processos)** - 10MB ⚠️
```
Processo: bash.exe (6x)
Path: C:\Program Files\Git\bin\bash.exe
Status: LEAK DE PROCESSOS - shells não fechados
```
**O que é:** Terminais Git Bash abertos  
**Problema:** Você tem 6 shells bash rodando simultaneamente  
**Ação:** Fechar shells desnecessários

#### 7. **msedgewebview2 (10+ processos)** - ~900MB ❌
```
Processo: msedgewebview2.exe (múltiplos)
Path: C:\Program Files (x86)\Microsoft\EdgeWebView2\
Status: EXCESSIVO - usado por apps Electron
```
**O que é:** Engine Chromium usado por apps desktop  
**Problema:** Muitas instâncias rodando (Claude, VS Code, etc)  
**Ação:** Reiniciar apps para limpar instâncias órfãs

---

## 🚀 PLANO DE AÇÃO IMEDIATO

### Fase 1: Limpeza de Processos (Agora - 5min)

```powershell
# 1. Fechar Git Bash desnecessários (deixar só 1-2)
Get-Process bash | Sort-Object StartTime | Select-Object -First 4 | Stop-Process -Force

# 2. Fechar Python workers (bullmq_worker.py)
# ATENÇÃO: Se você está usando BullMQ workers, NÃO execute este comando
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# 3. Verificar se AnyDesk está rodando (se não usa, fechar)
Stop-Process -Name AnyDesk -Force -ErrorAction SilentlyContinue
```

### Fase 2: Desabilitar Inicialização Automática (10min)

**Usar Task Manager (Ctrl + Shift + Esc):**

1. Aba "Inicializar" (Startup)
2. Desabilitar os seguintes:
   - [ ] **PJeOffice Pro** - DESABILITAR
   - [ ] **Adobe Acrobat Synchronizer** - DESABILITAR
   - [ ] **PDF24** - DESABILITAR (se não usa)
   - [ ] **Google Drive File Stream** - AVALIAR (se não usa muito)
   - [ ] **Docker Desktop** - DESABILITAR (iniciar manualmente quando precisar)
   - [ ] **AnyDesk** - DESABILITAR

**Manter habilitado:**
- ✅ OneDrive (se usa)
- ✅ Claude (seu AI assistant)
- ✅ SecurityHealth (Windows Defender)
- ✅ Logitech Download Assistant (se tem periféricos Logitech)

### Fase 3: Desinstalar Software Desnecessário (15min)

**Apps para REMOVER:**

1. **Spybot Search & Destroy 2** ❌
   - Redundante com Windows Defender
   - Pode causar conflitos
   - Libera: ~100-200MB RAM

2. **AnyDesk** (se não usa) ❌
   - Risco de segurança
   - Libera: ~50MB RAM

3. **Adobe Acrobat DC** (considerar) ⚠️
   - Substituir por alternativa leve
   - Opções: SumatraPDF, PDF24 (já instalado), Edge/Chrome
   - Libera: ~500MB-1GB RAM

4. **PJeOffice Pro** (se não usa mais) ❌
   - Software jurídico específico TJ-SP
   - Libera: ~300-500MB RAM

**Como desinstalar:**
```
Configurações → Apps → Apps instalados → Pesquisar → Desinstalar
```

### Fase 4: Otimizar Serviços do Windows (15min)

**Serviços SEGUROS para desabilitar:**

```powershell
# Executar como Administrador

# 1. CCleaner Service (se não usa agendamento)
Set-Service -Name CCleaner7 -StartupType Manual

# 2. Adobe ARM Service (atualizações Adobe)
Set-Service -Name AdobeARMservice -StartupType Manual

# 3. PostgreSQL (se não usa localmente)
Set-Service -Name postgresql-x64-17 -StartupType Manual

# 4. Cliente de rastreamento de link distribuído (raramente usado)
Set-Service -Name TrkWks -StartupType Manual

# 5. Experiências do Usuário Conectado e Telemetria (privacidade)
Set-Service -Name DiagTrack -StartupType Disabled

# 6. Otimização de Entrega (Windows Update P2P)
Set-Service -Name DoSvc -StartupType Manual
```

**⚠️ NÃO DESABILITAR:**
- WinDefend (Windows Defender)
- Dnscache (DNS)
- Dhcp (Rede)
- Audiosrv (Áudio)
- RpcSs (Sistema crítico)
- EventLog (Logs)

### Fase 5: Configurações do Windows (10min)

#### A. Desabilitar Apps em Background

```
Configurações → Privacidade e Segurança → Apps em segundo plano
→ Desabilitar apps que não precisa
```

#### B. Ajustar Efeitos Visuais

```
Painel de Controle → Sistema → Configurações avançadas do sistema
→ Desempenho → Configurações
→ Selecionar "Ajustar para obter melhor desempenho"
→ Marcar apenas:
  ✅ Suavizar bordas de fontes na tela
  ✅ Mostrar conteúdo da janela ao arrastar
  ✅ Mostrar miniaturas em vez de ícones
```

#### C. Reduzir PageFile (após limpeza)

```
Painel de Controle → Sistema → Configurações avançadas do sistema
→ Desempenho → Configurações → Avançado → Memória virtual
→ Personalizar tamanho:
  Tamanho inicial: 4096 MB (4GB)
  Tamanho máximo: 8192 MB (8GB)
```

---

## 📊 ESTIMATIVA DE LIBERAÇÃO DE RAM

| Item | RAM Liberada |
|------|--------------|
| Fechar Git Bash órfãos | ~8MB |
| Fechar Python órfãos | ~10MB |
| Desabilitar PJeOffice Pro | ~300MB |
| Remover Adobe Sync | ~100MB |
| Desinstalar Spybot | ~200MB |
| Desabilitar AnyDesk | ~50MB |
| Otimizar serviços | ~200-500MB |
| Reduzir apps background | ~500MB-1GB |
| **TOTAL ESTIMADO** | **~1.5-2.5GB** |

**Meta:** Uso de RAM < 70% (22GB de 32GB) em idle

---

## 🛡️ INVESTIGAÇÕES NECESSÁRIAS

### 1. Python em Background
```powershell
# Ver o que os processos Python estão executando
Get-Process python | Select-Object Id, Path
Get-WmiObject Win32_Process -Filter "name='python.exe'" | Select-Object CommandLine
```

### 2. Verificar Malware (Precaução)
```powershell
# Scan rápido Windows Defender
Start-MpScan -ScanType QuickScan

# Ver processos sem assinatura digital
Get-Process | Where-Object {$_.Path -and !(Get-AuthenticodeSignature $_.Path).IsOSBinary} | Select-Object Name, Path
```

---

## 🔄 MANUTENÇÃO PERIÓDICA

### Diária (30s)
```powershell
# Verificar RAM ao iniciar o dia
Get-Process | Sort-Object WS -Descending | Select-Object -First 10 Name, @{N='RAM(GB)';E={[math]::Round($_.WS/1GB,2)}}
```

### Semanal (5min)
- Reiniciar sistema (limpa PageFile)
- Rodar CCleaner (temp files)
- Verificar Task Manager → Startup

### Mensal (30min)
- Desinstalar apps não usados
- Atualizar drivers
- Scan completo antivírus

---

## 📝 CHECKLIST DE EXECUÇÃO

**Hoje (após reiniciar):**
- [ ] Fase 1: Fechar processos órfãos (5min)
- [ ] Fase 2: Desabilitar startups (10min)
- [ ] Fase 3: Desinstalar Spybot (5min)
- [ ] Fase 4: Otimizar 3-4 serviços (10min)
- [ ] Fase 5: Ajustar efeitos visuais (5min)

**Depois (quando tiver tempo):**
- [ ] Avaliar desinstalação Adobe Acrobat
- [ ] Avaliar desinstalação PJeOffice Pro
- [ ] Investigar processos Python
- [ ] Configurar PageFile customizado

**Tempo total:** ~35-50 minutos

---

## ⚡ COMANDOS RÁPIDOS DE MONITORAMENTO

```powershell
# Ver top 10 consumidores RAM
Get-Process | Sort WS -Desc | Select -First 10 Name,@{N='RAM(GB)';E={[math]::Round($_.WS/1GB,2)}}

# Ver uso total RAM
$os = Get-CimInstance Win32_OperatingSystem
$totalRAM = [math]::Round($os.TotalVisibleMemorySize/1MB,2)
$freeRAM = [math]::Round($os.FreePhysicalMemory/1MB,2)
$usedRAM = $totalRAM - $freeRAM
$percentUsed = [math]::Round(($usedRAM/$totalRAM)*100,1)
Write-Host "RAM: $usedRAM GB / $totalRAM GB ($percentUsed%)"

# Ver PageFile
Get-CimInstance Win32_PageFileUsage | Select Name, AllocatedBaseSize, CurrentUsage, PeakUsage

# Ver serviços rodando desnecessários
Get-Service | Where {$_.Status -eq 'Running' -and $_.Name -match 'Adobe|CCleaner|postgres'} | Select DisplayName, Status
```

---

## 🎯 META FINAL

**Estado Atual:**
- RAM: 32GB usados (100%)
- PageFile: 8.9GB ativo
- Performance: CRÍTICA

**Estado Ideal (após otimização):**
- RAM: 18-22GB usados (60-70%)
- PageFile: <2GB ou desativado
- Performance: EXCELENTE

**Projetos abertos simultaneamente:**
- VS Code: ~1.5GB
- Warp Terminal: ~2GB
- Claude Desktop: ~500MB
- Node.js (dev server): ~500MB
- Chrome/Edge (documentação): ~2GB
- **Total desenvolvimento:** ~6.5GB
- **Sistema + Apps:** ~15GB
- **Buffer:** ~10GB livre ✅

---

**Próxima ação:** Executar Fase 1 após reiniciar o sistema.
