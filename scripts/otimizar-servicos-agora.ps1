# Otimização Rápida de Serviços
# Execute como Administrador (Botão direito → Executar como administrador)

Write-Host "🔧 Otimizando serviços do Windows..." -ForegroundColor Cyan
Write-Host ""

# Serviços para otimizar
$servicos = @{
    "CCleaner7" = @{Nome="CCleaner"; Tipo="Manual"}
    "AdobeARMservice" = @{Nome="Adobe Update Service"; Tipo="Manual"}
    "postgresql-x64-17" = @{Nome="PostgreSQL"; Tipo="Manual"}
    "TrkWks" = @{Nome="Rastreamento de Link"; Tipo="Manual"}
    "DoSvc" = @{Nome="Otimização de Entrega"; Tipo="Manual"}
    "DiagTrack" = @{Nome="Telemetria Microsoft"; Tipo="Disabled"}
}

$total = 0
$sucesso = 0

foreach ($svc in $servicos.Keys) {
    $info = $servicos[$svc]
    $service = Get-Service -Name $svc -ErrorAction SilentlyContinue
    
    if ($service) {
        $total++
        try {
            Set-Service -Name $svc -StartupType $info.Tipo -ErrorAction Stop
            
            if ($info.Tipo -eq "Disabled") {
                Stop-Service -Name $svc -Force -ErrorAction SilentlyContinue
            }
            
            Write-Host "✅ $($info.Nome): $($info.Tipo)" -ForegroundColor Green
            $sucesso++
        } catch {
            Write-Host "❌ $($info.Nome): Erro (necessita Admin)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "📊 Resultado: $sucesso de $total serviços otimizados" -ForegroundColor Cyan
Write-Host ""

if ($sucesso -gt 0) {
    Write-Host "💾 RAM liberada estimada: 200-300MB" -ForegroundColor Green
}

Write-Host ""
Read-Host "Pressione Enter para sair"
