import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { BetGroup } from '../types';

interface EditBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  betGroup: BetGroup;
  onSave: (updated: BetGroup) => void;
}

export const EditBetModal: React.FC<EditBetModalProps> = ({
  isOpen,
  onClose,
  betGroup,
  onSave
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(betGroup.title);
  const [potAmount, setPotAmount] = useState(betGroup.potAmount.toString());
  const [targetDeadline, setTargetDeadline] = useState(betGroup.targetDeadline);
  const [forfeitDescription, setForfeitDescription] = useState(betGroup.forfeitDescription);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...betGroup,
      title: title.trim(),
      potAmount: parseInt(potAmount) || betGroup.potAmount,
      targetDeadline,
      forfeitDescription: forfeitDescription.trim()
    });
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
            <h2>Edit Wager Terms</h2>
            <p>Update title, total vault pot, forfeit penalty, or target deadline.</p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="field">
            <span>Bet Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <div className="two-fields">
            <label className="field">
              <span>Pot Amount (₹)</span>
              <div className="input-unit">
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={potAmount}
                  onChange={(e) => setPotAmount(e.target.value)}
                  required
                />
                <b>₹</b>
              </div>
            </label>

            <label className="field">
              <span>Target Deadline</span>
              <input
                type="date"
                value={targetDeadline}
                onChange={(e) => setTargetDeadline(e.target.value)}
                required
              />
            </label>
          </div>

          <label className="field">
            <span>Forfeit Penalty Rule</span>
            <input
              value={forfeitDescription}
              onChange={(e) => setForfeitDescription(e.target.value)}
            />
          </label>

          <button className="btn-primary full-btn" type="submit">
            Save changes <Check size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
