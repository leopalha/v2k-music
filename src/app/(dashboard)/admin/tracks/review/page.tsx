"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui";
import { Check, X, Music, Clock, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PendingTrack {
  id: string;
  title: string;
  artistName: string;
  genre: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  currentPrice: number;
  totalSupply: number;
  availableSupply: number;
  createdAt: string;
  artist: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminTracksReviewPage() {
  const [tracks, setTracks] = useState<PendingTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingTracks();
  }, []);

  const fetchPendingTracks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/tracks?status=PENDING');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending tracks');
      }

      const data = await response.json();
      setTracks(data.tracks || []);
    } catch (error) {
      console.error('[FETCH_PENDING_TRACKS_ERROR]', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar músicas pendentes",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (trackId: string, trackTitle: string) => {
    try {
      setProcessingId(trackId);
      
      const response = await fetch(`/api/admin/tracks/${trackId}/approve`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to approve track');
      }

      toast({
        title: "Música Aprovada! 🎉",
        description: `"${trackTitle}" foi aprovada e está disponível no marketplace`,
      });

      // Remove from list
      setTracks(prev => prev.filter(t => t.id !== trackId));
    } catch (error) {
      console.error('[APPROVE_TRACK_ERROR]', error);
      toast({
        title: "Erro",
        description: "Falha ao aprovar música",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (trackId: string, trackTitle: string) => {
    try {
      setProcessingId(trackId);
      
      const response = await fetch(`/api/admin/tracks/${trackId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject track');
      }

      toast({
        title: "Música Rejeitada",
        description: `"${trackTitle}" foi rejeitada`,
      });

      // Remove from list
      setTracks(prev => prev.filter(t => t.id !== trackId));
      setShowRejectModal(null);
      setRejectReason("");
    } catch (error) {
      console.error('[REJECT_TRACK_ERROR]', error);
      toast({
        title: "Erro",
        description: "Falha ao rejeitar música",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Há menos de 1 hora';
    if (diffHours < 24) return `Há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays}d`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Revisar Músicas"
          subtitle="Aprovar ou rejeitar músicas enviadas por artistas"
        />
        <div className="mt-6 text-center text-text-secondary">
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Revisar Músicas"
        subtitle="Aprovar ou rejeitar músicas enviadas por artistas"
      />

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-4">
          <div className="flex items-center gap-2 text-text-tertiary text-sm mb-1">
            <Clock className="w-4 h-4" />
            <span>Pendentes</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">
            {tracks.length}
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="mt-6 space-y-4">
        {tracks.length === 0 ? (
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-12 text-center" data-testid="empty-state">
            <Music className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Nenhuma Música Pendente
            </h3>
            <p className="text-text-secondary">
              Todas as músicas foram revisadas!
            </p>
          </div>
        ) : (
          tracks.map((track) => (
            <div
              key={track.id}
              className="bg-bg-secondary border border-border-primary rounded-xl p-6 hover:border-primary-400/50 transition-colors"
              data-testid="pending-track-item"
            >
              <div className="flex gap-6">
                {/* Cover Image */}
                <div className="flex-shrink-0">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-text-primary mb-1">
                        {track.title}
                      </h3>
                      <p className="text-text-secondary">
                        {track.artistName}
                      </p>
                      <p className="text-sm text-text-tertiary">
                        {track.artist.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-tertiary">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(track.createdAt)}</span>
                    </div>
                  </div>

                  {/* Audio Player */}
                  <div className="mb-4">
                    <audio
                      controls
                      className="w-full max-w-md"
                      src={track.audioUrl}
                      preload="metadata"
                    >
                      Seu navegador não suporta o elemento de áudio.
                    </audio>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-text-tertiary mb-1">Gênero</div>
                      <div className="text-sm font-medium text-text-primary">
                        {track.genre}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-tertiary mb-1">Duração</div>
                      <div className="text-sm font-medium text-text-primary">
                        {formatDuration(track.duration)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-tertiary mb-1">Preço/Token</div>
                      <div className="text-sm font-medium text-text-primary">
                        R$ {track.currentPrice.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-tertiary mb-1">Supply</div>
                      <div className="text-sm font-medium text-text-primary">
                        {track.totalSupply.toLocaleString()} tokens
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(track.id, track.title)}
                      disabled={processingId === track.id}
                      className="bg-success hover:bg-success/90"
                      data-testid="approve-track"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      onClick={() => setShowRejectModal(track.id)}
                      disabled={processingId === track.id}
                      variant="outline"
                      className="border-error text-error hover:bg-error/10"
                      data-testid="reject-track"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Reject Modal */}
              {showRejectModal === track.id && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 max-w-md w-full">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-error" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-1">
                          Rejeitar Música
                        </h3>
                        <p className="text-sm text-text-secondary">
                          Informe o motivo da rejeição (será enviado ao artista)
                        </p>
                      </div>
                    </div>

                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Ex: Qualidade de áudio inadequada, conteúdo impróprio..."
                      className="w-full px-4 py-3 bg-bg-elevated border border-border-default rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-error min-h-[100px] mb-4"
                      data-testid="rejection-reason"
                    />

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleReject(track.id, track.title)}
                        disabled={processingId === track.id || !rejectReason.trim()}
                        className="flex-1 bg-error hover:bg-error/90"
                        data-testid="confirm-reject"
                      >
                        Confirmar Rejeição
                      </Button>
                      <Button
                        onClick={() => {
                          setShowRejectModal(null);
                          setRejectReason("");
                        }}
                        disabled={processingId === track.id}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
