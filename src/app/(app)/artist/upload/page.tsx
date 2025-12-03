"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { ArrowLeft, Upload, Music, Image as ImageIcon, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

const GENRES = [
  "POP", "ROCK", "RAP", "FUNK", "SERTANEJO", 
  "ELETRONIC", "JAZZ", "REGGAE", "INDIE", "OUTRO"
];

export default function ArtistUploadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState({
    title: "",
    genre: "POP",
    description: "",
    pricePerToken: "0.01",
    totalSupply: "10000",
  });
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string>("");
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      // Create audio preview URL
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      // Create image preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!session) {
      setError("Você precisa estar autenticado");
      return;
    }

    if (!audioFile || !coverFile) {
      setError("Por favor, selecione o áudio e a capa");
      return;
    }

    setIsUploading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("genre", formData.genre);
      data.append("description", formData.description);
      data.append("pricePerToken", formData.pricePerToken);
      data.append("totalSupply", formData.totalSupply);
      data.append("audio", audioFile);
      data.append("cover", coverFile);

      const response = await fetch("/api/artist/upload", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao fazer upload");
      }

      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/artist/dashboard");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload");
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center py-12" data-testid="success-message">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Música Enviada com Sucesso!
          </h1>
          <p className="text-text-secondary mb-4">
            Sua música está sendo processada e aguarda aprovação do admin.
          </p>
          <p className="text-sm text-text-tertiary">
            Redirecionando para o dashboard...
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/artist/dashboard"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Dashboard
          </Link>
          <PageHeader
            title="Upload de Música"
            subtitle="Envie uma nova música para tokenização na plataforma"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-bg-secondary rounded-xl border border-border-primary p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Informações Básicas
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Título da Música"
                type="text"
                placeholder="Ex: Minha Nova Música"
                value={formData.title}
                onChange={(value) => setFormData({ ...formData, title: value })}
                required
                minLength={3}
                maxLength={100}
              />

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Gênero
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-elevated border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400"
                  required
                >
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-elevated border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400 min-h-[100px]"
                  placeholder="Conte mais sobre sua música..."
                />
              </div>
            </div>
          </div>

          {/* Files Upload */}
          <div className="bg-bg-secondary rounded-xl border border-border-primary p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Arquivos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Audio Upload */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Arquivo de Áudio *
                </label>
                <div className="border-2 border-dashed border-border-default rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/flac"
                    onChange={handleAudioChange}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label htmlFor="audio-upload" className="cursor-pointer">
                    <Music className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                    <p className="text-sm text-text-secondary mb-1">
                      {audioFile ? audioFile.name : "Clique para fazer upload"}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      MP3, WAV ou FLAC (máx: 50MB)
                    </p>
                  </label>
                </div>
                {audioPreview && (
                  <audio controls className="w-full mt-3">
                    <source src={audioPreview} />
                  </audio>
                )}
              </div>

              {/* Cover Upload */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Capa da Música *
                </label>
                <div className="border-2 border-dashed border-border-default rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleCoverChange}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label htmlFor="cover-upload" className="cursor-pointer">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                    )}
                    <p className="text-sm text-text-secondary mb-1">
                      {coverFile ? coverFile.name : "Clique para fazer upload"}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      JPG ou PNG (máx: 5MB, min: 500x500px)
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Token Config */}
          <div className="bg-bg-secondary rounded-xl border border-border-primary p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Configuração de Tokens
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Preço por Token (R$)"
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                value={formData.pricePerToken}
                onChange={(value) => setFormData({ ...formData, pricePerToken: value })}
                required
              />

              <Input
                label="Total de Tokens"
                type="number"
                min="1000"
                max="100000"
                step="100"
                value={formData.totalSupply}
                onChange={(value) => setFormData({ ...formData, totalSupply: value })}
                required
              />
            </div>

            <div className="mt-4 p-4 bg-bg-elevated rounded-lg">
              <p className="text-sm text-text-secondary mb-1">Valor Total da Oferta:</p>
              <p className="text-2xl font-bold text-text-primary">
                R$ {(parseFloat(formData.pricePerToken) * parseInt(formData.totalSupply)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/artist/dashboard">
              <Button variant="outline" disabled={isUploading}>
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              data-testid="submit-track"
              disabled={isUploading || !audioFile || !coverFile}
              icon={isUploading ? undefined : <Upload className="w-4 h-4" />}
            >
              {isUploading ? "Enviando..." : "Enviar Música"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
