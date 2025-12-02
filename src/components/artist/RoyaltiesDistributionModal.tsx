'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Users, TrendingUp } from 'lucide-react';

interface RoyaltiesDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: string;
  trackTitle: string;
  currentHolders: number;
  onSuccess?: () => void;
}

export default function RoyaltiesDistributionModal({
  isOpen,
  onClose,
  trackId,
  trackTitle,
  currentHolders,
  onSuccess,
}: RoyaltiesDistributionModalProps) {
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [referenceMonth, setReferenceMonth] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize with current month
  useEffect(() => {
    if (isOpen && !referenceMonth) {
      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setReferenceMonth(monthStr);
    }
  }, [isOpen, referenceMonth]);

  const amountNum = parseFloat(totalAmount) || 0;
  const avgPerHolder = currentHolders > 0 ? amountNum / currentHolders : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!totalAmount || amountNum <= 0) {
      setError('Valor deve ser maior que zero');
      return;
    }

    if (!referenceMonth) {
      setError('Selecione o mês de referência');
      return;
    }

    if (currentHolders === 0) {
      setError('Não há holders para distribuir royalties');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/artist/royalties/distribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId,
          totalAmount: amountNum,
          referenceMonth,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao distribuir royalties');
      }

      setSuccess(true);
      
      // Wait 2 seconds then close and call onSuccess
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao distribuir royalties');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTotalAmount('');
    setReferenceMonth('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Distribuir Royalties</h2>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white transition"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Track Info */}
        <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-zinc-400 mb-1">Música</p>
          <p className="text-lg font-semibold text-white">{trackTitle}</p>
          <div className="flex items-center gap-2 mt-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-300">{currentHolders} holders</span>
          </div>
        </div>

        {success ? (
          /* Success State */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Royalties Distribuídos!</h3>
            <p className="text-zinc-400">
              R$ {amountNum.toFixed(2)} foram distribuídos para {currentHolders} holders
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit}>
            {/* Total Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Valor Total (BRL)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Reference Month */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Mês de Referência
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="month"
                  value={referenceMonth}
                  onChange={(e) => setReferenceMonth(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Preview */}
            {amountNum > 0 && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-purple-300 mb-2">Preview da Distribuição</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-400">Total</p>
                    <p className="text-lg font-bold text-white">R$ {amountNum.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Média por Holder</p>
                    <p className="text-lg font-bold text-purple-400">R$ {avgPerHolder.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !totalAmount || amountNum <= 0}
              >
                {isLoading ? 'Distribuindo...' : 'Confirmar Distribuição'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
