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
  Activity
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

    // Only celebrate with confetti if completing the final activity of the day
    if (next && completedCount + 1 === todayActivities.length) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#6f895f', '#8ba87a', '#d4953c']
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
    <div>
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">YOUR ARENA</div>
          <h1>Hi, {firstName}.</h1>
          <p>Consistency beats motivation. Every day counts toward the December deadline.</p>
        </div>
        <button className="btn-primary" onClick={onOpenWeighInModal}>
          <Plus size={16} /> Log weight
        </button>
      </div>

      {/* Hero Today Card */}
      <div className="today-card">
        <div className="today-copy">
          <span className="subtle-label">TODAY</span>
          <h2>
            What's one thing<br />
            you can do for yourself?
          </h2>
          <p>
            {completedCount === todayActivities.length && todayActivities.length > 0
              ? 'All chosen habits completed for today. Your consecutive streak is secured.'
              : `Complete all ${todayActivities.length} chosen habits to build your daily streak.`}
          </p>
          <div className="flex items-center gap-3">
            <button className="btn-primary" onClick={onOpenDisciplineModal}>
              <Sliders size={16} /> Edit habits
            </button>
            <button className="btn-secondary" onClick={onOpenShareModal}>
              <Share2 size={16} /> Invite friends
            </button>
          </div>
        </div>

        <div className="today-illustration">
          <div className="circle circle-a" />
          <div className="circle circle-b" />
          <Activity size={38} />
        </div>
      </div>

      {/* 3-Card Overview Grid */}
      <div className="section-title">
        <h2>Your overview</h2>
        <span>Based on verified check-ins</span>
      </div>

      <div className="overview-grid">
        {/* Card 1: Current Weight */}
        <div className="info-card">
          <div className="info-top">
            <span>Current weight</span>
            <Weight size={16} />
          </div>
          <strong>
            {currentUser.currentWeight} <small>{currentUser.weightUnit}</small>
          </strong>
          <p className="flex items-center gap-1.5">
            {currentUser.goalType === 'gain' ? (
              <TrendingUp size={13} className="text-[var(--green)]" />
            ) : (
              <TrendingDown size={13} className="text-[var(--green)]" />
            )}
            <span>
              {weightDelta.label} (Baseline: {currentUser.startingWeight} {currentUser.weightUnit})
            </span>
          </p>
          <button className="card-link" onClick={onOpenWeighInModal}>
            Update weight <ChevronRight size={13} />
          </button>
        </div>

        {/* Card 2: Active Wager */}
        <div className="info-card">
          <div className="info-top">
            <span>Active wager</span>
            <Trophy size={16} />
          </div>
          <strong className="goal-name">{betGroup.title}</strong>
          <p>
            {betGroup.currency || '₹'}
            {betGroup.potAmount} Pot · {pace.daysLeft} days until Dec 31
          </p>
          <button className="card-link" onClick={() => onNavigateToTab('The Bet')}>
            View standings <ChevronRight size={13} />
          </button>
        </div>

        {/* Card 3: Daily Habit Streak */}
        <div className="info-card">
          <div className="info-top">
            <span>Habit streak</span>
            <Flame size={16} />
          </div>
          <strong>
            {currentUser.streakCount} <small>{currentUser.streakCount === 1 ? 'day' : 'days'}</small>
          </strong>
          <p>
            {completedCount} of {todayActivities.length} completed today
            {isDayFullyComplete ? ' · Streak secured!' : ' · Complete all to grow'}
          </p>
          <button className="card-link" onClick={onOpenDisciplineModal}>
            Manage habits <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Today's Habits Section */}
      <div className="section-title recent-title">
        <h2>Today's Habits</h2>
        <span className="font-semibold text-[var(--muted)]">
          {completedCount}/{todayActivities.length} completed
        </span>
      </div>

      <div className="list-card">
        {todayActivities.map((act) => {
          const meta = DISCIPLINES[act.discipline] || DISCIPLINES.custom;
          return (
            <div
              key={act.id}
              onClick={() => handleCheckin(act)}
              className="activity-item cursor-pointer hover:bg-[var(--surface-subtle)] px-2 -mx-2 rounded-lg transition"
            >
              <div
                className={`activity-icon transition-colors ${
                  act.completed ? 'bg-[var(--green-pale)] text-[var(--green-dark)]' : ''
                }`}
              >
                <DisciplineIcon discipline={act.discipline} className="w-4 h-4" />
              </div>

              <div className="activity-detail">
                <b className={act.completed ? 'line-through opacity-70' : ''}>{meta.label}</b>
                <small>{act.completed ? 'Completed for today' : meta.description}</small>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  act.completed
                    ? 'bg-[var(--green)] border-[var(--green)] text-white'
                    : 'border-[var(--line)] hover:border-[var(--muted)]'
                }`}
              >
                {act.completed && <Check size={14} strokeWidth={3} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini Group Standings */}
      <div className="section-title recent-title">
        <h2>Group Standings</h2>
        <button className="card-link" onClick={() => onNavigateToTab('The Bet')}>
          Full arena <ChevronRight size={13} />
        </button>
      </div>

      <div className="list-card">
        {rankedUsers.slice(0, 4).map((u, index) => {
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
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] bg-[var(--surface-subtle)] px-1.5 py-0.5 rounded">
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
    </div>
  );
};
