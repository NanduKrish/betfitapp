import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { BetGroup } from '../types';

interface CreateBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBet: (bet: BetGroup) => void;
  currentUserName: string;
}

export const CreateBetModal: React.FC<CreateBetModalProps> = ({
  isOpen,
  onClose,
  onCreateBet,
  currentUserName
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('New Year Fitness Showdown');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [stake, setStake] = useState('1000');
  const [forfeit, setForfeit] = useState('Pays for the winner’s dinner celebration');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a bet title.');
      return;
    }
    const stakeNum = parseInt(stake) || 1000;

    const newBet: BetGroup = {
      id: `bet-${Date.now()}`,
      title: title.trim(),
      targetDeadline: deadline,
      wagerDescription: `${stakeNum} ₹ stake per person by ${deadline}`,
      potAmount: stakeNum,
      currency: '₹',
      forfeitDescription: forfeit.trim() || 'Winner dinner',
      creatorName: currentUserName
    };

    onCreateBet(newBet);
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
            <h2>Create a New Bet (Clean Slate)</h2>
            <p>Start a brand new wager with your friends. All stakes are tracked in Indian Rupees (₹).</p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="field">
            <span>Bet Title</span>
            <input
              autoFocus
              placeholder="e.g. December Fitness Showdown"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <div className="two-fields">
            <label className="field">
              <span>Stake per Person (₹)</span>
              <div className="input-unit">
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  required
                />
                <b>₹</b>
              </div>
            </label>

            <label className="field">
              <span>Target Deadline</span>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </label>
          </div>

          <label className="field">
            <span>Loser Forfeit Rule</span>
            <input
              placeholder="e.g. Treats the winner to a celebratory dinner"
              value={forfeit}
              onChange={(e) => setForfeit(e.target.value)}
            />
          </label>

          <div className="modal-hint">
            Once created, you can invite your friends by sending them a direct invite link.
          </div>

          {error && <p className="error">{error}</p>}

          <button className="btn-primary full-btn" type="submit">
            Create bet & start <Check size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
