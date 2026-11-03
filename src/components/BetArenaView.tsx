import React, { useState } from 'react';
import { UserProfile, BetGroup, BanterItem } from '../types';
import { DISCIPLINES } from '../data/constants';
import {
  calculateGoalProgress,
  calculateWeightLost,
  calculatePercentBodyWeightLost,
  isDangerZone,
  getStreakTier
} from '../utils/calculations';
import { Crown, DollarSign, MessageSquare, Send } from 'lucide-react';

interface BetArenaViewProps {
  users: UserProfile[];
  currentUser: UserProfile;
  betGroup: BetGroup;
  banterList: BanterItem[];
  onSendBanter: (toUserId: string, text: string, type: 'nudge' | 'cheer' | 'taunt') => void;
  onOpenBetModal: () => void;
}

export const BetArenaView: React.FC<BetArenaViewProps> = ({
  users,
  currentUser,
  betGroup,
  banterList,
  onSendBanter,
  onOpenBetModal
}) => {
  const [selectedUserForBanter, setSelectedUserForBanter] = useState<UserProfile | null>(null);
  const [banterMessage, setBanterMessage] = useState('');

  const enhancedUsers = users.map((u) => {
    const goalPercent = calculateGoalProgress(u.startingWeight, u.currentWeight, u.targetWeight);
    const weightLost = calculateWeightLost(u.startingWeight, u.currentWeight);
    const bodyPercent = calculatePercentBodyWeightLost(u.startingWeight, u.currentWeight);
    const inDanger = isDangerZone(u.startingWeight, u.currentWeight, u.targetWeight, betGroup.targetDeadline);
    const streakTier = getStreakTier(u.streakCount);

    return { ...u, goalPercent, weightLost, bodyPercent, inDanger, streakTier };
  });

  const sortedUsers = [...enhancedUsers].sort((a, b) => b.goalPercent - a.goalPercent);

  const handlePostBanter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!banterMessage.trim() || !selectedUserForBanter) return;
    onSendBanter(selectedUserForBanter.id, banterMessage, 'taunt');
    setBanterMessage('');
    setSelectedUserForBanter(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="clean-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{betGroup.title}</h2>
          <button onClick={onOpenBetModal} className="text-xs text-emerald-500 font-semibold">
            Edit
          </button>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">{betGroup.forfeitDescription}</p>
        <div className="text-lg font-bold text-amber-500">₹{betGroup.potAmount} Pot</div>

        <div className="space-y-2 pt-2">
          {sortedUsers.map((u, i) => (
            <div key={u.id} className="p-3 rounded-xl border border-[var(--border-color)] flex items-center justify-between">
              <span className="font-semibold text-xs text-[var(--text-primary)]">#{i + 1} {u.name}</span>
              <span className="font-mono-num font-bold text-xs">{u.goalPercent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
