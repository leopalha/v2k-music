'use client';

import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="flex flex-col items-center max-w-md text-center space-y-6">
        <div className="p-6 bg-bg-elevated rounded-full">
          <WifiOff className="w-16 h-16 text-text-secondary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Você está offline</h1>
          <p className="text-text-secondary">
            Parece que você perdeu a conexão com a internet.
            Verifique sua conexão e tente novamente.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button onClick={handleRetry} fullWidth>
            Tentar Novamente
          </Button>

          <p className="text-sm text-text-secondary">
            Algumas funcionalidades podem estar disponíveis offline
          </p>
        </div>

        <div className="pt-6 border-t border-border-default w-full">
          <p className="text-xs text-text-secondary">
            💡 Dica: Adicione V2K Music à sua tela inicial para acesso rápido
          </p>
        </div>
      </div>
    </div>
  );
}
