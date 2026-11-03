import React, { useState } from 'react';
import { BetGroup } from '../types';
import { X, Copy, Check, Share2, Trophy, MessageCircle } from 'lucide-react';

interface ShareBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  betGroup: BetGroup;
}

export const ShareBetModal: React.FC<ShareBetModalProps> = ({
  isOpen,
  onClose,
  betGroup
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Encode bet metadata into URL parameter
  const betPayload = {
    id: betGroup.id,
    title: betGroup.title,
    targetDeadline: betGroup.targetDeadline,
    potAmount: betGroup.potAmount,
    currency: betGroup.currency || '₹',
    forfeitDescription: betGroup.forfeitDescription,
    creatorName: betGroup.creatorName || 'Your Friend'
  };

  const encoded = encodeURIComponent(btoa(JSON.stringify(betPayload)));
  const joinUrl = `${window.location.origin}${window.location.pathname}?bet=${encoded}`;

  const shareText = `🔥 Join my fitness bet "${betGroup.title}"! Target: Dec 31st | Stake: ₹${betGroup.potAmount} | Click to join: ${joinUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: betGroup.title,
          text: shareText,
          url: joinUrl
        });
      } catch {
        handleCopy();
      }
    } else {
      // WhatsApp direct share fallback
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="relative w-full max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 space-y-4 text-[var(--text-primary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-base">
              🔗
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Share Bet Invite</h3>
              <p className="text-[11px] text-[var(--text-secondary)]">Invite friends to join this bet</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invite Preview Card */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--text-primary)]">{betGroup.title}</span>
            <span className="font-mono-num font-bold text-amber-600 dark:text-amber-400">
              ₹{betGroup.potAmount} Pot
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Deadline: <strong className="text-[var(--text-primary)]">{betGroup.targetDeadline}</strong>
          </p>
          <p className="text-[11px] text-rose-500 line-clamp-2">
            Forfeit: {betGroup.forfeitDescription}
          </p>
        </div>

        {/* Link Box */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase text-[var(--text-secondary)]">
            Your Shareable Join Link
          </label>
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <input
              type="text"
              readOnly
              value={joinUrl}
              className="flex-1 bg-transparent px-2 text-xs text-[var(--text-secondary)] font-mono-num truncate focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1 shrink-0 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Mobile / Social Share Button */}
        <div className="pt-2">
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via WhatsApp / Messages</span>
          </button>
        </div>
      </div>
    </div>
  );
};
