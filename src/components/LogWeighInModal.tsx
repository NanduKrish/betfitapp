import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface LogWeighInModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (weight: number, date: string, notes?: string) => void;
}

export const LogWeighInModal: React.FC<LogWeighInModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [weight, setWeight] = useState(currentUser.currentWeight.toString());
  const [date, setDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weight);
    if (isNaN(val) || val <= 20 || val >= 300) {
      setError('Please enter a valid weight.');
      return;
    }
    onSave(val, date, notes.trim() || undefined);
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
            <h2>Log Weight Check-in</h2>
            <p>Update your current weight toward the December deadline. Honest logs build real results.</p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="field">
            <span>Weight ({currentUser.weightUnit})</span>
            <div className="input-unit">
              <input
                autoFocus
                type="number"
                step="0.1"
                min="20"
                max="300"
                placeholder="e.g. 78.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
              <b>{currentUser.weightUnit}</b>
            </div>
          </label>

          <label className="field">
            <span>Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Notes (optional)</span>
            <input
              placeholder="e.g. Morning weigh-in before breakfast"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="btn-primary full-btn" type="submit">
            Save check-in <Check size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
