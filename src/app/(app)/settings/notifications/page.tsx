"use client";

import { AppLayout, PageHeader } from "@/components/layout";
import { NotificationPreferences } from "@/components/profile";
import { Bell } from "lucide-react";

export default function NotificationSettingsPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <PageHeader
          title="Configurações de Notificação"
          subtitle="Personalize como você deseja receber notificações"
        />

        <NotificationPreferences />
      </div>
    </AppLayout>
  );
}
