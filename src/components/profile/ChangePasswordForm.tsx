"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { toast } from "@/components/ui/use-toast";
import { Lock, Loader2 } from "lucide-react";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem", "Por favor, confirme a nova senha corretamente");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Senha muito curta", "A senha deve ter no mínimo 8 caracteres");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao alterar senha");
      }

      toast.success("Senha alterada com sucesso!", "Sua senha foi atualizada");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(
        "Erro ao alterar senha",
        error instanceof Error ? error.message : "Tente novamente"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="password"
        label="Senha Atual"
        placeholder="Digite sua senha atual"
        value={currentPassword}
        onChange={setCurrentPassword}
        required
        disabled={isLoading}
      />
      <Input
        type="password"
        label="Nova Senha"
        placeholder="Digite sua nova senha (mínimo 8 caracteres)"
        value={newPassword}
        onChange={setNewPassword}
        required
        minLength={8}
        disabled={isLoading}
      />
      <Input
        type="password"
        label="Confirmar Nova Senha"
        placeholder="Digite novamente sua nova senha"
        value={confirmPassword}
        onChange={setConfirmPassword}
        required
        disabled={isLoading}
      />

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isLoading ? "Alterando..." : "Alterar Senha"}
      </Button>
    </form>
  );
}
