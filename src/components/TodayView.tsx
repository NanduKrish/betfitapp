import React from 'react';
import confetti from 'canvas-confetti';
import {
  Weight,
  Trophy,
  Flame,
  Check,
  Plus,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Sliders,
  Share2,
  Users
} from 'lucide-react';
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
  weighIns,
  onToggleActivity,
  onOpenWeighInModal,
  onOpenDisciplineModal,
  onOpenShareModal,
  onNavigateToTab
}) => {
  const firstName = currentUser.name.split(' ')[0] || 'Friend';
  const greeting =
    firstName.toLowerCase() === 'hi'
      ? `Welcome, ${currentUser.name}`
      : `Hi, ${firstName}`;

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
  const habitCompletionPct = todayActivities.length > 0
    ? Math.round((completedCount / todayActivities.length) * 100)
    : 0;

  const handleCheckin = (act: ActivityLog) => {
    const next = !act.completed;
    onToggleActivity(act.id, next);

    // Only celebrate with confetti if completing the final activity of the day
    if (next && completedCount + 1 === todayActivities.length) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#3cd070', '#28a755', '#fbbf24']
      });
    }
  };

  const otherUsers = allUsers.filter((u) => u.id !== currentUser.id);
  const rankedUsers = [...allUsers].sort((a, b) => {
    const pA = calculateGoalProgress(a.startingWeight, a.currentWeight, a.targetWeight, a.goalType);
    const pB = calculateGoalProgress(b.startingWeight, b.currentWeight, b.targetWeight, b.goalType);
    return pB - pA;
  });

  return (
    <div className="space-y-6">
      {/* 1. Cleanly Aligned Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">YOUR ARENA</div>
          <h1>{greeting}.</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 font-bold text-xs text-[var(--amber)] bg-[var(--amber-pale)] border border-[var(--line)] px-2.5 py-1 rounded-full font-mono-num">
              <Flame size={13} className="fill-[var(--amber)] text-[var(--amber)]" />
              {currentUser.streakCount} Day Streak
            </span>
            <span className="text-xs text-[var(--muted)]">
              {isDayFullyComplete ? '· Habits finished today' : '· Finish all habits to advance'}
            </span>
          </div>
        </div>

        <div className="page-head-actions">
          <button className="btn-primary" onClick={onOpenWeighInModal}>
            <Plus size={16} /> Log weight
          </button>
        </div>
      </div>

      {/* 2. HERO: TODAY'S HABITS (PRIMARY FOCUS) */}
      <div className="clean-card rounded-2xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        {/* Habit Card Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text)] font-sans">
                Today's Habits
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--line)] ${
                  isDayFullyComplete
                    ? 'bg-[var(--green-pale)] text-[var(--green)]'
                    : 'bg-[var(--surface-subtle)] text-[var(--muted)]'
                }`}
              >
                {isDayFullyComplete ? 'Streak secured today' : 'Complete all to build streak'}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">
              {completedCount} of {todayActivities.length} habits completed ({habitCompletionPct}%)
            </p>
          </div>

          <button
            onClick={onOpenDisciplineModal}
            className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1 py-1 px-2.5 rounded-lg border border-[var(--line)] hover:bg-[var(--surface-subtle)] transition shrink-0"
          >
            <Sliders size={13} /> Edit
          </button>
        </div>

        {/* Dynamic Habit Completion Progress Bar */}
        <div className="w-full bg-[var(--surface-subtle)] rounded-full h-2 overflow-hidden border border-[var(--line)]">
          <div
            className="h-full bg-[var(--green)] rounded-full transition-all duration-300"
            style={{ width: `${habitCompletionPct}%` }}
          />
        </div>

        {/* Tactile Habit Checklist */}
        <div className="space-y-2 pt-1">
          {todayActivities.length > 0 ? (
            todayActivities.map((act) => {
              const meta = DISCIPLINES[act.discipline] || DISCIPLINES.custom;
              return (
                <div
                  key={act.id}
                  onClick={() => handleCheckin(act)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    act.completed
                      ? 'bg-[var(--green-pale)] border-[var(--green)]/40 text-[var(--green)]'
                      : 'bg-[var(--surface)] hover:bg-[var(--surface-subtle)] border-[var(--line)] text-[var(--text)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                        act.completed
                          ? 'bg-[var(--green)]/20 text-[var(--green)]'
                          : 'bg-[var(--surface-subtle)] text-[var(--muted)]'
                      }`}
                    >
                      <DisciplineIcon discipline={act.discipline} className="w-4 h-4" />
                    </div>

                    <div>
                      <b
                        className={`text-xs sm:text-sm font-semibold block ${
                          act.completed ? 'line-through opacity-70' : ''
                        }`}
                      >
                        {meta.label}
                      </b>
                      <small className="text-[10px] text-[var(--muted)] block mt-0.5">
                        {act.completed ? 'Completed for today' : meta.description}
                      </small>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                      act.completed
                        ? 'bg-[var(--green)] border-[var(--green)] text-black dark:text-black shadow-xs font-bold'
                        : 'border-[var(--line)] hover:border-[var(--muted)]'
                    }`}
                  >
                    {act.completed && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 space-y-2">
              <p className="text-xs text-[var(--muted)]">No habits chosen yet.</p>
              <button className="btn-primary text-xs" onClick={onOpenDisciplineModal}>
                <Plus size={14} /> Choose your habits
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. SECONDARY OVERVIEW GRID (WEIGHT & WAGER) */}
      <div className="section-title">
        <h2>Weight & Wager Overview</h2>
        <span>Target: Dec 31, 2026</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Weight Card */}
        <div className="info-card">
          <div className="info-top">
            <span>Current Weight</span>
            <Weight size={16} />
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <strong>
              {currentUser.currentWeight} <small>{currentUser.weightUnit}</small>
            </strong>
            <span className="text-xs text-[var(--muted)] font-mono-num font-semibold">
              Target: {currentUser.targetWeight} {currentUser.weightUnit}
            </span>
          </div>

          <p className="flex items-center gap-1.5 mt-1">
            {currentUser.goalType === 'gain' ? (
              <TrendingUp size={13} className="text-[var(--green)]" />
            ) : (
              <TrendingDown size={13} className="text-[var(--green)]" />
            )}
            <span>
              {weightDelta.label} (Baseline: {currentUser.startingWeight} {currentUser.weightUnit})
            </span>
          </p>

          <div className="w-full bg-[var(--surface-subtle)] rounded-full h-1.5 mt-2 overflow-hidden border border-[var(--line)]">
            <div
              className={`h-full rounded-full ${
                inDanger ? 'bg-[var(--danger)]' : 'bg-[var(--green)]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, goalProgress))}%` }}
            />
          </div>

          <button className="card-link mt-3" onClick={onOpenWeighInModal}>
            Update check-in <ChevronRight size={13} />
          </button>
        </div>

        {/* Wager Card */}
        <div className="info-card">
          <div className="info-top">
            <span>The Wager Vault</span>
            <Trophy size={16} />
          </div>

          <strong className="goal-name mt-3">{betGroup.title}</strong>

          <p className="text-xs text-[var(--muted)]">
            {betGroup.currency || '₹'}
            {betGroup.potAmount} Pot · {pace.daysLeft} days remaining until Dec 31
          </p>

          <div className="flex items-center justify-between text-[10px] text-[var(--muted)] mt-1 font-mono-num">
            <span>Goal progress: {goalProgress}%</span>
            <span>Rate: {pace.pacePerWeek} kg/wk</span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-3">
            <button className="card-link" onClick={() => onNavigateToTab('The Bet')}>
              View standings <ChevronRight size={13} />
            </button>
            <button
              onClick={onOpenShareModal}
              className="text-[11px] font-bold text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1"
            >
              <Share2 size={13} /> Invite
            </button>
          </div>
        </div>
      </div>

      {/* 4. GROUP STANDINGS PREVIEW */}
      <div className="section-title">
        <h2>Group Standings</h2>
        <button className="card-link" onClick={() => onNavigateToTab('The Bet')}>
          Full standings <ChevronRight size={13} />
        </button>
      </div>

      {otherUsers.length > 0 ? (
        <div className="list-card">
          {rankedUsers.map((u, index) => {
            const isMe = u.id === currentUser.id;
            const progress = calculateGoalProgress(
              u.startingWeight,
              u.currentWeight,
              u.targetWeight,
              u.goalType
            );
            const isUserInDanger = isDangerZone(
              u.startingWeight,
              u.currentWeight,
              u.targetWeight,
              betGroup.targetDeadline,
              u.goalType
            );

            return (
              <div key={u.id} className="activity-item">
                <div className="w-5 text-xs font-bold text-[var(--muted)] font-mono-num">
                  #{index + 1}
                </div>

                <Avatar initials={u.avatarInitials} colorClass={u.avatarColor} size="sm" />

                <div className="activity-detail">
                  <div className="flex items-center gap-2">
                    <b>{u.name}</b>
                    {isMe && (
                      <span className="text-[8px] font-bold text-[var(--green)] bg-[var(--green-pale)] border border-[var(--line)] px-1 py-0.2 rounded">
                        YOU
                      </span>
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] bg-[var(--surface-subtle)] border border-[var(--line)] px-1.5 py-0.5 rounded">
                      {u.goalType === 'gain' ? 'Bulk' : 'Cut'}
                    </span>
                  </div>
                  <small>
                    {u.currentWeight}kg · Target: {u.targetWeight}kg
                  </small>
                </div>

                <div className="text-right">
                  <div className="font-bold text-xs text-[var(--text)] font-mono-num">
                    {progress}%
                  </div>
                  {isUserInDanger ? (
                    <span className="text-[9px] text-[var(--danger)] font-semibold flex items-center gap-1 justify-end">
                      <AlertCircle size={10} /> Behind
                    </span>
                  ) : (
                    <span className="text-[9px] text-[var(--green)] font-semibold">On track</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-card">
          <div className="empty-icon">
            <Users size={20} />
          </div>
          <b>You're the first in this showdown!</b>
          <p>
            Share the invite link with your friends so they can join the bet with their own goal and starting weight.
          </p>
          <button className="btn-secondary text-xs" onClick={onOpenShareModal}>
            <Share2 size={14} /> Invite friends with link
          </button>
        </div>
      )}
    </div>
  );
};
