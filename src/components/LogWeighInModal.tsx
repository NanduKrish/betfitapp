import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { calculateGoalProgress } from '../utils/calculations';
import { X } from 'lucide-react';

interface LogWeighInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveWeight: (weight: number, date: string, notes?: string) => void;
}

export const LogWeighInModal: React.FC<LogWeighInModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveWeight
}) => {
  const [weight, setWeight] = useState<string>(currentUser.currentWeight.toString());
  const [date, setDate] = useState<string>('2026-11-03');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const numWeight = parseFloat(weight) || 0;
  const newProgress = calculateGoalProgress(currentUser.startingWeight, numWeight, currentUser.targetWeight);
  const diffFromStart = (currentUser.startingWeight - numWeight).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numWeight <= 0) return;

    onSaveWeight(numWeight, date, notes);
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="relative w-full max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-5 space-y-4 text-[var(--text-primary)]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Log Today's Weight</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Weight ({currentUser.weightUnit})
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                required
                autoFocus
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-2xl font-extrabold text-[var(--text-primary)] font-mono-num focus:outline-none focus:border-emerald-500 transition"
              />
              <span className="absolute right-4 top-3.5 text-xs font-semibold text-[var(--text-muted)]">
                {currentUser.weightUnit}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Morning weigh-in after run"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quick Preview */}
          {numWeight > 0 && (
            <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs flex items-center justify-between text-[var(--text-secondary)]">
              <span>Lost vs start: <strong className="text-emerald-500 font-mono-num font-bold">-{diffFromStart}kg</strong></span>
              <span>Goal: <strong className="text-[var(--text-primary)] font-mono-num font-bold">{newProgress}%</strong></span>
            </div>
          )}

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
