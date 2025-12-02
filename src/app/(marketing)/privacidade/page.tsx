"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 via-secondary-400 to-accent-400 flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-2xl font-display font-bold text-gradient">
              V2K
            </span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          {/* Title */}
          <h1 className="text-4xl font-display font-bold text-text-primary mb-4">
            Política de Privacidade
          </h1>
          <p className="text-text-secondary mb-12">
            Última atualização: 29 de Novembro de 2025
          </p>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                1. Introdução
              </h2>
              <p className="text-text-secondary mb-4">
                A V2K está comprometida com a proteção da sua privacidade. Esta política descreve
                como coletamos, usamos e protegemos suas informações pessoais de acordo com a
                Lei Geral de Proteção de Dados (LGPD).
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                2. Dados que Coletamos
              </h2>
              <p className="text-text-secondary mb-4">
                Coletamos os seguintes tipos de dados:
              </p>
              <h3 className="text-xl font-medium text-text-primary mb-3">Dados de Identificação</h3>
              <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4 mb-4">
                <li>Nome completo</li>
                <li>Email</li>
                <li>CPF</li>
                <li>Data de nascimento</li>
                <li>Número de telefone</li>
              </ul>
              <h3 className="text-xl font-medium text-text-primary mb-3">Dados Financeiros</h3>
              <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4 mb-4">
                <li>Endereço de carteira blockchain</li>
                <li>Histórico de transações</li>
                <li>Portfolio de investimentos</li>
              </ul>
              <h3 className="text-xl font-medium text-text-primary mb-3">Dados de Uso</h3>
              <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
                <li>Páginas visitadas</li>
                <li>Tempo de sessão</li>
                <li>Dispositivo e navegador</li>
                <li>Endereço IP</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                3. Como Usamos seus Dados
              </h2>
              <p className="text-text-secondary mb-4">
                Utilizamos seus dados para:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
                <li>Processar suas transações de compra e venda</li>
                <li>Verificar sua identidade (KYC/AML)</li>
                <li>Enviar notificações sobre investimentos e royalties</li>
                <li>Melhorar nossa plataforma e serviços</li>
                <li>Cumprir obrigações legais e regulatórias</li>
                <li>Prevenir fraudes e atividades ilícitas</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                4. Compartilhamento de Dados
              </h2>
              <p className="text-text-secondary mb-4">
                Podemos compartilhar seus dados com:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
                <li>Provedores de serviços de pagamento (Stripe)</li>
                <li>Autoridades regulatórias quando legalmente exigido</li>
                <li>Parceiros de verificação de identidade</li>
              </ul>
              <p className="text-text-secondary mt-4">
                <strong className="text-text-primary">Nunca vendemos seus dados pessoais.</strong>
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                5. Dados na Blockchain
              </h2>
              <p className="text-text-secondary mb-4">
                Suas transações são registradas na blockchain Polygon, que é pública e imutável.
                Isso significa que seu endereço de carteira e histórico de transações são
                permanentemente visíveis na blockchain.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                6. Seus Direitos (LGPD)
              </h2>
              <p className="text-text-secondary mb-4">
                Você tem os seguintes direitos sobre seus dados:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
                <li><strong className="text-text-primary">Acesso:</strong> Solicitar cópia dos seus dados</li>
                <li><strong className="text-text-primary">Correção:</strong> Corrigir dados incorretos</li>
                <li><strong className="text-text-primary">Exclusão:</strong> Solicitar exclusão dos dados*</li>
                <li><strong className="text-text-primary">Portabilidade:</strong> Receber seus dados em formato digital</li>
                <li><strong className="text-text-primary">Revogação:</strong> Retirar consentimento a qualquer momento</li>
              </ul>
              <p className="text-text-secondary mt-4 text-sm">
                *Nota: Dados na blockchain não podem ser excluídos devido à natureza imutável da tecnologia.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                7. Segurança dos Dados
              </h2>
              <p className="text-text-secondary mb-4">
                Implementamos medidas de segurança incluindo:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Autenticação de dois fatores (2FA)</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Auditorias regulares de segurança</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                8. Cookies
              </h2>
              <p className="text-text-secondary mb-4">
                Utilizamos cookies para:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
                <li>Manter sua sessão ativa</li>
                <li>Lembrar suas preferências</li>
                <li>Analisar uso da plataforma</li>
              </ul>
              <p className="text-text-secondary mt-4">
                Você pode desativar cookies no seu navegador, mas isso pode afetar funcionalidades.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                9. Retenção de Dados
              </h2>
              <p className="text-text-secondary mb-4">
                Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da conta,
                mantemos dados financeiros por 5 anos conforme exigências regulatórias.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                10. Contato do DPO
              </h2>
              <p className="text-text-secondary mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:
              </p>
              <p className="text-text-secondary">
                Email: <a href="mailto:dpo@v2k.app" className="text-primary-400 hover:text-primary-500">dpo@v2k.app</a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
