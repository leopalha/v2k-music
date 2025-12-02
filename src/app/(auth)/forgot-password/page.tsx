"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao enviar email");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar email de recuperação");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-display font-bold text-text-primary mb-3">
          Email enviado!
        </h1>
        <p className="text-text-secondary mb-8">
          Se uma conta existir com o email <span className="font-medium text-text-primary">{email}</span>,
          você receberá um link para redefinir sua senha.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            variant="primary"
            fullWidth
            onClick={() => setIsSubmitted(false)}
          >
            Enviar novamente
          </Button>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Logo */}
      <div className="lg:hidden mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 via-secondary-400 to-accent-400 flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-2xl font-display font-bold text-gradient">
            V2K
          </span>
        </Link>
      </div>

      {/* Back Link */}
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para login
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
          Esqueceu sua senha?
        </h1>
        <p className="text-text-secondary">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={setEmail}
          iconPosition="left"
          required
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
        >
          Enviar link de recuperação
        </Button>
      </form>

      {/* Sign Up Link */}
      <p className="mt-8 text-center text-text-secondary">
        Não tem uma conta?{" "}
        <Link
          href="/signup"
          className="text-primary-400 hover:text-primary-500 font-medium transition-colors"
        >
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}
