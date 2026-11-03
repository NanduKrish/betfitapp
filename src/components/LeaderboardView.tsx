import React from 'react';
import {
  Trophy,
  Share2,
  Plus,
  Flame,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { UserProfile, BetGroup, BanterItem } from '../types';
import { Avatar } from './Avatar';
import {
  calculateGoalProgress,
  calculateWeightDelta,
  calculateRequiredPace,
  isDangerZone
} from '../utils/calculations';

interface LeaderboardViewProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  betGroup: BetGroup;
  banterList: BanterItem[];
  onOpenShareModal: () => void;
  onOpenCreateBetModal: () => void;
  onOpenEditBetModal: () => void;
  onSendBanter: (toUser: UserProfile, type: 'nudge' | 'cheer' | 'taunt') => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUser,
  allUsers,
  betGroup,
  banterList,
  onOpenShareModal,
  onOpenCreateBetModal,
  onOpenEditBetModal,
  onSendBanter
}) => {
  // Sort users fairly by % of goal achieved
  const rankedUsers = [...allUsers].sort((a, b) => {
    const pA = calculateGoalProgress(a.startingWeight, a.currentWeight, a.targetWeight, a.goalType);
    const pB = calculateGoalProgress(b.startingWeight, b.currentWeight, b.targetWeight, b.goalType);
    return pB - pA;
  });

  const paceRef = calculateRequiredPace(
    currentUser.currentWeight,
    currentUser.targetWeight,
    betGroup.targetDeadline,
    currentUser.goalType
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">THE WAGER</div>
          <h1>{betGroup.title}</h1>
          <p>
            {betGroup.currency || '₹'}
            {betGroup.potAmount} collective stakes in the vault. Target deadline: December 31.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={onOpenShareModal}>
            <Share2 size={15} /> Invite
          </button>
          <button className="btn-primary" onClick={onOpenCreateBetModal}>
            <Plus size={15} /> New Bet
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="progress-summary">
        <div>
          <span>TOTAL VAULT</span>
          <b>
            {betGroup.currency || '₹'}
            {betGroup.potAmount}
          </b>
        </div>
        <div>
          <span>DAYS REMAINING</span>
          <b>{paceRef.daysLeft} days</b>
        </div>
        <div>
          <span>PARTICIPANTS</span>
          <b>{allUsers.length} Friends</b>
        </div>
        <div>
          <span>FORFEIT PENALTY</span>
          <b className="text-xs truncate">{betGroup.forfeitDescription || 'Dinner'}</b>
        </div>
      </div>

      {/* Standings Title */}
      <div className="section-title">
        <h2>Official Standings</h2>
        <span>Ranked by % of Goal Completed</span>
      </div>

      {/* Ranked Cards */}
      <div className="goal-list">
        {rankedUsers.map((user, idx) => {
          const isMe = user.id === currentUser.id;
          const progress = calculateGoalProgress(
            user.startingWeight,
            user.currentWeight,
            user.targetWeight,
            user.goalType
          );
          const delta = calculateWeightDelta(
            user.startingWeight,
            user.currentWeight,
            user.targetWeight,
            user.goalType
          );
          const pace = calculateRequiredPace(
            user.currentWeight,
            user.targetWeight,
            betGroup.targetDeadline,
            user.goalType
          );
          const inDanger = isDangerZone(
            user.startingWeight,
            user.currentWeight,
            user.targetWeight,
            betGroup.targetDeadline,
            user.goalType
          );

          return (
            <div
              key={user.id}
              className={`goal-card transition ${
                isMe ? 'border-[var(--green)] bg-[var(--green-pale)]' : ''
              }`}
            >
              <div className="flex flex-col items-center justify-center w-8 text-center shrink-0">
                <span className="font-mono-num font-extrabold text-sm text-[var(--muted)]">
                  #{idx + 1}
                </span>
                {idx === 0 && <Trophy size={14} className="text-[var(--amber)] mt-1" />}
              </div>

              <div className="goal-card-icon">
                <Avatar initials={user.avatarInitials} colorClass={user.avatarColor} size="md" />
              </div>

              <div className="goal-main">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="goal-meta">
                      {user.goalType === 'gain' ? 'BULK' : 'CUT'}
                    </span>
                    {isMe && (
                      <span className="text-[9px] font-bold text-[var(--green-dark)] bg-[var(--surface)] px-1.5 py-0.2 rounded border border-[var(--line)]">
                        YOU
                      </span>
                    )}
                  </div>

                  <span className={inDanger ? 'danger-pill' : 'active-pill'}>
                    {inDanger ? 'Behind Pace' : 'On Track'}
                  </span>
                </div>

                <h3>{user.name}</h3>

                <p className="flex items-center gap-2 text-[11px]">
                  <span>
                    Current: <strong>{user.currentWeight}kg</strong>
                  </span>
                  <span>·</span>
                  <span>Target: <strong>{user.targetWeight}kg</strong></span>
                  <span>·</span>
                  <span className="font-semibold text-[var(--green-dark)]">
                    {delta.label}
                  </span>
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-[var(--surface-subtle)] rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      inDanger ? 'bg-[var(--danger)]' : 'bg-[var(--green)]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--muted)] mt-2 font-mono-num">
                  <span>
                    {progress}% goal completed
                  </span>
                  <span>
                    Req: {user.goalType === 'gain' ? '+' : '-'}{pace.pacePerWeek} kg/wk
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Forfeit & Bet Rules Footer */}
      <div className="section-title recent-title">
        <h2>Wager Terms & Rules</h2>
        <button className="card-link" onClick={onOpenEditBetModal}>
          <Sliders size={13} /> Edit Terms
        </button>
      </div>

      <div className="settings-card">
        <div>
          <b>Fair Goal Percentage Engine</b>
          <p>
            Whether cutting fat or gaining muscle, participants are evaluated by % of target weight achieved by Dec 31.
          </p>
        </div>
        <span className="storage-badge">RULE 1</span>
      </div>

      <div className="settings-card">
        <div>
          <b>Loser Forfeit Rule</b>
          <p>{betGroup.forfeitDescription || 'The participant with the lowest progress treats the winner.'}</p>
        </div>
        <span className="storage-badge">PENALTY</span>
      </div>
    </div>
  );
};
