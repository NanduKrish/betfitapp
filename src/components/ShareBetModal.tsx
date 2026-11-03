import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';
import { BetGroup } from '../types';

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
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  // Clean shareable link using cloud invite code
  const inviteCode = betGroup.inviteCode || betGroup.id;
  const shareUrl = `${window.location.origin}${window.location.pathname}?join=${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! I've set up a health & weight bet: "${betGroup.title}" with a ${betGroup.currency || '₹'}${betGroup.potAmount} pot by ${betGroup.targetDeadline}.\n\nJoin our showdown and track your habits here:\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2>Invite Friends to the Bet</h2>
            <p>Share this link with your friends so they can join the showdown with their own goal and baseline.</p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form">
          <div className="summary-card">
            <div>
              <span>BET SHOWDOWN</span>
              <b>{betGroup.title}</b>
            </div>
            <div>
              <span>STAKES VAULT</span>
              <b>{betGroup.currency || '₹'}{betGroup.potAmount} Pot</b>
            </div>
            <div>
              <span>TARGET DEADLINE</span>
              <b>{betGroup.targetDeadline}</b>
            </div>
          </div>

          <label className="field">
            <span>Shareable Invitation Link</span>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="bg-[var(--surface-subtle)] text-xs truncate select-all"
              />
              <button
                type="button"
                className="btn-primary shrink-0"
                onClick={handleCopy}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </label>

          <button
            type="button"
            className="btn-secondary full-btn"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle size={16} /> Share via WhatsApp
          </button>

          <p className="modal-hint">
            When friends open this link, they will be prompted to pick their goal (Loss/Gain), starting weight, and daily habits.
          </p>
        </div>
      </div>
    </div>
  );
};
