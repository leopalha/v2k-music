'use client';

import { Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/lib/pwa/install-prompt';

export function InstallButton() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
        <Check className="w-4 h-4 text-green-500" />
        <span className="text-sm text-green-500">App instalado</span>
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <Button 
      onClick={promptInstall}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Instalar App</span>
    </Button>
  );
}
