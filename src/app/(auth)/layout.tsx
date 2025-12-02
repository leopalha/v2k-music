import Link from "next/link";
import { Logo } from "@/components/ui";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-400/20 via-secondary-400/10 to-accent-400/20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary-400/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-secondary-400/30 rounded-full blur-[80px]" />

        <div className="relative z-10 flex flex-col justify-center p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center mb-12">
            <Logo width={160} height={52} />
          </Link>

          {/* Tagline */}
          <h1 className="text-4xl font-display font-bold text-text-primary mb-4">
            Invista em Royalties Musicais
          </h1>
          <p className="text-xl text-text-secondary max-w-md">
            A bolsa de valores da música. Compre tokens, ganhe royalties mensais
            e negocie 24/7.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-mono font-bold text-text-primary">
                R$ 2.5M+
              </div>
              <div className="text-text-secondary">Volume Negociado</div>
            </div>
            <div>
              <div className="text-3xl font-mono font-bold text-text-primary">
                2.500+
              </div>
              <div className="text-text-secondary">Investidores Ativos</div>
            </div>
            <div>
              <div className="text-3xl font-mono font-bold text-text-primary">
                156
              </div>
              <div className="text-text-secondary">Músicas Tokenizadas</div>
            </div>
            <div>
              <div className="text-3xl font-mono font-bold text-text-primary">
                18.5%
              </div>
              <div className="text-text-secondary">ROI Médio Anual</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
