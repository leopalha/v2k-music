"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Button, Input } from "@/components/ui";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Personal Info
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthday, setBirthday] = useState("");

  // Step 2: Contact
  const [phoneNumber, setPhoneNumber] = useState("");

  // Step 3: Terms
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptRisks, setAcceptRisks] = useState(false);

  // CPF Formatting
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return cpf;
  };

  // Phone Formatting
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return phoneNumber;
  };

  // CPF Validation (basic)
  const isValidCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, "");
    if (numbers.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    return true;
  };

  // Age Validation
  const isOver18 = (dateStr: string) => {
    const birthDate = new Date(dateStr);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const validateStep1 = () => {
    if (!fullName.trim()) {
      setError("Por favor, informe seu nome completo.");
      return false;
    }
    if (!isValidCPF(cpf)) {
      setError("CPF inválido. Verifique e tente novamente.");
      return false;
    }
    if (!birthday) {
      setError("Por favor, informe sua data de nascimento.");
      return false;
    }
    if (!isOver18(birthday)) {
      setError("Você precisa ter 18 anos ou mais para investir.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const phoneNumbers = phoneNumber.replace(/\D/g, "");
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      setError("Número de telefone inválido.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!acceptTerms || !acceptPrivacy || !acceptRisks) {
      setError("Você precisa aceitar todos os termos para continuar.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError("");

    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;

    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/kyc/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          cpf,
          birthDate: birthday,
          phone: phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao completar cadastro");
      }

      // Redirect to marketplace with success
      router.push("/marketplace?onboarding=complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, label: "Dados Pessoais", icon: User },
    { number: 2, label: "Contato", icon: Phone },
    { number: 3, label: "Termos", icon: FileCheck },
  ];

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-border-subtle">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 via-secondary-400 to-accent-400 flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-2xl font-display font-bold text-gradient">
              V2K
            </span>
          </Link>

          <button
            onClick={() => router.push("/marketplace")}
            className="text-text-tertiary hover:text-text-secondary text-sm transition-colors"
          >
            Pular por agora
          </button>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="p-6 border-b border-border-subtle">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentStep > step.number
                        ? "bg-success text-white"
                        : currentStep === step.number
                          ? "bg-primary-400 text-white"
                          : "bg-bg-elevated text-text-tertiary"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={`text-sm mt-2 ${
                      currentStep >= step.number
                        ? "text-text-primary font-medium"
                        : "text-text-tertiary"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                      currentStep > step.number
                        ? "bg-success"
                        : "bg-bg-elevated"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
                Dados Pessoais
              </h2>
              <p className="text-text-secondary mb-8">
                Precisamos de algumas informações para verificar sua identidade.
              </p>

              <div className="space-y-5">
                <Input
                  label="Nome Completo"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={setFullName}
                  iconPosition="left"
                  required
                />

                <Input
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(val) => setCpf(formatCPF(val))}
                  iconPosition="left"
                  required
                />

                <Input
                  label="Data de Nascimento"
                  type="date"
                  value={birthday}
                  onChange={setBirthday}
                  iconPosition="left"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
                Contato
              </h2>
              <p className="text-text-secondary mb-8">
                Precisamos do seu telefone para notificações importantes.
              </p>

              <div className="space-y-5">
                <Input
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  value={phoneNumber}
                  onChange={(val) => setPhoneNumber(formatPhone(val))}
                  iconPosition="left"
                  required
                />

                <p className="text-sm text-text-tertiary">
                  Você receberá SMS com atualizações sobre seus investimentos e
                  royalties.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Terms */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
                Termos e Condições
              </h2>
              <p className="text-text-secondary mb-8">
                Leia e aceite os termos para finalizar seu cadastro.
              </p>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 rounded-xl bg-bg-secondary border border-border-default hover:border-border-strong transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-border-default bg-bg-secondary text-primary-400 focus:ring-primary-400 focus:ring-offset-0"
                  />
                  <div>
                    <span className="font-medium text-text-primary">
                      Termos de Uso
                    </span>
                    <p className="text-sm text-text-tertiary mt-1">
                      Li e aceito os{" "}
                      <Link
                        href="/termos"
                        className="text-primary-400 hover:underline"
                        target="_blank"
                      >
                        Termos de Uso
                      </Link>{" "}
                      da plataforma V2K.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl bg-bg-secondary border border-border-default hover:border-border-strong transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptPrivacy}
                    onChange={(e) => setAcceptPrivacy(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-border-default bg-bg-secondary text-primary-400 focus:ring-primary-400 focus:ring-offset-0"
                  />
                  <div>
                    <span className="font-medium text-text-primary">
                      Política de Privacidade
                    </span>
                    <p className="text-sm text-text-tertiary mt-1">
                      Li e aceito a{" "}
                      <Link
                        href="/privacidade"
                        className="text-primary-400 hover:underline"
                        target="_blank"
                      >
                        Política de Privacidade
                      </Link>{" "}
                      e o tratamento dos meus dados.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl bg-bg-secondary border border-border-default hover:border-border-strong transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptRisks}
                    onChange={(e) => setAcceptRisks(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-border-default bg-bg-secondary text-primary-400 focus:ring-primary-400 focus:ring-offset-0"
                  />
                  <div>
                    <span className="font-medium text-text-primary">
                      Riscos de Investimento
                    </span>
                    <p className="text-sm text-text-tertiary mt-1">
                      Entendo que investir em royalties musicais envolve riscos
                      e que retornos passados não garantem resultados futuros.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with buttons */}
      <footer className="p-6 border-t border-border-subtle">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              variant="ghost"
              onClick={handleBack}
            >
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              iconPosition="right"
            >
              Continuar
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isLoading}
              iconPosition="right"
            >
              Finalizar Cadastro
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
