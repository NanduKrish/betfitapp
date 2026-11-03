import React, { useState } from 'react';
import { BetGroup } from '../types';
import { X } from 'lucide-react';

interface EditBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  betGroup: BetGroup;
  onSaveBet: (updated: BetGroup) => void;
}

export const EditBetModal: React.FC<EditBetModalProps> = ({
  isOpen,
  onClose,
  betGroup,
  onSaveBet
}) => {
  const [title, setTitle] = useState(betGroup.title);
  const [targetDeadline, setTargetDeadline] = useState(betGroup.targetDeadline);
  const [potAmount, setPotAmount] = useState(betGroup.potAmount.toString());
  const [forfeitDescription, setForfeitDescription] = useState(betGroup.forfeitDescription);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBet({
      ...betGroup,
      title,
      targetDeadline,
      potAmount: parseFloat(potAmount) || 0,
      currency: '₹',
      forfeitDescription
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="relative w-full max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-5 space-y-4 text-[var(--text-primary)]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Edit Bet Stakes</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Bet Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Deadline
              </label>
              <input
                type="date"
                required
                value={targetDeadline}
                onChange={(e) => setTargetDeadline(e.target.value)}
                className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Pot (₹)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-bold text-[var(--text-muted)]">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={potAmount}
                  onChange={(e) => setPotAmount(e.target.value)}
                  className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl pl-6 pr-3 py-2 text-xs text-[var(--text-primary)] font-mono-num focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-rose-500 mb-1">
              Loser's Forfeit / Punishment
            </label>
            <textarea
              rows={2}
              required
              value={forfeitDescription}
              onChange={(e) => setForfeitDescription(e.target.value)}
              className="w-full bg-[var(--bg-card-subtle)] border border-rose-500/30 rounded-xl p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition shadow-xs"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
