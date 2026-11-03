import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  Waves,
  Footprints,
  Activity,
  Bike,
  Apple,
  Zap,
  Target,
  Trophy
} from 'lucide-react';
import { UserProfile, GoalType, DisciplineType, BetGroup } from '../types';

interface OnboardingFlowProps {
  onFinish: (profile: UserProfile, newBetGroup?: BetGroup) => void;
  onCancel?: () => void;
  existingBet?: BetGroup;
}

const ALL_DISCIPLINES: { id: DisciplineType; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'gym', label: 'Gym & Weights', icon: Dumbbell },
  { id: 'swimming', label: 'Swimming', icon: Waves },
  { id: 'running', label: 'Running', icon: Footprints },
  { id: 'walking', label: 'Daily Steps (10k)', icon: Activity },
  { id: 'diet', label: 'Clean Nutrition', icon: Apple },
  { id: 'cycling', label: 'Cycling', icon: Bike },
  { id: 'calisthenics', label: 'Calisthenics', icon: Zap },
  { id: 'custom', label: 'Sports / Mobility', icon: Target }
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onFinish,
  onCancel,
  existingBet
}) => {
  const [step, setStep] = useState(0);

  // Form State
  const [name, setName] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('loss');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [startingWeight, setStartingWeight] = useState<string>('82.0');
  const [targetWeight, setTargetWeight] = useState<string>('75.0');
  const [targetDate, setTargetDate] = useState<string>('2026-12-31');
  const [selectedDisciplines, setSelectedDisciplines] = useState<DisciplineType[]>([
    'gym',
    'swimming',
    'diet'
  ]);
  const [betChoice, setBetChoice] = useState<'join' | 'create'>('join');
  const [betTitle, setBetTitle] = useState(existingBet?.title || 'December Weight Showdown');
  const [stakeAmount, setStakeAmount] = useState<string>('1000');
  const [forfeitRule, setForfeitRule] = useState<string>('Pays for winner’s victory celebration');
  const [error, setError] = useState('');

  // Auto-switch default weights if toggling goalType
  const handleGoalTypeChange = (type: GoalType) => {
    setGoalType(type);
    if (type === 'gain') {
      if (Number(targetWeight) <= Number(startingWeight)) {
        setTargetWeight((Number(startingWeight) + 5).toFixed(1));
      }
    } else {
      if (Number(targetWeight) >= Number(startingWeight)) {
        setTargetWeight((Number(startingWeight) - 7).toFixed(1));
      }
    }
  };

  const toggleDiscipline = (disc: DisciplineType) => {
    if (selectedDisciplines.includes(disc)) {
      if (selectedDisciplines.length === 1) {
        setError('Keep at least one habit to track consistency.');
        return;
      }
      setSelectedDisciplines(selectedDisciplines.filter((d) => d !== disc));
    } else {
      setSelectedDisciplines([...selectedDisciplines, disc]);
    }
    setError('');
  };

  // Validation
  const validateStep = (s: number): boolean => {
    setError('');
    if (s === 0) {
      if (!name.trim()) {
        setError('Please enter your name.');
        return false;
      }
    } else if (s === 1) {
      const start = parseFloat(startingWeight);
      const target = parseFloat(targetWeight);
      if (isNaN(start) || start <= 0 || isNaN(target) || target <= 0) {
        setError('Please enter valid starting and target weights.');
        return false;
      }
      if (goalType === 'loss' && target >= start) {
        setError('For weight loss, target weight must be lower than starting weight.');
        return false;
      }
      if (goalType === 'gain' && target <= start) {
        setError('For bulking / weight gain, target weight must be higher than starting weight.');
        return false;
      }
    } else if (s === 2) {
      if (selectedDisciplines.length === 0) {
        setError('Please choose at least one activity to track.');
        return false;
      }
    } else if (s === 3) {
      if (betChoice === 'create' && !betTitle.trim()) {
        setError('Please name your wager.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleComplete = () => {
    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'U';

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      avatarInitials: initials,
      avatarColor: 'emerald',
      startingWeight: parseFloat(startingWeight),
      currentWeight: parseFloat(startingWeight),
      targetWeight: parseFloat(targetWeight),
      weightUnit: unit,
      goalType,
      chosenDisciplines: selectedDisciplines,
      streakCount: 0,
      streakShields: 1,
      statusQuote: goalType === 'gain' ? 'Building strength and lean mass.' : 'Focused on consistency and clean eating.'
    };

    let newBet: BetGroup | undefined = undefined;
    if (betChoice === 'create') {
      const stake = parseInt(stakeAmount) || 1000;
      newBet = {
        id: `bet-${Date.now()}`,
        title: betTitle.trim(),
        targetDeadline: targetDate,
        wagerDescription: `${stake} ₹ stake per person by ${targetDate}`,
        potAmount: stake,
        currency: '₹',
        forfeitDescription: forfeitRule.trim() || 'Pays for winner dinner',
        creatorName: name.trim()
      };
    }

    onFinish(newProfile, newBet);
  };

  return (
    <div className="onboarding">
      {/* Top Header */}
      <div className="onboard-top">
        <div className="brand">
          <span className="brand-symbol">b.</span>
          <span>BETFIT</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="step-count">{step + 1} of 5</span>
          {onCancel && (
            <button onClick={onCancel} className="text-xs text-[var(--muted)] hover:text-[var(--text)]">
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Thin Progress Line */}
      <div className="onboard-progress">
        <i style={{ width: `${((step + 1) / 5) * 100}%` }} />
      </div>

      {/* Onboarding Body */}
      <div className="onboard-body">
        <div className="onboard-kicker">LET'S GET STARTED</div>

        {/* Step 0: Name */}
        {step === 0 && (
          <>
            <h1>
              The wager on your health,<br />
              <em>at your pace.</em>
            </h1>
            <p className="intro">
              BetFit Arena turns your fitness journey into a gamified accountability showdown. Track your daily habits, stake a friendly wager, and hit your target weight.
            </p>

            <div className="form-field">
              <label>What should we call you?</label>
              <input
                autoFocus
                placeholder="Your name or nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </div>
            <div className="helper">You can invite and compete with friends in Indian Rupees (₹).</div>
          </>
        )}

        {/* Step 1: Baseline & Goal */}
        {step === 1 && (
          <>
            <h1>
              Set your<br />
              <em>starting point.</em>
            </h1>
            <p className="intro">
              Whether you are cutting down or bulking up, your progress is calculated fairly by percentage of goal achieved.
            </p>

            {/* Goal Switcher */}
            <div className="form-field">
              <label>What is your goal focus?</label>
              <div className="segmented">
                <button
                  type="button"
                  className={goalType === 'loss' ? 'selected' : ''}
                  onClick={() => handleGoalTypeChange('loss')}
                >
                  Weight Loss (Cut)
                </button>
                <button
                  type="button"
                  className={goalType === 'gain' ? 'selected' : ''}
                  onClick={() => handleGoalTypeChange('gain')}
                >
                  Weight Gain (Bulk)
                </button>
              </div>
            </div>

            {/* Unit Switcher */}
            <div className="form-field">
              <label>Measurement Unit</label>
              <div className="unit-switch" style={{ maxWidth: '220px' }}>
                <button
                  type="button"
                  className={unit === 'kg' ? 'selected' : ''}
                  onClick={() => setUnit('kg')}
                >
                  Kilograms (kg)
                </button>
                <button
                  type="button"
                  className={unit === 'lbs' ? 'selected' : ''}
                  onClick={() => setUnit('lbs')}
                >
                  Pounds (lbs)
                </button>
              </div>
            </div>

            {/* Weight Inputs */}
            <div className="form-grid">
              <div className="form-field">
                <label>Starting weight</label>
                <div className="input-unit">
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    placeholder="e.g. 82.5"
                    value={startingWeight}
                    onChange={(e) => setStartingWeight(e.target.value)}
                  />
                  <b>{unit}</b>
                </div>
              </div>

              <div className="form-field">
                <label>Target weight</label>
                <div className="input-unit">
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    placeholder="e.g. 75.0"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                  />
                  <b>{unit}</b>
                </div>
              </div>
            </div>

            <div className="form-field">
              <label>Target deadline</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            <div className="helper">
              {goalType === 'loss'
                ? `Net target: ${(parseFloat(startingWeight || '0') - parseFloat(targetWeight || '0')).toFixed(1)} ${unit} to lose.`
                : `Net target: ${(parseFloat(targetWeight || '0') - parseFloat(startingWeight || '0')).toFixed(1)} ${unit} to build.`}
            </div>
          </>
        )}

        {/* Step 2: Activities / Habits */}
        {step === 2 && (
          <>
            <h1>
              What are your<br />
              <em>chosen habits?</em>
            </h1>
            <p className="intro">
              Each friend chooses their own disciplines. You must complete all your chosen habits each day to build your consecutive streak.
            </p>

            <div className="activity-choices">
              {ALL_DISCIPLINES.map((d) => {
                const Icon = d.icon;
                const isSelected = selectedDisciplines.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    className={isSelected ? 'chosen' : ''}
                    onClick={() => toggleDiscipline(d.id)}
                  >
                    <Icon size={18} />
                    <span>{d.label}</span>
                    {isSelected && <Check size={16} className="choice-check" />}
                  </button>
                );
              })}
            </div>

            <div className="helper">
              {selectedDisciplines.length} activities selected. Complete all daily to build your streak.
            </div>
          </>
        )}

        {/* Step 3: The Wager & Stakes */}
        {step === 3 && (
          <>
            <h1>
              Set the stakes<br />
              <em>with friends.</em>
            </h1>
            <p className="intro">
              Put skin in the game. Join an existing showdown with friends or spin up a clean slate wager.
            </p>

            <div className="choice-cards">
              <button
                type="button"
                className={betChoice === 'join' ? 'chosen' : ''}
                onClick={() => setBetChoice('join')}
              >
                <Trophy size={20} />
                <b>December Showdown</b>
                <small>Join the group bet. Pot: ₹{existingBet?.potAmount || 5000} • Ends Dec 31.</small>
              </button>

              <button
                type="button"
                className={betChoice === 'create' ? 'chosen' : ''}
                onClick={() => setBetChoice('create')}
              >
                <Target size={20} />
                <b>Custom / Blank Slate Bet</b>
                <small>Create a brand new bet with your own custom title, ₹ stake, and forfeit.</small>
              </button>
            </div>

            {betChoice === 'create' && (
              <div className="space-y-3 pt-2">
                <div className="form-field">
                  <label>Bet Title</label>
                  <input
                    placeholder="e.g. New Year Fitness Wager"
                    value={betTitle}
                    onChange={(e) => setBetTitle(e.target.value)}
                  />
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Stake per person</label>
                    <div className="input-unit">
                      <input
                        type="number"
                        placeholder="1000"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                      />
                      <b>₹</b>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Loser Forfeit</label>
                    <input
                      placeholder="e.g. Treats winner to dinner"
                      value={forfeitRule}
                      onChange={(e) => setForfeitRule(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="helper">
              You will be able to share a direct invite link with friends from your dashboard.
            </div>
          </>
        )}

        {/* Step 4: Ready / Summary */}
        {step === 4 && (
          <>
            <div className="ready-icon">
              <Check size={26} strokeWidth={2.5} />
            </div>
            <h1>
              You're all set,<br />
              <em>{name.trim() || 'friend'}.</em>
            </h1>
            <p className="intro">
              Your BetFit space is initialized. Your habits and weight trajectory are locked in. Let's start showing up.
            </p>

            <div className="summary-card">
              <div>
                <span>PROFILE</span>
                <b>{name} ({goalType === 'loss' ? 'Weight Loss' : 'Bulking'})</b>
              </div>
              <div>
                <span>BASELINE & TARGET</span>
                <b>
                  {startingWeight} {unit} → {targetWeight} {unit} (
                  {goalType === 'loss' ? '-' : '+'}
                  {Math.abs(parseFloat(startingWeight) - parseFloat(targetWeight)).toFixed(1)}{' '}
                  {unit})
                </b>
              </div>
              <div>
                <span>DAILY HABITS</span>
                <b>
                  {selectedDisciplines
                    .map((d) => ALL_DISCIPLINES.find((item) => item.id === d)?.label)
                    .filter(Boolean)
                    .join(', ')}
                </b>
              </div>
              <div>
                <span>ACTIVE WAGER</span>
                <b>
                  {betChoice === 'join' ? (existingBet?.title || 'December Showdown') : betTitle} (₹
                  {betChoice === 'join' ? (existingBet?.potAmount || 5000) : stakeAmount} Pot)
                </b>
              </div>
            </div>
          </>
        )}

        {/* Error Notice */}
        {error && <p className="error mt-3">{error}</p>}

        {/* Action Buttons */}
        <div className="onboard-actions">
          {step > 0 ? (
            <button className="btn-quiet" onClick={handleBack}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button className="btn-primary" onClick={handleNext}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn-primary" onClick={handleComplete}>
              Go to my arena <ArrowRight size={16} />
            </button>
          )}
        </div>

        <p className="onboard-foot">
          Your data is stored locally in this browser. You can share your bet link with friends anytime.
        </p>
      </div>
    </div>
  );
};
