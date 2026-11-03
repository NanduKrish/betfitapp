import React from 'react';
import { Plus, TrendingDown, TrendingUp, Calendar, Weight } from 'lucide-react';
import { UserProfile, WeighIn } from '../types';
import { calculateWeightDelta, calculateGoalProgress } from '../utils/calculations';

interface HistoryViewProps {
  currentUser: UserProfile;
  weighIns: WeighIn[];
  onOpenWeighInModal: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  currentUser,
  weighIns,
  onOpenWeighInModal
}) => {
  const sortedWeighIns = [...weighIns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const delta = calculateWeightDelta(
    currentUser.startingWeight,
    currentUser.currentWeight,
    currentUser.targetWeight,
    currentUser.goalType
  );

  const progress = calculateGoalProgress(
    currentUser.startingWeight,
    currentUser.currentWeight,
    currentUser.targetWeight,
    currentUser.goalType
  );

  // SVG Sparkline calculation
  const chronological = [...weighIns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weights = chronological.map((w) => w.weight);
  const minW = Math.min(...weights, currentUser.targetWeight, currentUser.startingWeight) - 1;
  const maxW = Math.max(...weights, currentUser.targetWeight, currentUser.startingWeight) + 1;
  const range = maxW - minW || 1;

  const width = 600;
  const height = 180;
  const padding = 20;

  const points = chronological.map((w, idx) => {
    const x = padding + (idx / Math.max(1, chronological.length - 1)) * (width - padding * 2);
    const y = height - padding - ((w.weight - minW) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">YOUR JOURNEY</div>
          <h1>Weight Progress</h1>
          <p>
            Track your official weigh-ins toward your {currentUser.goalType === 'gain' ? 'bulking' : 'weight loss'} goal.
          </p>
        </div>
        <div className="page-head-actions">
          <button className="btn-primary" onClick={onOpenWeighInModal}>
            <Plus size={16} /> Log weight
          </button>
        </div>
      </div>

      {/* Progress Metrics Summary */}
      <div className="progress-summary">
        <div>
          <span>CURRENT WEIGHT</span>
          <b>
            {currentUser.currentWeight} {currentUser.weightUnit}
          </b>
        </div>
        <div>
          <span>STARTING POINT</span>
          <b>
            {currentUser.startingWeight} {currentUser.weightUnit}
          </b>
        </div>
        <div>
          <span>TARGET (DEC 31)</span>
          <b>
            {currentUser.targetWeight} {currentUser.weightUnit}
          </b>
        </div>
        <div>
          <span>GOAL PROGRESS</span>
          <b>{progress}%</b>
        </div>
      </div>

      {/* Trajectory Sparkline Curve */}
      {chronological.length > 1 && (
        <div className="section-title">
          <h2>Weight Curve</h2>
          <span>{delta.label}</span>
        </div>
      )}

      {chronological.length > 1 && (
        <div className="clean-card rounded-2xl p-5 mb-8 bg-[var(--surface)] border border-[var(--line)]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 overflow-visible">
            {/* Target Line */}
            {currentUser.targetWeight && (
              <line
                x1={padding}
                y1={height - padding - ((currentUser.targetWeight - minW) / range) * (height - padding * 2)}
                x2={width - padding}
                y2={height - padding - ((currentUser.targetWeight - minW) / range) * (height - padding * 2)}
                stroke="var(--green)"
                strokeDasharray="4 4"
                strokeWidth="1.2"
                opacity="0.6"
              />
            )}

            {/* Trajectory Line */}
            <polyline
              fill="none"
              stroke="var(--text)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />

            {/* Data Dots */}
            {chronological.map((w, idx) => {
              const cx = padding + (idx / Math.max(1, chronological.length - 1)) * (width - padding * 2);
              const cy = height - padding - ((w.weight - minW) / range) * (height - padding * 2);
              const isLatest = idx === chronological.length - 1;
              return (
                <g key={w.id}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isLatest ? 5 : 3.5}
                    fill={isLatest ? 'var(--green)' : 'var(--surface)'}
                    stroke="var(--text)"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>
          <div className="flex justify-between text-xs text-[var(--muted)] font-mono-num mt-2 pt-2 border-t border-[var(--line)]">
            <span>Started: {chronological[0]?.date}</span>
            <span className="text-[var(--green)] font-semibold">Target: {currentUser.targetWeight} {currentUser.weightUnit}</span>
            <span>Latest: {chronological[chronological.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* History Log Table */}
      <div className="section-title">
        <h2>Check-in History</h2>
        <span>{sortedWeighIns.length} recorded entries</span>
      </div>

      {sortedWeighIns.length > 0 ? (
        <div className="list-card weight-history">
          <div className="list-heading">Weigh-in Records</div>
          {sortedWeighIns.map((log, index) => {
            const nextLog = sortedWeighIns[index + 1];
            const change = nextLog ? log.weight - nextLog.weight : null;

            return (
              <div key={log.id} className="weight-row">
                <div>
                  <b>
                    {log.weight} {currentUser.weightUnit}
                  </b>
                  <small>{log.date} {log.notes ? `· ${log.notes}` : ''}</small>
                </div>

                {change !== null && (
                  <span className="change-note">
                    {change > 0 ? '↑' : change < 0 ? '↓' : '—'}{' '}
                    {Math.abs(change).toFixed(1)} {currentUser.weightUnit}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-card tall">
          <div className="empty-icon">
            <Weight size={22} />
          </div>
          <b>Your progress starts here</b>
          <p>
            Add your baseline weight check-in to start mapping your weight curve toward the December deadline.
          </p>
          <button className="btn-primary" onClick={onOpenWeighInModal}>
            <Plus size={15} /> Add first weight entry
          </button>
        </div>
      )}
    </div>
  );
};
