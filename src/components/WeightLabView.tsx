import React, { useState } from 'react';
import { UserProfile, WeighIn, BetGroup } from '../types';
import {
  calculateGoalProgress,
  calculateWeightLost,
  calculateRequiredPace
} from '../utils/calculations';
import {
  Scale,
  Plus,
  TrendingDown,
  Calendar,
  CheckCircle,
  Award,
  Sparkles,
  Info
} from 'lucide-react';

interface WeightLabViewProps {
  currentUser: UserProfile;
  weighIns: WeighIn[];
  betGroup: BetGroup;
  onOpenWeighInModal: () => void;
}

export const WeightLabView: React.FC<WeightLabViewProps> = ({
  currentUser,
  weighIns,
  betGroup,
  onOpenWeighInModal
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<WeighIn | null>(null);

  const goalProgress = calculateGoalProgress(
    currentUser.startingWeight,
    currentUser.currentWeight,
    currentUser.targetWeight
  );
  const totalLost = calculateWeightLost(currentUser.startingWeight, currentUser.currentWeight);
  const pace = calculateRequiredPace(currentUser.currentWeight, currentUser.targetWeight, betGroup.targetDeadline);

  // Milestone Definitions
  const milestones = [
    { percent: 25, title: 'Quarter Smasher', desc: 'First 25% of weight shed', unlocked: goalProgress >= 25, icon: '🥉' },
    { percent: 50, title: 'Halfway Hero', desc: '50% of the journey conquered', unlocked: goalProgress >= 50, icon: '🥈' },
    { percent: 75, title: 'Home Stretch', desc: '75% melted! Winner’s crown in sight', unlocked: goalProgress >= 75, icon: '🥇' },
    { percent: 100, title: 'Bet Victor', desc: 'Target weight crushed before deadline!', unlocked: goalProgress >= 100, icon: '👑' }
  ];

  // SVG Chart Calculations
  // Chart dimensions
  const width = 650;
  const height = 240;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };

  const allWeights = weighIns.map((w) => w.weight);
  const minWeight = Math.min(...allWeights, currentUser.targetWeight) - 1.5;
  const maxWeight = Math.max(...allWeights, currentUser.startingWeight) + 1.5;
  const weightRange = Math.max(1, maxWeight - minWeight);

  const getY = (w: number) => {
    return height - padding.bottom - ((w - minWeight) / weightRange) * (height - padding.top - padding.bottom);
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return padding.left + (width - padding.left - padding.right) / 2;
    return padding.left + (index / (total - 1)) * (width - padding.left - padding.right);
  };

  // Build SVG path
  const points = weighIns.map((w, idx) => ({
    x: getX(idx, weighIns.length),
    y: getY(w.weight),
    data: w
  }));

  const pathD = points.length > 0
    ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
    : '';

  // Area fill
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x},${height - padding.bottom} L ${points[0].x},${height - padding.bottom} Z`
    : '';

  const startY = getY(currentUser.startingWeight);
  const targetY = getY(currentUser.targetWeight);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Bar with Stats */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Analytics & Verification
          </span>
          <h2 className="text-2xl font-black font-heading text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-emerald-400" /> The Weight Lab
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tracking your journey from <span className="text-white font-bold">{currentUser.startingWeight}kg</span> to{' '}
            <span className="text-emerald-400 font-bold">{currentUser.targetWeight}kg</span> for the Dec 31 Bet.
          </p>
        </div>

        <button
          onClick={onOpenWeighInModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 self-start md:self-auto transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Log New Weigh-In
        </button>
      </div>

      {/* 2. Interactive Weight Trend Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
              <span>Weight Progress Curve</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                -{totalLost}kg Lost Total
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Hover over points to inspect specific weigh-in entries and progress dates.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 bg-slate-500 border border-slate-500 border-dashed" />
              <span>Start Baseline ({currentUser.startingWeight}kg)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-3 h-0.5 bg-emerald-400" />
              <span>Target ({currentUser.targetWeight}kg)</span>
            </div>
          </div>
        </div>

        {/* SVG Visualization Canvas */}
        <div className="w-full overflow-x-auto bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Target Weight Guideline (Green) */}
            <line
              x1={padding.left}
              y1={targetY}
              x2={width - padding.right}
              y2={targetY}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.8"
            />
            <text
              x={padding.left - 8}
              y={targetY + 4}
              textAnchor="end"
              fill="#10b981"
              fontSize="10"
              fontWeight="bold"
              className="font-mono-num"
            >
              {currentUser.targetWeight}
            </text>

            {/* Starting Weight Guideline (Gray) */}
            <line
              x1={padding.left}
              y1={startY}
              x2={width - padding.right}
              y2={startY}
              stroke="#64748b"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.5"
            />
            <text
              x={padding.left - 8}
              y={startY + 4}
              textAnchor="end"
              fill="#94a3b8"
              fontSize="10"
              className="font-mono-num"
            >
              {currentUser.startingWeight}
            </text>

            {/* Shaded Area Fill */}
            {areaD && <path d={areaD} fill="url(#chartGradient)" />}

            {/* Actual Weight Curve Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points */}
            {points.map((p, idx) => (
              <g key={p.data.id} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(p.data)}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint?.id === p.data.id ? '7' : '4.5'}
                  fill="#10b981"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />
                {/* Date label at bottom */}
                <text
                  x={p.x}
                  y={height - 12}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  className="font-mono-num"
                >
                  {p.data.date.slice(5)}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Hovered Point Card */}
        {hoveredPoint && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between text-xs animate-fadeIn">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono-num font-bold">
                Logged on {hoveredPoint.date}
              </span>
              <div className="text-base font-bold text-white font-mono-num">
                {hoveredPoint.weight} kg {hoveredPoint.notes && <span className="text-xs text-slate-400 font-normal">({hoveredPoint.notes})</span>}
              </div>
            </div>
            <span className="text-emerald-400 font-bold font-mono-num">
              {(currentUser.startingWeight - hoveredPoint.weight).toFixed(1)}kg down from start
            </span>
          </div>
        )}
      </div>

      {/* 3. Milestone Checkpoints Grid */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Roadmap to Victory
          </span>
          <h3 className="text-lg font-bold font-heading text-white">
            Weight Loss Milestones
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((m) => (
            <div
              key={m.percent}
              className={`rounded-xl p-4 border transition-all ${
                m.unlocked
                  ? 'bg-emerald-950/20 border-emerald-500/50 glow-emerald'
                  : 'bg-slate-900/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{m.icon}</span>
                {m.unlocked ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" /> UNLOCKED
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    LOCKED ({m.percent}%)
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-white">{m.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Complete Weigh-in History Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-heading text-white">
            Weigh-In Logs ({weighIns.length} recorded)
          </h3>
          <span className="text-xs text-slate-400">
            Current Pace: <span className="font-mono-num font-bold text-white">{pace.pacePerWeek} kg/week</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Weight</th>
                <th className="py-2.5 px-3">Progress vs Start</th>
                <th className="py-2.5 px-3">Weekly Change</th>
                <th className="py-2.5 px-3">Notes & Motivation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {weighIns.map((w, idx) => {
                const prev = idx > 0 ? weighIns[idx - 1] : null;
                const change = prev ? (w.weight - prev.weight).toFixed(1) : '0.0';
                const deltaFromStart = (currentUser.startingWeight - w.weight).toFixed(1);

                return (
                  <tr key={w.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono-num font-semibold text-white">{w.date}</td>
                    <td className="py-2.5 px-3 font-mono-num font-bold text-emerald-400">
                      {w.weight} {currentUser.weightUnit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-num text-slate-300">
                      -{deltaFromStart} {currentUser.weightUnit}
                    </td>
                    <td className="py-2.5 px-3 font-mono-num">
                      {parseFloat(change) < 0 ? (
                        <span className="text-emerald-400 font-semibold">{change} kg</span>
                      ) : parseFloat(change) > 0 ? (
                        <span className="text-rose-400 font-semibold">+{change} kg</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 italic">
                      {w.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
