"use client";

import { useState, useEffect } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, UserAvatar, Input } from "@/components/ui";
import { ConnectWallet } from "@/components/web3";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  CreditCard,
  LogOut,
  ChevronRight,
  Check,
  Camera,
  Loader2,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

type Tab = "profile" | "security" | "notifications" | "wallet";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  walletAddress: string | null;
  phone: string | null;
  fullName: string | null;
  cpf: string | null;
  birthDate: string | null;
  kycStatus: string;
  kycVerifiedAt: string | null;
  level: number;
  xp: number;
  badges: string[];
  cashBalance: number;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    phone: "",
    walletAddress: "",
  });

  // Load user profile
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao carregar perfil");
      }

      setUser(data.user);
      setFormData({
        name: data.user.name || "",
        username: data.user.username || "",
        bio: data.user.bio || "",
        phone: data.user.phone || "",
        walletAddress: data.user.walletAddress || "",
      });
    } catch (error) {
      toast.error(
        "Erro ao carregar perfil",
        error instanceof Error ? error.message : "Tente novamente"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar perfil");
      }

      setUser(data.user);
      setIsEditing(false);
      toast.success("Perfil atualizado", "Suas informações foram salvas com sucesso");
    } catch (error) {
      toast.error(
        "Erro ao salvar perfil",
        error instanceof Error ? error.message : "Tente novamente"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "security", label: "Segurança", icon: Shield },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "wallet", label: "Carteira", icon: CreditCard },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-text-secondary">Erro ao carregar perfil</p>
        </div>
      </AppLayout>
    );
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Minha Conta"
          subtitle="Gerencie suas informações e preferências"
        />

        {/* Profile Header */}
        <div className="bg-bg-secondary rounded-xl p-6 border border-border-primary mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <UserAvatar name={user.name || user.email} size="xl" />
              <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white hover:bg-primary-600 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-text-primary">
                  {user.name || user.fullName || "Sem nome"}
                </h2>
                {user.kycStatus === "VERIFIED" && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-accent-green/10 text-accent-green text-xs font-medium rounded-full">
                    <Check className="w-3 h-3" />
                    Verificado
                  </span>
                )}
              </div>
              <p className="text-text-secondary">{user.email}</p>
              <p className="text-sm text-text-tertiary mt-1">
                Membro desde {memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-bg-secondary text-text-secondary hover:text-text-primary"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-bg-secondary rounded-xl border border-border-primary">
          {activeTab === "profile" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">
                  Informações Pessoais
                </h3>
                <Button
                  variant={isEditing ? "primary" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      handleSave();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  loading={isSaving}
                  disabled={isSaving}
                >
                  {isEditing ? "Salvar" : "Editar"}
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Nome Completo
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(val) => setFormData({ ...formData, name: val })}
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg">
                        <User className="w-5 h-5 text-text-tertiary" />
                        <span className="text-text-primary">
                          {user.name || user.fullName || "Não informado"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg opacity-60">
                      <Mail className="w-5 h-5 text-text-tertiary" />
                      <span className="text-text-primary">{user.email}</span>
                      <span className="ml-auto text-xs text-text-tertiary">
                        (não editável)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Telefone
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(val) => setFormData({ ...formData, phone: val })}
                        placeholder="(11) 99999-9999"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg">
                        <Phone className="w-5 h-5 text-text-tertiary" />
                        <span className="text-text-primary">
                          {user.phone || "Não informado"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      CPF
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg">
                      <Shield className="w-5 h-5 text-text-tertiary" />
                      <span className="text-text-primary">
                        {user.cpf || "Não informado"}
                      </span>
                      {user.kycStatus === "VERIFIED" && (
                        <span className="ml-auto text-xs text-accent-green">Verificado</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Carteira Blockchain
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.walletAddress}
                        onChange={(val) => setFormData({ ...formData, walletAddress: val })}
                        placeholder="0x..."
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg">
                        <CreditCard className="w-5 h-5 text-text-tertiary" />
                        <span className="text-text-primary font-mono text-sm">
                          {user.walletAddress
                            ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                            : "Não conectada"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-400/10 rounded-lg">
                  <Lock className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    Alterar Senha
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Mantenha sua conta segura com uma senha forte
                  </p>
                </div>
              </div>

              <div className="max-w-md">
                <ChangePasswordForm />
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="divide-y divide-border-subtle">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary-400/10 rounded-lg">
                    <CreditCard className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      Carteira Conectada
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Gerencie sua conexão com a blockchain
                    </p>
                  </div>
                </div>

                <ConnectWallet />
              </div>

              <button className="w-full flex items-center justify-between p-6 hover:bg-bg-elevated transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-bg-tertiary rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-text-primary">
                      Autenticação em 2 Fatores
                    </p>
                    <p className="text-sm text-text-secondary">Não configurado</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-tertiary" />
              </button>

              <button className="w-full flex items-center justify-between p-6 hover:bg-bg-elevated transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-bg-tertiary rounded-lg">
                    <LogOut className="w-5 h-5 text-accent-red" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-accent-red">Sair da Conta</p>
                    <p className="text-sm text-text-secondary">
                      Encerrar sessão neste dispositivo
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-tertiary" />
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Notificações por Email</p>
                  <p className="text-sm text-text-secondary">
                    Receba atualizações sobre seus investimentos
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Alertas de Preço</p>
                  <p className="text-sm text-text-secondary">
                    Notificações quando preços mudarem significativamente
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Royalties Disponíveis</p>
                  <p className="text-sm text-text-secondary">
                    Aviso quando houver royalties para resgatar
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Newsletter</p>
                  <p className="text-sm text-text-secondary">
                    Novidades e atualizações da plataforma
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Carteira Web3
                </h3>
                <p className="text-sm text-text-secondary">
                  Conecte sua carteira para comprar, vender e resgatar royalties
                </p>
              </div>

              <div className="bg-bg-tertiary rounded-xl p-6 text-center">
                <CreditCard className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                <p className="text-text-secondary mb-4">
                  Conecte sua carteira MetaMask para interagir com a blockchain
                </p>
                <ConnectWallet />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
