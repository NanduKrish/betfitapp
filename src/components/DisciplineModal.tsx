import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { DisciplineType } from '../types';
import { DISCIPLINES } from '../data/constants';
import { DisciplineIcon } from './DisciplineIcon';

interface DisciplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDisciplines: DisciplineType[];
  onSave: (disciplines: DisciplineType[]) => void;
}

const ALL_DISCIPLINES: DisciplineType[] = [
  'gym',
  'swimming',
  'running',
  'walking',
  'diet',
  'cycling',
  'calisthenics',
  'custom'
];

export const DisciplineModal: React.FC<DisciplineModalProps> = ({
  isOpen,
  onClose,
  currentDisciplines,
  onSave
}) => {
  if (!isOpen) return null;

  const [selected, setSelected] = useState<DisciplineType[]>(currentDisciplines);
  const [error, setError] = useState('');

  const toggle = (d: DisciplineType) => {
    if (selected.includes(d)) {
      if (selected.length === 1) {
        setError('You must keep at least 1 habit to maintain your daily streak.');
        return;
      }
      setSelected(selected.filter((item) => item !== d));
    } else {
      setSelected([...selected, d]);
    }
    setError('');
  };

  const handleSave = () => {
    if (selected.length === 0) {
      setError('Please select at least one habit.');
      return;
    }
    onSave(selected);
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
            <h2>Choose Your Daily Habits</h2>
            <p>
              Select the disciplines you commit to. You must check off all chosen activities every day to build your streak.
            </p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form">
          <div className="activity-choices">
            {ALL_DISCIPLINES.map((d) => {
              const meta = DISCIPLINES[d];
              const isSelected = selected.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  className={isSelected ? 'chosen' : ''}
                  onClick={() => toggle(d)}
                >
                  <DisciplineIcon discipline={d} className="w-4 h-4 shrink-0" />
                  <span>{meta.label}</span>
                  {isSelected && <Check size={16} className="choice-check shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="modal-hint">
            {selected.length} habits selected. Your consecutive streak will depend on completing all of them each day.
          </div>

          {error && <p className="error">{error}</p>}

          <button className="btn-primary full-btn" onClick={handleSave}>
            Save habits <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
