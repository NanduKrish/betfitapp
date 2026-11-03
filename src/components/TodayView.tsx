import React from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, BetGroup, ActivityLog, WeighIn } from '../types';
import { DISCIPLINES } from '../data/constants';
import { DisciplineIcon } from './DisciplineIcon';
import { Avatar } from './Avatar';
import {
  calculateGoalProgress,
  calculateWeightDelta,
  calculateRequiredPace,
  isDangerZone
} from '../utils/calculations';
import {
  Flame,
  Check,
  Plus,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Sliders,
  Share2,
  Trophy
} from 'lucide-react';

interface TodayViewProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  betGroup: BetGroup;
  todayActivities: ActivityLog[];
  weighIns: WeighIn[];
  onToggleActivity: (activityId: string, completed: boolean) => void;
  onOpenWeighInModal: () => void;
  onOpenDisciplineModal: () => void;
  onOpenShareModal: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  currentUser,
  allUsers,
  betGroup,
  todayActivities,
  onToggleActivity,
  onOpenWeighInModal,
  onOpenDisciplineModal,
  onOpenShareModal,
  onNavigateToTab
}) => {
  const goalProgress = calculateGoalProgress(
    currentUser.startingWeight,
    currentUser.currentWeight,
    currentUser.targetWeight,
    currentUser.goalType
  );

  const weightDelta = calculateWeightDelta(
    currentUser.startingWeight,
    currentUser.currentWeight,
    currentUser.targetWeight,
    currentUser.goalType
  );

  const pace = calculateRequiredPace(
    currentUser.currentWeight,
    currentUser.targetWeight,
    betGroup.targetDeadline,
    currentUser.goalType
  );

  const inDanger = isDangerZone(
    currentUser.startingWeight,
    currentUser.currentWeight,
    currentUser.targetWeight,
    betGroup.targetDeadline,
    currentUser.goalType
  );

  const completedCount = todayActivities.filter((a) => a.completed).length;
  const isDayFullyComplete = todayActivities.length > 0 && completedCount === todayActivities.length;

  const handleCheckin = (act: ActivityLog) => {
    const next = !act.completed;
    onToggleActivity(act.id, next);
    
    // Only celebrate with confetti if completing the final activity of the day!
    if (next && completedCount + 1 === todayActivities.length) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#10b981', '#34d399', '#f59e0b']
      });
    }
  };

  // Rank users by goal progress
  const rankedUsers = [...allUsers].sort((a, b) => {
    const pA = calculateGoalProgress(a.startingWeight, a.currentWeight, a.targetWeight, a.goalType);
    const pB = calculateGoalProgress(b.startingWeight, b.currentWeight, b.targetWeight, b.goalType);
    return pB - pA;
  });

  return (
    <div className="mobile-container space-y-4 pb-20 pt-1">
      {/* 1. Modern Bet Overview Card */}
      <div className="clean-card rounded-2xl p-3.5 flex items-center justify-between text-xs text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition">
        <div
          onClick={() => onNavigateToTab('bet')}
          className="flex items-center gap-2.5 cursor-pointer flex-1"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <span>{betGroup.title}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded font-mono-num">
                {betGroup.currency || '₹'}{betGroup.potAmount}
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] font-mono-num font-medium">
              {pace.daysLeft} days left until Dec 31
            </div>
          </div>
        </div>

        <button
          onClick={onOpenShareModal}
          className="py-1 px-2.5 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--border-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1 text-[11px] font-medium"
          title="Share Invite Link"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Invite</span>
        </button>
      </div>

      {/* 2. Weight Progress Card */}
      <div className="clean-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {currentUser.goalType === 'gain' ? 'Bulking Progress' : 'Weight Progress'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]">
              {currentUser.goalType === 'gain' ? 'Bulk' : 'Cut'}
            </span>
          </div>

          <button
            onClick={onOpenWeighInModal}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:opacity-80 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Log Weight
          </button>
        </div>

        {/* Big Weight Figures */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-[var(--text-primary)] font-mono-num tracking-tight">
                {currentUser.currentWeight}
              </span>
              <span className="text-sm font-semibold text-[var(--text-secondary)]">
                {currentUser.weightUnit}
              </span>
            </div>

            <div className={`text-xs font-medium flex items-center gap-1 mt-0.5 ${
              weightDelta.onTrackDirection
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-500'
            }`}>
              {currentUser.goalType === 'gain' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{weightDelta.label} (Baseline: {currentUser.startingWeight})</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-[var(--text-secondary)] block">Target for Dec 31</span>
            <span className="text-lg font-bold text-[var(--text-primary)] font-mono-num">
              {currentUser.targetWeight} {currentUser.weightUnit}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[var(--text-secondary)]">
              {currentUser.goalType === 'gain' ? 'Bulk Goal Completed' : 'Weight Loss Goal'}
            </span>
            <span className="text-[var(--text-primary)] font-mono-num font-bold">{goalProgress}%</span>
          </div>
          <div className="w-full bg-[var(--bg-card-subtle)] rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                inDanger ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>

        {/* Pace Indicator */}
        <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            {inDanger ? (
              <span className="flex items-center gap-1 text-rose-500 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" /> Behind target pace
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> On pace
              </span>
            )}
          </div>
          <span className="text-[var(--text-secondary)] font-mono-num text-[11px]">
            Target rate: <strong className="text-[var(--text-primary)]">{currentUser.goalType === 'gain' ? '+' : '-'}{pace.pacePerWeek} kg/wk</strong>
          </span>
        </div>
      </div>

      {/* 3. Today's Habits (The Daily Core) */}
      <div className="clean-card rounded-2xl p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Today's Habits</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {completedCount} of {todayActivities.length} completed
              {isDayFullyComplete ? ' • Streak secured for today!' : ' • Complete all to build streak'}
            </p>
          </div>

          <button
            onClick={onOpenDisciplineModal}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-[var(--bg-card-subtle)] transition"
          >
            <Sliders className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        {/* Tactile Habit Cards */}
        <div className="space-y-2">
          {todayActivities.map((act) => {
            const meta = DISCIPLINES[act.discipline] || DISCIPLINES.custom;
            return (
              <button
                key={act.id}
                onClick={() => handleCheckin(act)}
                className={`w-full clean-card-interactive text-left p-3.5 rounded-xl flex items-center justify-between gap-3 border transition ${
                  act.completed
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                    act.completed
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                      : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
                  }`}>
                    <DisciplineIcon discipline={act.discipline} className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm leading-snug ${
                      act.completed ? 'line-through opacity-75' : 'text-[var(--text-primary)]'
                    }`}>
                      {meta.label}
                    </h4>
                    <span className="text-[11px] text-[var(--text-secondary)] font-normal">
                      {act.completed ? 'Completed' : meta.description}
                    </span>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  act.completed
                    ? 'bg-emerald-500 text-white font-bold shadow-xs'
                    : 'border-2 border-[var(--border-color)] hover:border-zinc-400'
                }`}>
                  {act.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Streak Info Footer */}
        <div className="pt-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400 font-mono-num">
            <Flame className="w-4 h-4 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
            {currentUser.streakCount} Day Consecutive Streak
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            {currentUser.streakShields} shield banked
          </span>
        </div>
      </div>

      {/* 4. Mini Leaderboard Preview */}
      <div
        onClick={() => onNavigateToTab('bet')}
        className="cursor-pointer clean-card rounded-2xl p-4 hover:border-[var(--border-hover)] transition space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Current Standings
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
            Full Board <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="space-y-2">
          {rankedUsers.slice(0, 4).map((u, idx) => {
            const p = calculateGoalProgress(u.startingWeight, u.currentWeight, u.targetWeight, u.goalType);
            const isMe = u.id === currentUser.id;
            return (
              <div
                key={u.id}
                className={`flex items-center justify-between py-1.5 px-2 rounded-xl text-xs ${
                  isMe
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[var(--text-muted)] font-mono-num text-[11px] w-3">
                    {idx + 1}
                  </span>
                  <Avatar
                    initials={u.avatarInitials || u.name}
                    color={u.avatarColor || 'zinc'}
                    size="sm"
                  />
                  <span className="truncate max-w-[120px] font-medium">{u.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-num font-semibold text-[11px]">{p}%</span>
                  <div className="w-14 bg-[var(--bg-card-subtle)] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${p}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
