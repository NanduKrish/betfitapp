import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { BetGroup, UserProfile, GoalType, DisciplineType } from '../types';
import { DISCIPLINES } from '../data/constants';
import { DisciplineIcon } from './DisciplineIcon';
import { Avatar } from './Avatar';
import { X, Check, Sparkles } from 'lucide-react';

interface JoinBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedBet: BetGroup;
  onJoinBet: (joinedProfile: UserProfile, bet: BetGroup) => void;
}

const COLOR_OPTIONS = ['cyan', 'indigo', 'violet', 'amber', 'rose', 'emerald'] as const;

export const JoinBetModal: React.FC<JoinBetModalProps> = ({
  isOpen,
  onClose,
  sharedBet,
  onJoinBet
}) => {
  const [name, setName] = useState('');
  const [avatarColor, setAvatarColor] = useState<string>('cyan');
  const [goalType, setGoalType] = useState<GoalType>('loss');
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [selectedDisciplines, setSelectedDisciplines] = useState<DisciplineType[]>(['gym', 'swimming']);

  if (!isOpen) return null;

  const currentNum = parseFloat(currentWeight) || 0;
  const targetNum = parseFloat(targetWeight) || 0;

  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const toggleDiscipline = (id: DisciplineType) => {
    if (selectedDisciplines.includes(id)) {
      if (selectedDisciplines.length === 1) return;
      setSelectedDisciplines(selectedDisciplines.filter((d) => d !== id));
    } else {
      setSelectedDisciplines([...selectedDisciplines, id]);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || currentNum <= 0 || targetNum <= 0) return;

    const joinedProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: `${name.trim()} (You)`,
      avatarInitials: initials,
      avatarColor,
      startingWeight: currentNum,
      currentWeight: currentNum,
      targetWeight: targetNum,
      weightUnit: 'kg',
      goalType,
      chosenDisciplines: selectedDisciplines,
      streakCount: 0,
      streakShields: 1,
      lastActiveDate: '2026-11-03',
      statusQuote: goalType === 'gain' ? 'Bulking phase locked in.' : 'Joined the bet, let the journey begin.'
    };

    onJoinBet(joinedProfile, sharedBet);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="relative w-full max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 space-y-4 text-[var(--text-primary)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Bet Invitation</h3>
            <p className="text-[11px] text-[var(--text-secondary)]">You have been invited to compete</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bet Stakes Summary */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5 text-xs">
          <div className="flex items-center justify-between font-bold text-sm">
            <span className="text-[var(--text-primary)]">{sharedBet.title}</span>
            <span className="text-amber-600 dark:text-amber-400 font-mono-num">
              ₹{sharedBet.potAmount} Pot
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Deadline: <strong className="text-[var(--text-primary)]">{sharedBet.targetDeadline}</strong>
          </p>
          <p className="text-[11px] text-rose-500">
            Forfeit: {sharedBet.forfeitDescription}
          </p>
        </div>

        {/* Join Form */}
        <form onSubmit={handleJoin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Your Name
            </label>
            <div className="flex items-center gap-2.5">
              <Avatar initials={initials} color={avatarColor} size="md" />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Rahul"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Color Accent
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition border ${
                    avatarColor === c ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-950 scale-105' : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${
                    c === 'emerald' ? 'bg-emerald-500' :
                    c === 'cyan' ? 'bg-cyan-500' :
                    c === 'indigo' ? 'bg-indigo-500' :
                    c === 'violet' ? 'bg-violet-500' :
                    c === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {/* Goal Type */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Your Goal
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGoalType('loss')}
                className={`py-2 rounded-xl text-xs font-semibold transition ${
                  goalType === 'loss'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-xs'
                    : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                }`}
              >
                Weight Loss
              </button>
              <button
                type="button"
                onClick={() => setGoalType('gain')}
                className={`py-2 rounded-xl text-xs font-semibold transition ${
                  goalType === 'gain'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-xs'
                    : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                }`}
              >
                Bulking (Gain)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Current (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                placeholder={goalType === 'loss' ? '82.0' : '72.0'}
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-base font-bold font-mono-num text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Target (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                placeholder={goalType === 'loss' ? '74.0' : '80.0'}
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-base font-bold font-mono-num text-emerald-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Disciplines */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Your Chosen Activities
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
              {Object.values(DISCIPLINES).map((d) => {
                const isSel = selectedDisciplines.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDiscipline(d.id)}
                    className={`text-left p-1.5 rounded-lg border text-[11px] flex items-center justify-between transition ${
                      isSel
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <DisciplineIcon discipline={d.id} className="w-3.5 h-3.5" />
                      <span className="truncate">{d.label}</span>
                    </div>
                    {isSel && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || currentNum <= 0 || targetNum <= 0}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs mt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Accept Invite & Join Bet</span>
          </button>
        </form>
      </div>
    </div>
  );
};
