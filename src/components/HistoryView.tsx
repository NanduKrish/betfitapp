import React from 'react';
import { UserProfile, WeighIn, BetGroup } from '../types';
import { calculateWeightDelta } from '../utils/calculations';
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';

interface HistoryViewProps {
  currentUser: UserProfile;
  weighIns: WeighIn[];
  betGroup: BetGroup;
  onOpenWeighInModal: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  currentUser,
  weighIns,
  onOpenWeighInModal
}) => {
  const deltaInfo = calculateWeightDelta(
    currentUser.startingWeight,
    currentUser.currentWeight,
    currentUser.targetWeight,
    currentUser.goalType
  );

  // SVG dimensions for mobile
  const width = 360;
  const height = 140;
  const padding = { top: 20, right: 20, bottom: 25, left: 35 };

  const weights = weighIns.map((w) => w.weight);
  const minW = Math.min(...weights, currentUser.targetWeight, currentUser.startingWeight) - 1;
  const maxW = Math.max(...weights, currentUser.startingWeight, currentUser.targetWeight) + 1;
  const range = Math.max(1, maxW - minW);

  const getY = (w: number) => {
    return height - padding.bottom - ((w - minW) / range) * (height - padding.top - padding.bottom);
  };

  const getX = (idx: number, count: number) => {
    if (count <= 1) return width / 2;
    return padding.left + (idx / (count - 1)) * (width - padding.left - padding.right);
  };

  const points = weighIns.map((w, i) => ({
    x: getX(i, weighIns.length),
    y: getY(w.weight),
    data: w
  }));

  const pathD = points.length > 0
    ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
    : '';

  const targetY = getY(currentUser.targetWeight);

  return (
    <div className="mobile-container space-y-4 pb-20 pt-1">
      {/* 1. Header Card */}
      <div className="clean-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {currentUser.goalType === 'gain' ? 'Bulking History' : 'Weight Journey'}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]">
              {currentUser.goalType === 'gain' ? '📈 Gain' : '📉 Loss'}
            </span>
          </div>

          <button
            onClick={onOpenWeighInModal}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center gap-1 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Log Weight
          </button>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <div className="text-3xl font-extrabold text-[var(--text-primary)] font-mono-num">
              {currentUser.currentWeight} <span className="text-sm font-normal text-[var(--text-secondary)]">{currentUser.weightUnit}</span>
            </div>
            <div className={`text-xs font-medium flex items-center gap-1 mt-0.5 ${
              deltaInfo.onTrackDirection ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
            }`}>
              {currentUser.goalType === 'gain' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{deltaInfo.label} from start</span>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-[var(--text-secondary)] block">Target for Dec 31</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono-num">
              {currentUser.targetWeight} {currentUser.weightUnit}
            </span>
          </div>
        </div>

        {/* Minimal Clean Sparkline */}
        <div className="pt-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Target Line */}
            <line
              x1={padding.left}
              y1={targetY}
              x2={width - padding.right}
              y2={targetY}
              stroke="#10b981"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              opacity="0.7"
            />
            <text
              x={padding.left - 4}
              y={targetY + 3}
              textAnchor="end"
              fill="#10b981"
              fontSize="9"
              fontWeight="bold"
              className="font-mono-num"
            >
              {currentUser.targetWeight}
            </text>

            {/* Path */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Points */}
            {points.map((p) => (
              <circle
                key={p.data.id}
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#10b981"
                stroke="var(--bg-card)"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* 2. Chronological Log List */}
      <div className="clean-card rounded-2xl p-4 space-y-2.5">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Weigh-In History ({weighIns.length})
        </h3>

        <div className="divide-y divide-[var(--border-color)]">
          {[...weighIns].reverse().map((w) => {
            const diff = (w.weight - currentUser.startingWeight).toFixed(1);
            return (
              <div key={w.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[var(--text-primary)] font-mono-num">{w.date}</span>
                  {w.notes && <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{w.notes}</p>}
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono-num text-sm">
                    {w.weight} {currentUser.weightUnit}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block font-mono-num">
                    {parseFloat(diff) >= 0 ? `+${diff}` : diff}kg from start
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
