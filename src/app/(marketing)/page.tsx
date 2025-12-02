"use client";

import Link from "next/link";
import {
  TrendingUp,
  Music2,
  Wallet,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Play,
  Star,
  ChevronRight,
  UserPlus,
  Search,
  DollarSign,
  Brain,
  Clock,
  Award,
} from "lucide-react";
import { Button, Badge, Logo } from "@/components/ui";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Logo width={200} height={67} />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#como-funciona"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Como Funciona
              </Link>
              <Link
                href="#trending"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Músicas
              </Link>
              <Link
                href="#faq"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                FAQ
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-400/20 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <Badge variant="primary" size="lg" className="mb-6">
              <Zap className="w-4 h-4 mr-1" />
              A Bolsa de Valores da Música
            </Badge>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-display font-bold text-text-primary mb-6 leading-tight">
              Invista em{" "}
              <span className="text-gradient">Royalties Musicais</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Compre tokens de músicas, ganhe royalties mensais e negocie 24/7.
              A revolução do investimento em música começa aqui.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/signup">
                <Button
                  variant="primary"
                  size="lg"
                  iconPosition="right"
                >
                  Criar Conta Grátis
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button
                  variant="outline"
                  size="lg"
                >
                  Como Funciona
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-text-tertiary text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                <span>Regulamentado CVM</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-400" />
                <span>+2.500 Investidores</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-warning" />
                <span>4.9/5 Avaliação</span>
              </div>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <StatCard
              value="R$ 2.5M+"
              label="Volume Negociado"
              trend="+156% este mês"
            />
            <StatCard
              value="156"
              label="Músicas Tokenizadas"
              trend="+12 esta semana"
            />
            <StatCard
              value="18.5%"
              label="ROI Médio Anual"
              trend="Baseado nos últimos 12 meses"
            />
          </div>
        </div>
      </section>

      {/* Trending Songs Section */}
      <section id="trending" className="py-20 px-4 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="accent" className="mb-3">
                <TrendingUp className="w-3 h-3 mr-1" />
                Em Alta
              </Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary">
                Músicas Trending
              </h2>
              <p className="text-text-secondary mt-2">
                As músicas mais investidas da semana
              </p>
            </div>
            <Link href="/marketplace">
              <Button
                variant="ghost"
                iconPosition="right"
              >
                Ver todas
              </Button>
            </Link>
          </div>

          {/* Song Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingSongs.map((song) => (
              <TrendingSongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-3">
              Simples e Seguro
            </Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
              Como Funciona
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Em apenas 3 passos você começa a investir em royalties musicais e
              receber rendimentos mensais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              icon={<UserPlus className="w-6 h-6" />}
              title="Crie sua Conta"
              description="Cadastre-se gratuitamente em menos de 2 minutos. Complete o KYC para começar a investir."
            />
            <StepCard
              number="02"
              icon={<Search className="w-6 h-6" />}
              title="Escolha Músicas"
              description="Explore músicas tokenizadas, analise métricas de performance e escolha onde investir."
            />
            <StepCard
              number="03"
              icon={<DollarSign className="w-6 h-6" />}
              title="Receba Royalties"
              description="Ganhe sua parte dos royalties todo mês. Acompanhe tudo em tempo real no dashboard."
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-3">
              Por que V2K?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
              A Plataforma Completa
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="Análise com IA"
              description="Nossa IA analisa milhões de dados para prever o potencial viral de cada música."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="100% Seguro"
              description="Contratos inteligentes na blockchain garantem transparência e segurança."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Liquidez 24/7"
              description="Compre e venda tokens a qualquer momento. Mercado sempre aberto."
            />
            <FeatureCard
              icon={<Wallet className="w-6 h-6" />}
              title="Investimento Mínimo"
              description="Comece com apenas R$ 10. Diversifique seu portfólio gradualmente."
            />
            <FeatureCard
              icon={<Award className="w-6 h-6" />}
              title="Curadoria Premium"
              description="Músicas selecionadas por especialistas da indústria musical."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Comunidade Ativa"
              description="Conecte-se com outros investidores e compartilhe insights."
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
              O que dizem nossos investidores
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Finalmente uma forma inteligente de investir em música. Já recebi mais de R$ 500 em royalties!"
              author="Marina S."
              role="Investidora desde 2024"
              avatar="MS"
            />
            <TestimonialCard
              quote="A interface é incrível e os relatórios são super detalhados. Recomendo muito!"
              author="Pedro L."
              role="Day Trader"
              avatar="PL"
            />
            <TestimonialCard
              quote="Como artista, tokenizar minha música me deu acesso a capital que eu nunca teria de outra forma."
              author="DJ Kaio"
              role="Artista Parceiro"
              avatar="DK"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-bg-secondary">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-3">
              Dúvidas?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="Como funciona o investimento em royalties?"
              answer="Você compra tokens que representam uma fração dos direitos de uma música. Quando a música gera receita (streams, downloads, etc.), você recebe sua parte proporcional dos royalties todo mês."
            />
            <FAQItem
              question="Qual o investimento mínimo?"
              answer="O investimento mínimo é de R$ 10 por música. Você pode diversificar investindo pequenas quantias em várias músicas diferentes."
            />
            <FAQItem
              question="Como recebo meus royalties?"
              answer="Os royalties são distribuídos automaticamente todo dia 15 do mês. Você pode sacar para sua conta bancária ou reinvestir em mais tokens."
            />
            <FAQItem
              question="É seguro investir na V2K?"
              answer="Sim! Utilizamos contratos inteligentes na blockchain Polygon para garantir transparência e segurança. Todas as transações são registradas e verificáveis."
            />
            <FAQItem
              question="Posso vender meus tokens?"
              answer="Sim! Você pode vender seus tokens a qualquer momento no marketplace. O preço é determinado pela oferta e demanda do mercado."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-primary-400/20 via-secondary-400/10 to-accent-400/20 border border-primary-400/30">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de investidores que já estão lucrando com
              royalties musicais. Crie sua conta grátis agora.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  variant="primary"
                  size="lg"
                  iconPosition="right"
                >
                  Criar Conta Grátis
                </Button>
              </Link>
              <p className="text-sm text-text-tertiary">
                Sem taxas de cadastro. Cancele quando quiser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Produto</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/marketplace"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link
                    href="#como-funciona"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Como Funciona
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/sobre"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link
                    href="/artistas"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Para Artistas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contato"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/termos"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacidade"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/riscos"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Avisos de Risco
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Social</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://twitter.com/v2kmusic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com/v2kmusic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/v2kmusic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-border-subtle">
            <div className="mb-3 md:mb-0">
              <Logo width={120} height={40} />
            </div>
            <p className="text-sm text-text-tertiary">
              © 2024 V2K Music. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components

function StatCard({
  value,
  label,
  trend,
}: {
  value: string;
  label: string;
  trend: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-bg-secondary/50 backdrop-blur-sm border border-border-default hover:border-border-strong transition-all">
      <div className="text-4xl font-mono font-bold text-text-primary mb-2">
        {value}
      </div>
      <div className="text-text-secondary font-medium mb-1">{label}</div>
      <div className="text-sm text-success">{trend}</div>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative p-8 rounded-2xl bg-bg-secondary border border-border-default hover:border-primary-400/50 transition-all group">
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary-400 flex items-center justify-center text-white font-bold text-lg">
        {number}
      </div>
      <div className="mb-4 p-3 rounded-xl bg-primary-400/10 text-primary-400 w-fit group-hover:bg-primary-400 group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-bg-primary border border-border-default hover:border-primary-400/50 transition-all">
      <div className="mb-4 p-3 rounded-xl bg-primary-400/10 text-primary-400 w-fit">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm">{description}</p>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  avatar,
}: {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-bg-secondary border border-border-default">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-warning text-warning" />
        ))}
      </div>
      <p className="text-text-primary mb-6">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-400/20 flex items-center justify-center text-primary-400 font-semibold text-sm">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-text-primary">{author}</p>
          <p className="text-sm text-text-tertiary">{role}</p>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group p-6 rounded-2xl bg-bg-primary border border-border-default hover:border-border-strong transition-all">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="font-semibold text-text-primary pr-4">{question}</span>
        <ChevronRight className="w-5 h-5 text-text-tertiary group-open:rotate-90 transition-transform" />
      </summary>
      <p className="mt-4 text-text-secondary">{answer}</p>
    </details>
  );
}

function TrendingSongCard({
  song,
}: {
  song: {
    id: string;
    title: string;
    artist: string;
    price: string;
    roi: string;
    imageColor: string;
  };
}) {
  return (
    <Link href={`/track/${song.id}`}>
      <div className="group relative overflow-hidden rounded-xl bg-bg-primary border border-border-default transition-all duration-200 hover:scale-105 hover:shadow-xl hover:border-primary-400/50 cursor-pointer">
        {/* Cover Art Placeholder */}
        <div
          className={`aspect-square ${song.imageColor} flex items-center justify-center`}
        >
          <Music2 className="w-16 h-16 text-white/50" />
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="primary" size="sm">
            Investir
          </Button>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-text-primary truncate">
            {song.title}
          </h3>
          <p className="text-sm text-text-tertiary truncate">{song.artist}</p>

          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-mono font-medium text-text-primary">
              {song.price}
            </span>
            <span className="text-sm font-semibold text-success">
              {song.roi}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Mock Data
const trendingSongs = [
  {
    id: "1",
    title: "Ela Só Quer Paz",
    artist: "MC Kevinho",
    price: "R$ 2,50",
    roi: "+24.5%",
    imageColor: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    id: "2",
    title: "Modo Turbo",
    artist: "Luísa Sonza",
    price: "R$ 3,80",
    roi: "+18.2%",
    imageColor: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
  {
    id: "3",
    title: "Desenrola",
    artist: "Anitta",
    price: "R$ 5,20",
    roi: "+32.1%",
    imageColor: "bg-gradient-to-br from-orange-500 to-red-500",
  },
  {
    id: "4",
    title: "Vento Gelado",
    artist: "Veigh",
    price: "R$ 1,90",
    roi: "+15.8%",
    imageColor: "bg-gradient-to-br from-green-500 to-teal-500",
  },
];
