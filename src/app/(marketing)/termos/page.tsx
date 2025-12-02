"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermosPage() {
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
            Termos de Uso
          </h1>
          <p className="text-text-secondary mb-12">
            Última atualização: 29 de Novembro de 2025
          </p>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                1. Aceitação dos Termos
              </h2>
              <p className="text-text-secondary mb-4">
                Ao acessar e usar a plataforma V2K, você concorda em estar vinculado a estes Termos de Uso.
                Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                2. Descrição do Serviço
              </h2>
              <p className="text-text-secondary mb-4">
                V2K é uma plataforma de investimento em royalties musicais onde usuários podem comprar,
                vender e manter tokens representando participações em músicas. Os tokens dão direito a
                uma proporção dos royalties gerados pela música.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                3. Elegibilidade
              </h2>
              <p className="text-text-secondary mb-4">
                Para usar nossos serviços, você deve:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
                <li>Ter pelo menos 18 anos de idade</li>
                <li>Ser residente do Brasil</li>
                <li>Completar o processo de verificação KYC</li>
                <li>Ter uma carteira digital válida (MetaMask ou similar)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                4. Riscos do Investimento
              </h2>
              <p className="text-text-secondary mb-4">
                <strong className="text-text-primary">AVISO IMPORTANTE:</strong> Investir em tokens musicais
                envolve riscos significativos. Você pode perder parte ou todo o seu investimento.
                O desempenho passado não é garantia de resultados futuros.
              </p>
              <p className="text-text-secondary">
                Recomendamos que você invista apenas valores que está disposto a perder e consulte
                um consultor financeiro antes de investir.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                5. Conduta do Usuário
              </h2>
              <p className="text-text-secondary mb-4">
                Você concorda em não:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
                <li>Manipular preços de tokens de forma artificial</li>
                <li>Usar bots ou automação sem autorização</li>
                <li>Violar leis de valores mobiliários</li>
                <li>Lavar dinheiro ou financiar atividades ilegais</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                6. Taxas e Pagamentos
              </h2>
              <p className="text-text-secondary mb-4">
                A V2K cobra uma taxa de 2.5% sobre cada transação de compra e venda.
                Taxas de gas da blockchain são de responsabilidade do usuário.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                7. Propriedade Intelectual
              </h2>
              <p className="text-text-secondary mb-4">
                Todo o conteúdo da plataforma V2K, incluindo logos, design, textos e código,
                são propriedade da V2K ou de seus licenciadores. Os tokens representam direitos
                sobre royalties, não sobre a propriedade intelectual das músicas.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                8. Limitação de Responsabilidade
              </h2>
              <p className="text-text-secondary mb-4">
                A V2K não será responsável por perdas resultantes de: volatilidade do mercado,
                falhas técnicas da blockchain, ataques hackers, ou decisões de investimento do usuário.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                9. Alterações nos Termos
              </h2>
              <p className="text-text-secondary mb-4">
                Reservamo-nos o direito de modificar estes termos a qualquer momento.
                Notificaremos os usuários sobre mudanças significativas por email.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                10. Contato
              </h2>
              <p className="text-text-secondary mb-4">
                Para dúvidas sobre estes termos, entre em contato:
              </p>
              <p className="text-text-secondary">
                Email: <a href="mailto:legal@v2k.app" className="text-primary-400 hover:text-primary-500">legal@v2k.app</a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
