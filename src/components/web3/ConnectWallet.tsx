"use client";

import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from "wagmi";
import { useState, useEffect } from "react";
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui";
import { polygon, polygonAmoy, hardhat } from "wagmi/chains";
import { toast } from "@/components/ui/use-toast";
import { formatEther } from "viem";

const chainNames: Record<number, string> = {
  [polygon.id]: "Polygon",
  [polygonAmoy.id]: "Amoy Testnet",
  [hardhat.id]: "Localhost",
};

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address,
    chainId,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show toast when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      toast.success(
        "Carteira conectada!",
        `Conectado com ${address.slice(0, 6)}...${address.slice(-4)}`
      );
    }
  }, [isConnected, address]);

  // Show toast on connection error
  useEffect(() => {
    if (connectError) {
      toast.error(
        "Erro ao conectar carteira",
        connectError.message || "Não foi possível conectar. Tente novamente."
      );
    }
  }, [connectError]);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Endereço copiado!", "O endereço da carteira foi copiado para a área de transferência");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: typeof balance) => {
    if (!bal || !bal.value) return "0.0000";
    const formatted = formatEther(bal.value);
    const parsed = parseFloat(formatted);
    if (isNaN(parsed)) return "0.0000";
    return parsed.toFixed(4);
  };

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button disabled className="flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary border border-border-primary rounded-xl hover:border-primary transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-accent-green" />
          <span className="font-medium">{formatAddress(address)}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-72 bg-bg-secondary border border-border-primary rounded-xl shadow-xl z-50 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-border-primary">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">Connected</span>
                  <span className="text-xs px-2 py-1 bg-bg-tertiary rounded-full">
                    {chainNames[chainId] || `Chain ${chainId}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">{formatAddress(address)}</span>
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:bg-bg-tertiary rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-accent-green" />
                    ) : (
                      <Copy className="w-4 h-4 text-text-secondary" />
                    )}
                  </button>
                  <a
                    href={`https://polygonscan.com/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-bg-tertiary rounded transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-text-secondary" />
                  </a>
                </div>
              </div>

              {/* Balance */}
              <div className="p-4 border-b border-border-primary">
                <div className="text-sm text-text-secondary mb-1">Balance</div>
                <div className="text-xl font-semibold">
                  {formatBalance(balance)} {balance?.symbol || "MATIC"}
                </div>
              </div>

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={() => {
                    disconnect();
                    setIsOpen(false);
                    toast.info("Carteira desconectada", "Sua carteira foi desconectada com sucesso");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-accent-red hover:bg-bg-tertiary rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        {isPending ? "Connecting..." : "Connect Wallet"}
      </Button>

      {isOpen && !isConnected && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-bg-secondary border border-border-primary rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-border-primary">
              <h3 className="font-semibold">Connect Wallet</h3>
              <p className="text-sm text-text-secondary mt-1">
                Choose a wallet to connect to V2K
              </p>
            </div>
            <div className="p-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector });
                    setIsOpen(false);
                  }}
                  disabled={isPending}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-bg-tertiary rounded-lg transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-bg-tertiary rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{connector.name}</div>
                    <div className="text-xs text-text-secondary">
                      {connector.name === "Injected" ? "Browser wallet" : "Connect"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
