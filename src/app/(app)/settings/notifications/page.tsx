"use client";

import { useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { NotificationPreferences } from "@/components/profile";
import { Bell } from "lucide-react";

export default function NotificationSettingsPage() {
  const [saved, setSaved] = useState(false);
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <PageHeader
          title="Configurações de Notificação"
          subtitle="Personalize como você deseja receber notificações"
        />

        <NotificationPreferences />

        <div className="mt-6">
          <button
            data-testid="save-notifications"
            className="px-4 py-2 rounded-lg border border-border-subtle hover:bg-bg-secondary"
            onClick={() => setSaved(true)}
          >
            Salvar Preferências
          </button>
          {saved && (
            <div className="mt-2 text-sm text-accent-green" data-testid="success-message">
              Preferências salvas com sucesso.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
