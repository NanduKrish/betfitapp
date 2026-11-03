import React, { useState } from 'react';
import { DisciplineType } from '../types';
import { DISCIPLINES } from '../data/constants';
import { DisciplineIcon } from './DisciplineIcon';
import { X, Check } from 'lucide-react';

interface DisciplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDisciplines: DisciplineType[];
  onSaveDisciplines: (newDisciplines: DisciplineType[]) => void;
}

export const DisciplineModal: React.FC<DisciplineModalProps> = ({
  isOpen,
  onClose,
  selectedDisciplines,
  onSaveDisciplines
}) => {
  const [selected, setSelected] = useState<DisciplineType[]>(selectedDisciplines);

  if (!isOpen) return null;

  const toggle = (id: DisciplineType) => {
    if (selected.includes(id)) {
      if (selected.length === 1) return; // Keep at least one
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSave = () => {
    onSaveDisciplines(selected);
    onClose();
  };

  const allList = Object.values(DISCIPLINES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="relative w-full max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto text-[var(--text-primary)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Choose Your Habits</h3>
            <p className="text-xs text-[var(--text-secondary)]">Select what you track for the bet</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {allList.map((d) => {
            const isChosen = selected.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggle(d.id)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                  isChosen
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isChosen ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'
                  }`}>
                    <DisciplineIcon discipline={d.id} className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[var(--text-primary)]">{d.label}</h4>
                    <p className="text-[10px] text-[var(--text-secondary)] line-clamp-1">{d.description}</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  isChosen ? 'bg-emerald-500 text-white font-bold' : 'border border-[var(--border-color)]'
                }`}>
                  {isChosen && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition shadow-xs"
          >
            Save Selection
          </button>
        </div>
      </div>
    </div>
  );
};
