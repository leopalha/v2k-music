# Script de Otimização Rápida do Sistema
# Data: 2025-12-03
# Uso: Execute como Administrador

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  OTIMIZAÇÃO DO SISTEMA - V2K    " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está rodando como Admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  ATENÇÃO: Este script precisa ser executado como Administrador!" -ForegroundColor Yellow
    Write-Host "   Clique com botão direito → 'Executar como administrador'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit
}

Write-Host "✅ Executando como Administrador" -ForegroundColor Green
Write-Host ""

# ============================================
# FASE 1: ANÁLISE INICIAL
# ============================================

Write-Host "📊 FASE 1: Analisando uso de memória..." -ForegroundColor Yellow
Write-Host ""

$os = Get-CimInstance Win32_OperatingSystem
$totalRAM = [math]::Round($os.TotalVisibleMemorySize/1MB,2)
$freeRAM = [math]::Round($os.FreePhysicalMemory/1MB,2)
$usedRAM = $totalRAM - $freeRAM
$percentUsed = [math]::Round(($usedRAM/$totalRAM)*100,1)

Write-Host "RAM Total: $totalRAM GB"
Write-Host "RAM Usada: $usedRAM GB ($percentUsed%)" -ForegroundColor $(if($percentUsed -gt 80){"Red"}elseif($percentUsed -gt 60){"Yellow"}else{"Green"})
Write-Host "RAM Livre: $freeRAM GB"
Write-Host ""

# Top 10 consumidores
Write-Host "🔝 Top 10 Consumidores de RAM:" -ForegroundColor Cyan
Get-Process | Sort-Object WS -Descending | Select-Object -First 10 | 
    ForEach-Object { 
        $ramMB = [math]::Round($_.WS/1MB,0)
        Write-Host "  $($_.Name): ${ramMB}MB"
    }
Write-Host ""

# ============================================
# FASE 2: LIMPEZA DE PROCESSOS ÓRFÃOS
# ============================================

Write-Host "🧹 FASE 2: Limpando processos órfãos..." -ForegroundColor Yellow
Write-Host ""

# Git Bash órfãos (manter apenas 2 mais recentes)
$bashProcesses = Get-Process bash -ErrorAction SilentlyContinue
if ($bashProcesses) {
    $bashCount = $bashProcesses.Count
    if ($bashCount -gt 2) {
        Write-Host "  Fechando Git Bash órfãos ($bashCount processos, mantendo 2)..."
        $bashProcesses | Sort-Object StartTime | Select-Object -First ($bashCount - 2) | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Git Bash órfãos fechados" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  Git Bash: $bashCount processos (OK)" -ForegroundColor Gray
    }
}

# Python workers (BullMQ)
$pythonProcesses = Get-Process python -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    $pythonCount = $pythonProcesses.Count
    Write-Host "  ⚠️  Python workers detectados: $pythonCount processos" -ForegroundColor Yellow
    Write-Host "     Comando: bullmq_worker.py" -ForegroundColor Gray
    
    $closeWorkers = Read-Host "     Fechar workers Python? (s/N)"
    if ($closeWorkers -eq 's' -or $closeWorkers -eq 'S') {
        $pythonProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Python workers fechados" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Python workers mantidos" -ForegroundColor Gray
    }
}

# AnyDesk
$anydesk = Get-Process AnyDesk -ErrorAction SilentlyContinue
if ($anydesk) {
    Write-Host "  Fechando AnyDesk..."
    Stop-Process -Name AnyDesk -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ AnyDesk fechado" -ForegroundColor Green
}

Write-Host ""

# ============================================
# FASE 3: OTIMIZAÇÃO DE SERVIÇOS
# ============================================

Write-Host "⚙️  FASE 3: Otimizando serviços do Windows..." -ForegroundColor Yellow
Write-Host ""

$servicesToOptimize = @(
    @{Name="CCleaner7"; Display="CCleaner"}
    @{Name="AdobeARMservice"; Display="Adobe Update Service"}
    @{Name="postgresql-x64-17"; Display="PostgreSQL"}
    @{Name="TrkWks"; Display="Rastreamento de Link Distribuído"}
    @{Name="DiagTrack"; Display="Telemetria Microsoft"}
    @{Name="DoSvc"; Display="Otimização de Entrega"}
)

foreach ($svc in $servicesToOptimize) {
    $service = Get-Service -Name $svc.Name -ErrorAction SilentlyContinue
    if ($service) {
        if ($service.Status -eq 'Running') {
            Write-Host "  Otimizando: $($svc.Display)..."
            
            # DiagTrack → Disabled, outros → Manual
            $startupType = if ($svc.Name -eq 'DiagTrack') { 'Disabled' } else { 'Manual' }
            
            Set-Service -Name $svc.Name -StartupType $startupType -ErrorAction SilentlyContinue
            
            if ($svc.Name -eq 'DiagTrack') {
                Stop-Service -Name $svc.Name -Force -ErrorAction SilentlyContinue
            }
            
            Write-Host "  ✅ $($svc.Display): $startupType" -ForegroundColor Green
        }
    }
}

Write-Host ""

# ============================================
# FASE 4: ANÁLISE FINAL
# ============================================

Write-Host "📊 FASE 4: Analisando resultados..." -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 2

$osAfter = Get-CimInstance Win32_OperatingSystem
$totalRAMAfter = [math]::Round($osAfter.TotalVisibleMemorySize/1MB,2)
$freeRAMAfter = [math]::Round($osAfter.FreePhysicalMemory/1MB,2)
$usedRAMAfter = $totalRAMAfter - $freeRAMAfter
$percentUsedAfter = [math]::Round(($usedRAMAfter/$totalRAMAfter)*100,1)

Write-Host "ANTES:" -ForegroundColor Cyan
Write-Host "  RAM Usada: $usedRAM GB ($percentUsed%)"
Write-Host ""
Write-Host "DEPOIS:" -ForegroundColor Cyan
Write-Host "  RAM Usada: $usedRAMAfter GB ($percentUsedAfter%)" -ForegroundColor $(if($percentUsedAfter -gt 80){"Red"}elseif($percentUsedAfter -gt 60){"Yellow"}else{"Green"})

$liberado = $usedRAM - $usedRAMAfter
if ($liberado -gt 0) {
    Write-Host "  RAM Liberada: $([math]::Round($liberado,2)) GB" -ForegroundColor Green
} else {
    Write-Host "  RAM Liberada: 0 GB (pode precisar reiniciar)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# RECOMENDAÇÕES
# ============================================

Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""

if ($percentUsedAfter -gt 80) {
    Write-Host "⚠️  RAM ainda crítica! Ações recomendadas:" -ForegroundColor Yellow
    Write-Host "  1. Reiniciar o sistema para limpar PageFile"
    Write-Host "  2. Desinstalar Spybot Search & Destroy"
    Write-Host "  3. Avaliar desinstalação de Adobe Acrobat DC"
    Write-Host "  4. Verificar programas de inicialização (Task Manager)"
} elseif ($percentUsedAfter -gt 60) {
    Write-Host "✅ RAM em nível aceitável, mas pode melhorar:" -ForegroundColor Yellow
    Write-Host "  1. Considere reiniciar periodicamente"
    Write-Host "  2. Verifique Task Manager → Inicializar"
} else {
    Write-Host "✅ RAM em nível excelente!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📖 Para mais otimizações, consulte:" -ForegroundColor Cyan
Write-Host "   OTIMIZACAO_SISTEMA.md"
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Otimização concluída!          " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Read-Host "Pressione Enter para sair"
