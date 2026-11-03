import React, { useState } from 'react';
import { UserProfile, Achievement } from '../types';
import { calculateLevel, getStreakTier } from '../utils/calculations';
import {
  Sparkles,
  Trophy,
  Shield,
  Flame,
  Swords,
  CheckCircle,
  Lock
} from 'lucide-react';

interface QuestsViewProps {
  currentUser: UserProfile;
  achievements: Achievement[];
}

export const QuestsView: React.FC<QuestsViewProps> = ({
  currentUser,
  achievements
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const levelInfo = calculateLevel(currentUser.xp || 100);
  const streakTier = getStreakTier(currentUser.streakCount);

  const filteredBadges = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Character Card */}
      <div className="clean-card rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl font-bold text-emerald-500">
              {currentUser.avatarInitials || 'AK'}
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-black text-xs font-heading shadow-md">
              LVL {levelInfo.level}
            </div>
          </div>

          <div className="space-y-2 text-center md:text-left flex-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{currentUser.name}</h2>
            <div className="pt-2 max-w-md">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-emerald-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> {currentUser.xp || 100} XP
                </span>
                <span className="text-[var(--text-secondary)] font-mono-num">
                  Next Level: {levelInfo.currentLevelXp} / {levelInfo.xpForNextLevel} XP
                </span>
              </div>
              <div className="w-full bg-[var(--bg-card-subtle)] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="clean-card rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredBadges.map((b) => (
            <div key={b.id} className="p-3 rounded-xl border border-[var(--border-color)] flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">{b.title}</h4>
                <p className="text-[11px] text-[var(--text-secondary)]">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
