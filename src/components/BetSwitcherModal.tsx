import React from 'react';
import { X, Trophy, Plus, Check, Trash2, Calendar, Target, ArrowRight } from 'lucide-react';
import { BetGroup } from '../types';

interface BetSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  allBets: BetGroup[];
  activeBetId: string;
  onSelectBet: (betId: string) => void;
  onOpenCreateBet: () => void;
  onDeleteBet: (betId: string) => void;
}

export const BetSwitcherModal: React.FC<BetSwitcherModalProps> = ({
  isOpen,
  onClose,
  allBets,
  activeBetId,
  onSelectBet,
  onOpenCreateBet,
  onDeleteBet
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal max-w-lg">
        <div className="modal-head">
          <div>
            <h2>Your Wagers & Showdowns</h2>
            <p>
              View all your created bets, switch between active showdowns, or create a new wager.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {allBets.map((bet) => {
            const isActive = bet.id === activeBetId;
            return (
              <div
                key={bet.id}
                className={`clean-card rounded-xl p-4 bg-[var(--surface)] border transition ${
                  isActive
                    ? 'border-[var(--green)]/60 bg-[var(--green-pale)]'
                    : 'border-[var(--line)] hover:border-[var(--muted)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-[var(--green)] text-black font-bold'
                          : 'bg-[var(--surface-subtle)] text-[var(--muted)]'
                      }`}
                    >
                      <Trophy size={17} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <b className="text-sm font-bold text-[var(--text)] truncate">{bet.title}</b>
                        {isActive && (
                          <span className="text-xs font-semibold text-[var(--green)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-1 flex-wrap font-mono-num">
                        <span className="font-bold text-[var(--text)]">
                          {bet.currency || '₹'}{bet.potAmount} Pot
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {bet.targetDeadline}
                        </span>
                        {bet.creatorName && (
                          <>
                            <span>·</span>
                            <span>By {bet.creatorName}</span>
                          </>
                        )}
                      </div>

                      {bet.forfeitDescription && (
                        <p className="text-xs text-[var(--muted)] mt-1.5 truncate">
                          <span className="font-semibold text-[var(--text)]">Penalty:</span> {bet.forfeitDescription}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {!isActive && (
                      <button
                        className="btn-primary text-xs h-8 px-3"
                        onClick={() => {
                          onSelectBet(bet.id);
                          onClose();
                        }}
                      >
                        <span>Switch</span>
                        <ArrowRight size={13} />
                      </button>
                    )}

                    {allBets.length > 1 && (
                      <button
                        className="btn-danger text-xs h-8 px-2.5"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${bet.title}"?`)) {
                            onDeleteBet(bet.id);
                          }
                        }}
                        title="Delete bet"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-[var(--muted)]">
            {allBets.length} {allBets.length === 1 ? 'wager' : 'wagers'} configured
          </span>

          <button
            className="btn-primary text-xs"
            onClick={() => {
              onClose();
              onOpenCreateBet();
            }}
          >
            <Plus size={15} />
            <span>Create another bet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
