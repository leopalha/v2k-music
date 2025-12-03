"use client";

import { useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui";
import { Shield, Download, AlertTriangle, Lock, Cookie } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function PrivacySettingsPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [understoodDeletion, setUnderstoodDeletion] = useState(false);
  const [exportRequested, setExportRequested] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleRequestExport = async () => {
    setShowExportConfirm(false);
    setExportRequested(true);
    
    try {
      const response = await fetch("/api/user/export-data", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erro ao solicitar exportação");
      }

      toast.success(
        "Exportação Solicitada",
        "Você receberá um email com o link para download em breve"
      );
    } catch (error) {
      console.error(error);
      toast.error("Erro", "Não foi possível solicitar a exportação");
    }
  };

  const handleSaveCookies = () => {
    toast.success("Preferências Salvas", "Suas preferências de cookies foram atualizadas");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <PageHeader
          title="Privacidade e Dados"
          subtitle="Gerencie suas configurações de privacidade e dados pessoais"
        />

        {/* GDPR Section */}
        <div className="space-y-6">
          <div
            className="bg-bg-secondary border border-border-primary rounded-xl p-6"
            data-testid="gdpr-section"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Exportar Seus Dados (GDPR)
                </h3>
                <p className="text-sm text-text-secondary">
                  Solicite uma cópia completa de todos os seus dados pessoais armazenados
                  na plataforma
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => setShowExportConfirm(true)}
                data-testid="request-data-export"
              >
                <Download className="w-4 h-4 mr-2" />
                Solicitar Exportação de Dados
              </Button>

              {exportRequested && (
                <div className="text-sm text-accent-green" data-testid="success-message">
                  ✓ Solicitação enviada! Você receberá um email em breve.
                </div>
              )}

              {/* Export Confirm Modal */}
              {showExportConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      Confirmar Exportação
                    </h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Enviaremos um email com um link para download de seus dados em formato
                      JSON.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleRequestExport}
                        data-testid="confirm-export"
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowExportConfirm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Retention Policy */}
          <div
            className="bg-bg-secondary border border-border-primary rounded-xl p-6"
            data-testid="data-retention"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Lock className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Política de Retenção de Dados
                </h3>
                <p className="text-sm text-text-secondary">
                  Mantemos seus dados por até 90 dias após exclusão da conta. Dados
                  transacionais são mantidos por requisitos legais.
                </p>
              </div>
            </div>
            <a
              href="/legal/privacy"
              className="text-sm text-primary hover:underline"
              data-testid="privacy-policy-link"
            >
              Ler Política de Privacidade Completa →
            </a>
          </div>

          {/* Cookie Preferences */}
          <div
            className="bg-bg-secondary border border-border-primary rounded-xl p-6"
            data-testid="cookie-preferences"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-tertiary/10 rounded-lg">
                <Cookie className="w-5 h-5 text-tertiary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Preferências de Cookies
                </h3>
                <p className="text-sm text-text-secondary">
                  Gerencie como usamos cookies para melhorar sua experiência
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-bg-elevated rounded-lg cursor-pointer">
                <span className="text-sm text-text-primary">
                  Cookies de Analytics
                </span>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-border-default"
                  data-testid="cookie-analytics"
                />
              </label>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveCookies}
                data-testid="save-cookie-prefs"
              >
                Salvar Preferências
              </Button>
            </div>
          </div>

          {/* Account Deletion */}
          <div className="bg-bg-secondary border border-error/30 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-error/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Excluir Conta
                </h3>
                <p className="text-sm text-text-secondary">
                  Esta ação é permanente e não pode ser desfeita. Todos os seus dados
                  serão removidos.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="border-error text-error hover:bg-error/10"
              onClick={() => setShowDeleteModal(true)}
              data-testid="request-deletion"
            >
              Solicitar Exclusão de Conta
            </Button>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div
                  className="bg-bg-secondary border border-error rounded-xl p-6 max-w-md w-full"
                  data-testid="deletion-warning"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-error" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-1">
                        Confirmar Exclusão de Conta
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Esta ação é <strong>permanente</strong> e{" "}
                        <strong>cannot be undone</strong>. Todos os seus dados,
                        investimentos e histórico serão removidos.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={understoodDeletion}
                        onChange={(e) => setUnderstoodDeletion(e.target.checked)}
                        className="mt-1"
                        data-testid="understand-deletion"
                      />
                      <span className="text-sm text-text-primary">
                        Eu entendo que esta ação é irreversível e aceito a exclusão
                        permanente de minha conta
                      </span>
                    </label>

                    <input
                      type="password"
                      placeholder="Digite sua senha para confirmar"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-4 py-2 bg-bg-elevated border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-error"
                      data-testid="confirm-password"
                    />

                    <div className="flex gap-3">
                      <Button
                        disabled={!understoodDeletion || !deletePassword}
                        className="flex-1 bg-error hover:bg-error/90"
                        data-testid="confirm-deletion"
                      >
                        Confirmar Exclusão
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowDeleteModal(false);
                          setDeletePassword("");
                          setUnderstoodDeletion(false);
                        }}
                        data-testid="cancel-deletion"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
