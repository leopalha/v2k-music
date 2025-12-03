"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { signIn } = await import("next-auth/react");

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Email ou senha inválidos. Tente novamente.");
      } else {
        router.push("/marketplace");
      }
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { signIn } = await import("next-auth/react");
    await signIn("google", { callbackUrl: "/marketplace" });
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
          Bem-vindo de volta
        </h1>
        <p className="text-text-secondary">
          Entre na sua conta para continuar investindo
        </p>
      </div>

      {/* Google Login */}
      <Button
        variant="secondary"
        fullWidth
        onClick={handleGoogleLogin}
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
            ou entre com email
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div 
          className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm"
          data-testid="error-message"
        >
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          name="email"
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

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-border-default bg-bg-secondary text-primary-400 focus:ring-primary-400 focus:ring-offset-0"
            />
            <span className="text-sm text-text-secondary">Lembrar de mim</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-sm text-primary-400 hover:text-primary-500 transition-colors"
          >
            Esqueceu a senha?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          className="mt-6"
        >
          Entrar
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
