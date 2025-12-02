"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  // Validate password strength
  const isPasswordValid = newPassword.length >= 8;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  // Check if token exists on mount
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setError("Token de redefinição inválido ou ausente.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validations
    if (!token) {
      setError("Token de redefinição inválido.");
      return;
    }

    if (!isPasswordValid) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (!passwordsMatch) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao redefinir senha");
      }

      setIsSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao redefinir senha");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Senha Redefinida!
            </h1>
            <p className="text-muted-foreground mb-6">
              Sua senha foi alterada com sucesso. Você será redirecionado para a
              página de login em instantes.
            </p>
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Ir para Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Link Inválido
            </h1>
            <p className="text-muted-foreground mb-6">
              Este link de redefinição de senha é inválido ou expirou. Por favor,
              solicite um novo link.
            </p>
            <Link href="/forgot-password">
              <Button variant="primary" className="w-full mb-3">
                Solicitar Novo Link
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                Voltar para Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Login
        </Link>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Redefinir Senha
            </h1>
            <p className="text-sm text-muted-foreground">
              Digite sua nova senha abaixo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Nova Senha
              </label>
              <Input
                type="password"
                placeholder="Digite sua nova senha"
                value={newPassword}
                onChange={setNewPassword}
                disabled={isLoading}
                required
              />
              {newPassword && !isPasswordValid && (
                <p className="text-xs text-red-500 mt-1">
                  A senha deve ter pelo menos 8 caracteres
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirmar Senha
              </label>
              <Input
                type="password"
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={setConfirmPassword}
                disabled={isLoading}
                required
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1">
                  As senhas não coincidem
                </p>
              )}
              {confirmPassword && passwordsMatch && (
                <p className="text-xs text-green-500 mt-1">
                  ✓ As senhas coincidem
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-background/50 rounded-lg p-3">
              <p className="text-xs font-medium text-white mb-2">
                Requisitos da senha:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className={newPassword.length >= 8 ? "text-green-500" : ""}>
                  {newPassword.length >= 8 ? "✓" : "•"} Mínimo de 8 caracteres
                </li>
                <li className={passwordsMatch ? "text-green-500" : ""}>
                  {passwordsMatch ? "✓" : "•"} Senhas coincidem
                </li>
              </ul>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
              loading={isLoading}
            >
              {isLoading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Lembrou sua senha?{" "}
          <Link href="/login" className="text-primary-400 hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-white">Carregando...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
