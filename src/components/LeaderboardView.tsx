import React, { useState } from 'react';
import { UserProfile, BetGroup, BanterItem } from '../types';
import { DisciplineIcon } from './DisciplineIcon';
import { Avatar } from './Avatar';
import {
  calculateGoalProgress,
  calculateWeightDelta,
  isDangerZone
} from '../utils/calculations';
import {
  Trophy,
  AlertCircle,
  Flame,
  MessageSquare,
  Send,
  Edit2,
  Share2,
  Plus
} from 'lucide-react';

interface LeaderboardViewProps {
  users: UserProfile[];
  currentUser: UserProfile;
  betGroup: BetGroup;
  banterList: BanterItem[];
  onSendBanter: (toUserId: string, text: string, type: 'nudge' | 'cheer' | 'taunt') => void;
  onOpenBetModal: () => void;
  onOpenShareModal: () => void;
  onOpenCreateBetModal: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  users,
  currentUser,
  betGroup,
  banterList,
  onSendBanter,
  onOpenBetModal,
  onOpenShareModal,
  onOpenCreateBetModal
}) => {
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState('');

  // Enhanced & sorted by % of Goal Achieved
  const sorted = [...users]
    .map((u) => {
      const goalPercent = calculateGoalProgress(u.startingWeight, u.currentWeight, u.targetWeight, u.goalType);
      const deltaInfo = calculateWeightDelta(u.startingWeight, u.currentWeight, u.targetWeight, u.goalType);
      const inDanger = isDangerZone(u.startingWeight, u.currentWeight, u.targetWeight, betGroup.targetDeadline, u.goalType);
      return { ...u, goalPercent, deltaInfo, inDanger };
    })
    .sort((a, b) => b.goalPercent - a.goalPercent);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedFriend) return;
    onSendBanter(selectedFriend.id, message, 'taunt');
    setMessage('');
    setSelectedFriend(null);
  };

  return (
    <div className="mobile-container space-y-4 pb-20 pt-1">
      {/* 1. Bet Stakes Header Card */}
      <div className="clean-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>THE BET VAULT</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenShareModal}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:opacity-80 flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" /> Invite
            </button>
            <button
              onClick={onOpenBetModal}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">{betGroup.title}</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Deadline: <span className="font-semibold text-[var(--text-primary)]">{betGroup.targetDeadline}</span>
          </p>
        </div>

        <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
          <div>
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-bold">Winner Pot</span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono-num">
              {betGroup.currency || '₹'}{betGroup.potAmount}
            </span>
          </div>
          <div className="text-right max-w-[200px]">
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-bold">Forfeit</span>
            <span className="text-[var(--text-secondary)] text-[11px] line-clamp-1 font-medium">
              {betGroup.forfeitDescription}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-1 flex gap-2">
          <button
            onClick={onOpenShareModal}
            className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Join Link</span>
          </button>
          <button
            onClick={onOpenCreateBetModal}
            className="py-2 px-3 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--border-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-xs flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Bet</span>
          </button>
        </div>
      </div>

      {/* 2. Ranked Standings List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Standings ({sorted.length} Participants)
          </h3>
          <span className="text-xs text-[var(--text-muted)]">Ranked by Goal %</span>
        </div>

        {sorted.map((u, idx) => {
          const isMe = u.id === currentUser.id;
          return (
            <div
              key={u.id}
              className={`clean-card rounded-2xl p-4 border transition ${
                isMe
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs font-mono-num ${
                    idx === 0
                      ? 'bg-amber-400 text-zinc-950 shadow-xs'
                      : idx === 1
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-[var(--text-primary)]'
                      : idx === 2
                      ? 'bg-amber-700/80 text-white'
                      : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
                  }`}>
                    {idx + 1}
                  </div>

                  <Avatar
                    initials={u.avatarInitials || u.name}
                    color={u.avatarColor || 'zinc'}
                    size="md"
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-sm text-[var(--text-primary)]">
                        {u.name} {isMe && <span className="text-emerald-600 dark:text-emerald-400 text-xs font-normal">(You)</span>}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]">
                        {u.goalType === 'gain' ? 'Bulk' : 'Cut'}
                      </span>
                    </div>

                    {/* Activity Icons & Delta */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex items-center gap-1 text-[var(--text-muted)]">
                        {u.chosenDisciplines.map((d) => (
                          <DisciplineIcon key={d} discipline={d} className="w-3.5 h-3.5" />
                        ))}
                      </div>
                      <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                        • {u.deltaInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Progress & Percentage */}
                <div className="text-right">
                  <div className="text-base font-extrabold text-[var(--text-primary)] font-mono-num">
                    {u.goalPercent}%
                  </div>
                  <div className="w-16 bg-[var(--bg-card-subtle)] rounded-full h-1.5 mt-1 overflow-hidden ml-auto">
                    <div
                      className={`h-full rounded-full ${
                        u.inDanger ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${u.goalPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status / Danger row */}
              <div className="mt-3 pt-2.5 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold font-mono-num text-[11px]">
                    <Flame className="w-3 h-3 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" /> {u.streakCount}d
                  </span>
                  {u.inDanger && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-semibold uppercase flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Danger Zone
                    </span>
                  )}
                </div>

                {!isMe && (
                  <button
                    onClick={() => setSelectedFriend(u)}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 font-medium"
                  >
                    <MessageSquare className="w-3 h-3" /> Nudge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Locker Room Banter */}
      <div className="clean-card rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Friend Activity & Banter
        </h3>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {banterList.slice(0, 5).map((b) => (
            <div key={b.id} className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] text-xs space-y-0.5">
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                <span className="font-semibold text-[var(--text-primary)]">
                  {b.fromName.split(' ')[0]} ➔ {b.toName.split(' ')[0]}
                </span>
                <span>{b.timeAgo}</span>
              </div>
              <p className="text-[var(--text-secondary)]">{b.text}</p>
            </div>
          ))}
        </div>

        {/* Quick Send Input if Friend Selected */}
        {selectedFriend && (
          <form onSubmit={handlePost} className="pt-2 border-t border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Nudge <strong className="text-[var(--text-primary)]">{selectedFriend.name}</strong>:</span>
              <button
                type="button"
                onClick={() => setSelectedFriend(null)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`Friendly message to ${selectedFriend.name.split(' ')[0]}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
