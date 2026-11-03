import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, GoalType, DisciplineType } from '../types';
import { DISCIPLINES } from '../data/constants';
import { DisciplineIcon } from './DisciplineIcon';
import { Avatar } from './Avatar';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteOnboarding: (newProfile: UserProfile) => void;
}

const COLOR_OPTIONS = ['emerald', 'cyan', 'indigo', 'violet', 'amber', 'rose'] as const;

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onCompleteOnboarding
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState('');
  const [avatarColor, setAvatarColor] = useState<string>('emerald');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [goalType, setGoalType] = useState<GoalType>('loss');
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [selectedDisciplines, setSelectedDisciplines] = useState<DisciplineType[]>([
    'gym',
    'swimming'
  ]);

  if (!isOpen) return null;

  const currentNum = parseFloat(currentWeight) || 0;
  const targetNum = parseFloat(targetWeight) || 0;
  const delta = currentNum > 0 && targetNum > 0 ? Math.abs(currentNum - targetNum).toFixed(1) : '0';

  // Compute initials
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

  const handleFinish = () => {
    if (!name.trim() || currentNum <= 0 || targetNum <= 0) return;

    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: `${name.trim()} (You)`,
      avatarInitials: initials,
      avatarColor,
      startingWeight: currentNum,
      currentWeight: currentNum,
      targetWeight: targetNum,
      weightUnit,
      goalType,
      chosenDisciplines: selectedDisciplines,
      streakCount: 0,
      streakShields: 1,
      lastActiveDate: '2026-11-03',
      statusQuote: goalType === 'gain' ? 'Bulking phase initiated. Consistent nutrition & heavy lifts.' : 'Day 1 of the journey. Clean eating & daily habits locked in.'
    };

    onCompleteOnboarding(newProfile);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="relative w-full max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 space-y-4 text-[var(--text-primary)]">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center font-mono-num">
              {step}
            </span>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {step === 1 && 'Profile Details'}
              {step === 2 && 'Weight Goal'}
              {step === 3 && 'Chosen Habits'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: Name, Color theme, Unit */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Create Profile</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Set up your clean slate to track your December bet
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1">
                Your Name
              </label>
              <div className="flex items-center gap-2.5">
                <Avatar initials={initials} color={avatarColor} size="lg" />
                <input
                  type="text"
                  placeholder="e.g. Nandu"
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">
                Profile Color
              </label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition border ${
                      avatarColor === c ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-950 scale-105' : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full ${
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

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1">
                Measurement Unit
              </label>
              <div className="flex gap-2">
                {(['kg', 'lbs'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setWeightUnit(u)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase transition ${
                      weightUnit === u
                        ? 'bg-emerald-500 text-zinc-950 font-bold shadow-xs'
                        : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => setStep(2)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs mt-2"
            >
              <span>Next: Set Weight Target</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Weights + Loss/Gain switch */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Your Target</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                The bet deadline is December 31st
              </p>
            </div>

            {/* Goal Direction */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1">
                Goal Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGoalType('loss')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
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
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
                    goalType === 'gain'
                      ? 'bg-emerald-500 text-zinc-950 font-bold shadow-xs'
                      : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                  }`}
                >
                  Bulking (Gain)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1">
                  Current ({weightUnit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={goalType === 'loss' ? '85.0' : '70.0'}
                  autoFocus
                  required
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xl font-bold font-mono-num text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1">
                  Target ({weightUnit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={goalType === 'loss' ? '76.0' : '78.0'}
                  required
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xl font-bold font-mono-num text-emerald-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {currentNum > 0 && targetNum > 0 && (
              <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">
                    {goalType === 'gain' ? 'Target to Gain:' : 'Target to Lose:'}
                  </span>
                  <span className="font-bold text-emerald-500 font-mono-num">
                    {goalType === 'gain' ? `+${delta}` : `-${delta}`} {weightUnit}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] text-xs font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                disabled={currentNum <= 0 || targetNum <= 0}
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <span>Next: Choose Habits</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Choose Activities (with Lucide icons) */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Your Activities</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Select what you track daily (Gym, Swimming, etc.)
              </p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {Object.values(DISCIPLINES).map((d) => {
                const isSelected = selectedDisciplines.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDiscipline(d.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-[var(--bg-card-subtle)] flex items-center justify-center">
                        <DisciplineIcon discipline={d.id} className="w-3.5 h-3.5" />
                      </div>
                      <span>{d.label}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      isSelected ? 'bg-emerald-500 text-zinc-950 font-bold' : 'border border-[var(--border-color)]'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-4 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] text-xs font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enter Clean Slate</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
