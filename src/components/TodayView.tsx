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
  Users,
  Layers
} from 'lucide-react';
import { UserProfile, BetGroup, ActivityLog, WeighIn } from '../types';
import { DISCIPLINES } from '../data/constants';
import { DisciplineIcon } from './DisciplineIcon';
import { Avatar } from './Avatar';
import { LineDiagramBackground } from './LineDiagramBackground';
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
  allBets?: BetGroup[];
  todayActivities: ActivityLog[];
  weighIns: WeighIn[];
  onToggleActivity: (activityId: string, completed: boolean) => void;
  onOpenWeighInModal: () => void;
  onOpenDisciplineModal: () => void;
  onOpenShareModal: () => void;
  onOpenBetSwitcher?: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  currentUser,
  allUsers,
  betGroup,
  allBets = [],
  todayActivities,
  weighIns,
  onToggleActivity,
  onOpenWeighInModal,
  onOpenDisciplineModal,
  onOpenShareModal,
  onOpenBetSwitcher,
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

    if (next && completedCount + 1 === todayActivities.length) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#34d399', '#22c55e', '#fbbf24']
      });
    }
  };

  const otherUsers = allUsers.filter((u) => u.id !== currentUser.id);
  const rankedUsers = [...allUsers].sort((a, b) => {
    const pA = calculateGoalProgress(a.startingWeight, a.currentWeight, a.targetWeight, a.goalType);
    const pB = calculateGoalProgress(b.startingWeight, b.currentWeight, b.targetWeight, b.goalType);
    return pB - pA;
  });

  // Circular progress math
  const ringRadius = 18;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeOffset = ringCircumference - (habitCompletionPct / 100) * ringCircumference;

  return (
    <div className="space-y-6">
      {/* 1. ELEVATED HERO HEADER WITH FAINT LINE DIAGRAM */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--line)] shadow-xs">
        <LineDiagramBackground variant="topographic" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow block">YOUR ARENA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight font-sans mt-0.5">
              {greeting}.
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--amber-pale)] text-[var(--amber)] border border-[var(--line)] font-mono-num shadow-2xs">
                <Flame size={13} className="fill-[var(--amber)] text-[var(--amber)]" />
                {currentUser.streakCount} Day Streak
              </span>
              <span className="text-xs text-[var(--muted)]">
                {isDayFullyComplete ? '· All habits completed today' : '· Complete all to advance'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="btn-primary" onClick={onOpenWeighInModal}>
              <Plus size={15} />
              <span>Log weight</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. HERO: TODAY'S HABITS WITH ATTRACTIVE WAVE LINE BACKGROUND & VISUAL METER */}
      <div className="relative overflow-hidden clean-card rounded-2xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        <LineDiagramBackground variant="waves" />

        {/* Habit Card Header with Visual Progress Ring */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Circular Ring Progress Meter */}
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r={ringRadius}
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth="3.5"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={ringRadius}
                  fill="none"
                  stroke={isDayFullyComplete ? 'var(--green)' : 'var(--green)'}
                  strokeWidth="3.5"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <span className="absolute font-mono-num text-[11px] font-bold text-[var(--text)]">
                {habitCompletionPct}%
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[var(--text)] font-sans truncate">
                  Today's Habits
                </h2>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border border-[var(--line)] ${
                    isDayFullyComplete
                      ? 'bg-[var(--green-pale)] text-[var(--green)]'
                      : 'bg-[var(--surface-subtle)] text-[var(--muted)]'
                  }`}
                >
                  {isDayFullyComplete ? 'Streak secured' : `${completedCount}/${todayActivities.length} done`}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {isDayFullyComplete
                  ? 'All chosen habits done for today. Keep the momentum going.'
                  : 'Check off each activity to extend your consecutive streak.'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDisciplineModal}
            className="btn-secondary h-8 px-2.5 text-xs font-semibold shrink-0"
          >
            <Sliders size={13} />
            <span>Edit</span>
          </button>
        </div>

        {/* Dynamic Habit Completion Progress Bar */}
        <div className="relative z-10 w-full bg-[var(--surface-subtle)] rounded-full h-2 overflow-hidden border border-[var(--line)]">
          <div
            className="h-full bg-[var(--green)] rounded-full transition-all duration-300"
            style={{ width: `${habitCompletionPct}%` }}
          />
        </div>

        {/* Habit Checklist: Clean & Dignified */}
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
                      ? 'bg-[var(--surface-subtle)] border-[var(--line)] opacity-85 hover:opacity-100'
                      : 'bg-[var(--surface)] hover:bg-[var(--surface-subtle)] border-[var(--line)] text-[var(--text)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                        act.completed
                          ? 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)]'
                          : 'bg-[var(--surface-subtle)] text-[var(--text)]'
                      }`}
                    >
                      <DisciplineIcon discipline={act.discipline} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <b
                        className={`text-sm font-semibold block truncate ${
                          act.completed
                            ? 'line-through text-[var(--muted)] decoration-[var(--muted)]/50 font-normal'
                            : 'text-[var(--text)]'
                        }`}
                      >
                        {meta.label}
                      </b>
                      <small className="text-xs text-[var(--muted)] block truncate mt-0.5">
                        {act.completed ? 'Completed for today' : meta.description}
                      </small>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all shrink-0 ml-3 ${
                      act.completed
                        ? 'bg-[var(--green)] border-[var(--green)] text-black dark:text-black font-bold shadow-xs'
                        : 'border-2 border-[var(--line)] hover:border-[var(--green)]'
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Weight Card */}
        <div className="info-card">
          <div className="info-top">
            <span>Current Weight</span>
            <Weight size={15} />
          </div>

          <div className="flex items-baseline justify-between mt-3">
            <strong>
              {currentUser.currentWeight} <small>{currentUser.weightUnit}</small>
            </strong>
            <span className="text-xs text-[var(--muted)] font-mono-num font-semibold">
              Target: {currentUser.targetWeight} {currentUser.weightUnit}
            </span>
          </div>

          <p className="flex items-center gap-1.5 mt-1.5">
            {currentUser.goalType === 'gain' ? (
              <TrendingUp size={13} className="text-[var(--green)]" />
            ) : (
              <TrendingDown size={13} className="text-[var(--green)]" />
            )}
            <span>
              {weightDelta.label} (Baseline: {currentUser.startingWeight} {currentUser.weightUnit})
            </span>
          </p>

          <div className="w-full bg-[var(--surface-subtle)] rounded-full h-1.5 mt-2.5 overflow-hidden border border-[var(--line)]">
            <div
              className={`h-full rounded-full ${
                inDanger ? 'bg-[var(--danger)]' : 'bg-[var(--green)]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, goalProgress))}%` }}
            />
          </div>

          <button className="card-link mt-4" onClick={onOpenWeighInModal}>
            <span>Update check-in</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Wager Card */}
        <div className="info-card relative overflow-hidden">
          <LineDiagramBackground variant="waves" />

          <div className="relative z-10 info-top">
            <div className="flex items-center gap-2">
              <span>The Wager Vault</span>
              {allBets.length > 1 && onOpenBetSwitcher && (
                <button
                  onClick={onOpenBetSwitcher}
                  className="text-xs font-semibold text-[var(--green)] hover:underline flex items-center gap-0.5"
                  title="Switch active bet"
                >
                  <Layers size={11} />
                  <span>Switch</span>
                </button>
              )}
            </div>
            <Trophy size={15} />
          </div>

          <strong className="relative z-10 goal-name mt-3 truncate">{betGroup.title}</strong>

          <p className="relative z-10 text-xs text-[var(--muted)]">
            {betGroup.currency || '₹'}
            {betGroup.potAmount} Pot · {pace.daysLeft} days remaining until {betGroup.targetDeadline}
          </p>

          <div className="relative z-10 flex items-center justify-between text-xs text-[var(--muted)] mt-1.5 font-mono-num">
            <span>Goal progress: {goalProgress}%</span>
            <span>Target rate: {pace.pacePerWeek} kg/wk</span>
          </div>

          <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-[var(--line)]">
            <button className="card-link" onClick={() => onNavigateToTab('The Bet')}>
              <span>View standings</span>
              <ChevronRight size={13} />
            </button>
            <button
              onClick={onOpenShareModal}
              className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1 transition"
            >
              <Share2 size={13} />
              <span>Invite</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. GROUP STANDINGS PREVIEW */}
      <div className="section-title">
        <h2>Group Standings</h2>
        <button className="card-link" onClick={() => onNavigateToTab('The Bet')}>
          <span>Full standings</span>
          <ChevronRight size={13} />
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
                <div className="w-6 text-xs font-bold text-[var(--muted)] font-mono-num">
                  #{index + 1}
                </div>

                <Avatar initials={u.avatarInitials} colorClass={u.avatarColor} size="sm" />

                <div className="activity-detail">
                  <div className="flex items-center gap-2">
                    <b>{u.name}</b>
                    {isMe && (
                      <span className="text-xs font-semibold text-[var(--green)] bg-[var(--green-pale)] border border-[var(--line)] px-1.5 py-0.5 rounded">
                        YOU
                      </span>
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] bg-[var(--surface-subtle)] border border-[var(--line)] px-1.5 py-0.5 rounded">
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
                    <span className="text-xs text-[var(--danger)] font-semibold flex items-center gap-1 justify-end">
                      <AlertCircle size={11} /> Behind
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--green)] font-semibold">On track</span>
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
