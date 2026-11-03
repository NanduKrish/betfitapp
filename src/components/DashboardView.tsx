import React from 'react';
import { UserProfile, BetGroup, ActivityLog, WeighIn } from '../types';
import { calculateGoalProgress, calculateWeightLost } from '../utils/calculations';

interface DashboardViewProps {
  currentUser: UserProfile;
  betGroup: BetGroup;
  todayActivities: ActivityLog[];
  weighIns: WeighIn[];
  onToggleActivity: (activityId: string, completed: boolean) => void;
  onOpenWeighInModal: () => void;
  onOpenDisciplineModal: () => void;
  onNavigateToTab: (tab: string) => void;
  onOpenBetModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  betGroup,
  todayActivities,
  onToggleActivity,
  onOpenWeighInModal
}) => {
  const goalProgress = calculateGoalProgress(
    currentUser.startingWeight,
    currentUser.currentWeight,
    currentUser.targetWeight
  );
  const totalLost = calculateWeightLost(currentUser.startingWeight, currentUser.currentWeight);

  return (
    <div className="space-y-4 pb-12">
      <div className="clean-card rounded-2xl p-5 space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{betGroup.title}</h2>
        <div className="text-sm font-semibold text-[var(--text-secondary)]">
          Current: {currentUser.currentWeight}kg • Lost: {totalLost}kg • Goal: {goalProgress}%
        </div>
        <button
          onClick={onOpenWeighInModal}
          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs"
        >
          Log Weight
        </button>
      </div>
    </div>
  );
};
