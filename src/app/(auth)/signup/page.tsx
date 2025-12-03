"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Chrome, Check, X } from "lucide-react";
import { Button, Input } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Password requirements
  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", met: password.length >= 8 },
    { label: "Uma letra maiúscula", met: /[A-Z]/.test(password) },
    { label: "Um número", met: /\d/.test(password) },
    { label: "Um caractere especial", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allRequirementsMet) {
      setError("A senha não atende aos requisitos de segurança.");
      return;
    }

    if (!passwordsMatch) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      // Create account via API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: email.split("@")[0], // Use email username as default name
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao criar conta.");
        return;
      }

      // Sign in after signup
      const { signIn } = await import("next-auth/react");
      await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      // Redirect to onboarding
      router.push("/onboarding");
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const { signIn } = await import("next-auth/react");
    await signIn("google", { callbackUrl: "/onboarding" });
  };

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

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
          Crie sua conta
        </h1>
        <p className="text-text-secondary">
          Comece a investir em royalties musicais hoje
        </p>
      </div>

      {/* Google Signup */}
      <Button
        variant="secondary"
        fullWidth
        onClick={handleGoogleSignup}
        className="mb-6"
      >
        Continuar com Google
      </Button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-default" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-bg-primary text-text-tertiary">
            ou cadastre com email
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm" data-testid="error-message">
          {error}
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          name="email"
          data-testid="email-input"
          placeholder="seu@email.com"
          value={email}
          onChange={setEmail}
          iconPosition="left"
          required
        />

        <div className="relative">
          <Input
            label="Senha"
            type={showPassword ? "text" : "password"}
            name="password"
            data-testid="password-input"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            iconPosition="left"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[38px] text-text-tertiary hover:text-text-secondary transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Password Requirements */}
        {password && (
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-default" data-testid="password-requirements">
            <p className="text-sm font-medium text-text-secondary mb-2">
              Requisitos da senha:
            </p>
            <ul className="space-y-1" data-testid="password-error">
              {passwordRequirements.map((req, index) => (
                <li
                  key={index}
                  className={`flex items-center gap-2 text-sm ${
                    req.met ? "text-success" : "text-text-tertiary"
                  }`}
                >
                  {req.met ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  {req.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="relative">
          <Input
            label="Confirmar Senha"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={setConfirmPassword}
            iconPosition="left"
            error={
              confirmPassword && !passwordsMatch
                ? "As senhas não coincidem"
                : undefined
            }
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-[38px] text-text-tertiary hover:text-text-secondary transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Terms */}
        <p className="text-sm text-text-tertiary">
          Ao criar uma conta, você concorda com nossos{" "}
          <Link
            href="/termos"
            className="text-primary-400 hover:text-primary-500"
          >
            Termos de Uso
          </Link>{" "}
          e{" "}
          <Link
            href="/privacidade"
            className="text-primary-400 hover:text-primary-500"
          >
            Política de Privacidade
          </Link>
          .
        </p>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={!allRequirementsMet || !passwordsMatch || !email}
          className="mt-6"
          data-testid="signup-button"
        >
          Criar Conta
        </Button>
      </form>

      {/* Login Link */}
      <p className="mt-8 text-center text-text-secondary">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="text-primary-400 hover:text-primary-500 font-medium transition-colors"
        >
          Fazer login
        </Link>
      </p>
    </div>
  );
}
