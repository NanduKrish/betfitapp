import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { UserProfile, GoalType, DisciplineType, BetGroup } from '../types';

interface JoinBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  betData: Partial<BetGroup>;
  onJoinBet: (profile: UserProfile) => void;
}

export const JoinBetModal: React.FC<JoinBetModalProps> = ({
  isOpen,
  onClose,
  betData,
  onJoinBet
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('loss');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [startingWeight, setStartingWeight] = useState('80.0');
  const [targetWeight, setTargetWeight] = useState('74.0');
  const [error, setError] = useState('');

  const handleGoalChange = (g: GoalType) => {
    setGoalType(g);
    if (g === 'gain' && Number(targetWeight) <= Number(startingWeight)) {
      setTargetWeight((Number(startingWeight) + 4).toFixed(1));
    } else if (g === 'loss' && Number(targetWeight) >= Number(startingWeight)) {
      setTargetWeight((Number(startingWeight) - 6).toFixed(1));
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    const start = parseFloat(startingWeight);
    const target = parseFloat(targetWeight);
    if (isNaN(start) || start <= 0 || isNaN(target) || target <= 0) {
      setError('Please enter valid starting and target weights.');
      return;
    }

    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'U';

    const newParticipant: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      avatarInitials: initials,
      avatarColor: 'emerald',
      startingWeight: start,
      currentWeight: start,
      targetWeight: target,
      weightUnit: unit,
      goalType,
      chosenDisciplines: ['gym', 'swimming', 'diet'],
      streakCount: 0,
      streakShields: 1,
      phone: phone.trim() || undefined,
    };

    onJoinBet(newParticipant);
    onClose();
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
            <h2>Join the Wager Showdown</h2>
            <p>You've been invited to join "{betData.title || 'December Showdown'}"!</p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleJoin} className="modal-form">
          <div className="summary-card">
            <div>
              <span>BET SHOWDOWN</span>
              <b>{betData.title}</b>
            </div>
            <div>
              <span>POT STAKES</span>
              <b>{betData.currency || '₹'}{betData.potAmount || 5000} Pot</b>
            </div>
            <div>
              <span>TARGET DEADLINE</span>
              <b>{betData.targetDeadline || '2026-12-31'}</b>
            </div>
          </div>

          <label className="field">
            <span>Your Name</span>
            <input
              autoFocus
              placeholder="What should friends call you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Mobile Number (Optional - for cloud OTP login)</span>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Goal Focus</span>
            <div className="segmented">
              <button
                type="button"
                className={goalType === 'loss' ? 'selected' : ''}
                onClick={() => handleGoalChange('loss')}
              >
                Weight Loss (Cut)
              </button>
              <button
                type="button"
                className={goalType === 'gain' ? 'selected' : ''}
                onClick={() => handleGoalChange('gain')}
              >
                Weight Gain (Bulk)
              </button>
            </div>
          </label>

          <div className="two-fields">
            <label className="field">
              <span>Starting Weight</span>
              <div className="input-unit">
                <input
                  type="number"
                  step="0.1"
                  value={startingWeight}
                  onChange={(e) => setStartingWeight(e.target.value)}
                  required
                />
                <b>kg</b>
              </div>
            </label>

            <label className="field">
              <span>Target Weight</span>
              <div className="input-unit">
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  required
                />
                <b>kg</b>
              </div>
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <button className="btn-primary full-btn" type="submit">
            Accept invite & join bet <Check size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
