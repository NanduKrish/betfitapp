import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { BetGroup, UserProfile, GoalType, DisciplineType } from '../types';
import { DISCIPLINES } from '../data/constants';
import { DisciplineIcon } from './DisciplineIcon';
import { Avatar } from './Avatar';
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface CreateBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNewBet: (newBet: BetGroup, creatorProfile: UserProfile) => void;
}

const COLOR_OPTIONS = ['emerald', 'cyan', 'indigo', 'violet', 'amber', 'rose'] as const;

export const CreateBetModal: React.FC<CreateBetModalProps> = ({
  isOpen,
  onClose,
  onCreateNewBet
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Bet Details
  const [title, setTitle] = useState('December Fitness Challenge');
  const [targetDeadline, setTargetDeadline] = useState('2026-12-31');
  const [potAmount, setPotAmount] = useState('1000');
  const [forfeitDescription, setForfeitDescription] = useState('Loser contributes ₹1,000 and hosts a celebratory dinner for the winner.');

  // Creator Details
  const [creatorName, setCreatorName] = useState('');
  const [avatarColor, setAvatarColor] = useState<string>('emerald');
  const [goalType, setGoalType] = useState<GoalType>('loss');
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [selectedDisciplines, setSelectedDisciplines] = useState<DisciplineType[]>(['gym', 'swimming']);

  if (!isOpen) return null;

  const currentNum = parseFloat(currentWeight) || 0;
  const targetNum = parseFloat(targetWeight) || 0;

  const initials = creatorName
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

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName.trim() || currentNum <= 0 || targetNum <= 0) return;

    const newBet: BetGroup = {
      id: `bet-${Date.now()}`,
      title,
      targetDeadline,
      wagerDescription: `₹${potAmount} stake per person + Dinner`,
      potAmount: parseFloat(potAmount) || 1000,
      currency: '₹',
      forfeitDescription,
      creatorName: creatorName.trim()
    };

    const creatorProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: `${creatorName.trim()} (You)`,
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
      statusQuote: goalType === 'gain' ? 'Bulking phase initiated. Consistent nutrition & heavy lifts.' : 'Weight loss quest begun. Daily habits locked in.'
    };

    onCreateNewBet(newBet, creatorProfile);

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
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center font-mono-num">
              {step}
            </span>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {step === 1 ? 'Step 1: Set Bet Terms' : 'Step 2: Your Target Goal'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: Bet Setup */}
        {step === 1 && (
          <div className="space-y-3.5">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">New Bet Group</h3>
              <p className="text-xs text-[var(--text-secondary)]">Create a clean slate bet and invite friends via link</p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Bet Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. December Fitness Challenge"
                className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Deadline Date
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
                  Stake (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-[var(--text-muted)]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={potAmount}
                    onChange={(e) => setPotAmount(e.target.value)}
                    className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl pl-7 pr-3 py-2 text-xs font-mono-num font-bold text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-rose-500 mb-1">
                Loser's Forfeit / Terms
              </label>
              <textarea
                rows={2}
                required
                value={forfeitDescription}
                onChange={(e) => setForfeitDescription(e.target.value)}
                placeholder="e.g. Losers contribute ₹1,000 each and host a dinner for the winner."
                className="w-full bg-[var(--bg-card-subtle)] border border-rose-500/30 rounded-xl p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs mt-2"
            >
              <span>Next: Set Your Target</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Creator Profile & Goal */}
        {step === 2 && (
          <form onSubmit={handleFinish} className="space-y-3.5">
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
                  placeholder="e.g. Nandu"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="flex-1 bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Profile color selector */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Profile Color
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

            {/* Goal Type Switcher: Weight Loss vs Weight Gain */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Your Goal Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGoalType('loss')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    goalType === 'loss'
                      ? 'bg-emerald-500 text-zinc-950 font-bold shadow-xs'
                      : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                  }`}
                >
                  <span>Weight Loss</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGoalType('gain')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                    goalType === 'gain'
                      ? 'bg-emerald-500 text-zinc-950 font-bold shadow-xs'
                      : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                  }`}
                >
                  <span>Bulking (Gain)</span>
                </button>
              </div>
            </div>

            {/* Weights */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Starting (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder={goalType === 'loss' ? '85.0' : '70.0'}
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
                  placeholder={goalType === 'loss' ? '76.0' : '78.0'}
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-base font-bold font-mono-num text-emerald-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Disciplines Selection (with Lucide icons) */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Your Chosen Habits
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
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

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-3 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] text-xs font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="submit"
                disabled={!creatorName.trim() || currentNum <= 0 || targetNum <= 0}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Bet & Share</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
