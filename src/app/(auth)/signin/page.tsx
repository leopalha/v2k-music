"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Logo } from "@/components/ui";
import { toast } from "@/components/ui/use-toast";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/marketplace";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Erro ao fazer login", result.error);
      } else {
        toast.success("Login realizado!", "Bem-vindo de volta!");
        router.push(callbackUrl);
      }
    } catch (error) {
      toast.error("Erro ao fazer login", "Ocorreu um erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo width={200} height={67} />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary rounded-2xl border border-border-default p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-text-secondary mb-6">
            Faça login para acessar sua conta
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <Input
                type="email"
                name="email"
                data-testid="email-input"
                value={email}
                onChange={setEmail}
                placeholder="seu@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Senha
              </label>
              <Input
                type="password"
                name="password"
                data-testid="password-input"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-400 hover:text-primary-500"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
              data-testid="signin-button"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Não tem uma conta?{" "}
              <Link
                href="/signup"
                className="text-primary-400 hover:text-primary-500 font-medium"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-white">Carregando...</div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
