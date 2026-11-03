import { GoalType } from '../types';

export function calculateGoalProgress(
  starting: number,
  current: number,
  target: number,
  goalType?: GoalType
): number {
  const isGain = goalType === 'gain' || target > starting;

  if (isGain) {
    const totalToGain = target - starting;
    if (totalToGain <= 0) return 100;
    const gainedSoFar = current - starting;
    const percentage = (gainedSoFar / totalToGain) * 100;
    return Math.max(0, Math.min(100, parseFloat(percentage.toFixed(1))));
  } else {
    const totalToLose = starting - target;
    if (totalToLose <= 0) return 100;
    const lostSoFar = starting - current;
    const percentage = (lostSoFar / totalToLose) * 100;
    return Math.max(0, Math.min(100, parseFloat(percentage.toFixed(1))));
  }
}

export function calculateWeightDelta(
  starting: number,
  current: number,
  target?: number,
  goalType?: GoalType
): {
  delta: number;
  label: string;
  isGain: boolean;
  onTrackDirection: boolean;
} {
  const isGain = goalType === 'gain' || (target !== undefined && target > starting);
  const diff = parseFloat((current - starting).toFixed(1));

  if (isGain) {
    return {
      delta: Math.abs(diff),
      label: diff >= 0 ? `+${diff} kg gained` : `${diff} kg lost`,
      isGain: true,
      onTrackDirection: diff >= 0
    };
  } else {
    return {
      delta: Math.abs(diff),
      label: diff <= 0 ? `${diff} kg lost` : `+${diff} kg gained`,
      isGain: false,
      onTrackDirection: diff <= 0
    };
  }
}

export function calculateWeightLost(starting: number, current: number): number {
  return parseFloat((starting - current).toFixed(1));
}

export function calculatePercentBodyWeightLost(starting: number, current: number): number {
  if (starting <= 0) return 0;
  const percent = ((starting - current) / starting) * 100;
  return parseFloat(percent.toFixed(1));
}

export function calculateDaysLeft(targetDeadline: string): number {
  const target = new Date(targetDeadline).getTime();
  const now = new Date('2026-11-03').getTime();
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function calculateRequiredPace(
  current: number,
  target: number,
  targetDeadline: string,
  goalType?: GoalType
): { daysLeft: number; weeksLeft: number; pacePerWeek: number; isGain: boolean } {
  const isGain = goalType === 'gain' || target > current;
  const daysLeft = calculateDaysLeft(targetDeadline);
  const weeksLeft = Math.max(0.1, parseFloat((daysLeft / 7).toFixed(1)));
  
  const remaining = isGain
    ? Math.max(0, target - current)
    : Math.max(0, current - target);

  const pacePerWeek = parseFloat((remaining / weeksLeft).toFixed(2));
  return { daysLeft, weeksLeft, pacePerWeek, isGain };
}

export function isDangerZone(
  starting: number,
  current: number,
  target: number,
  targetDeadline: string = '2026-12-31',
  goalType?: GoalType
): boolean {
  const daysLeft = calculateDaysLeft(targetDeadline);
  const totalDays = 92;
  const elapsedRatio = (totalDays - daysLeft) / totalDays;
  const currentProgress = calculateGoalProgress(starting, current, target, goalType) / 100;

  return elapsedRatio > 0.25 && currentProgress < (elapsedRatio * 0.4);
}

export function calculateLevel(xp: number): {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  progressPercent: number;
} {
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 50)));
  const levelBaseXp = Math.pow(level, 2) * 50;
  const nextLevelXp = Math.pow(level + 1, 2) * 50;
  const range = nextLevelXp - levelBaseXp;
  const currentInLevel = Math.max(0, xp - levelBaseXp);
  const progressPercent = Math.min(100, Math.round((currentInLevel / range) * 100));

  return {
    level,
    currentLevelXp: currentInLevel,
    xpForNextLevel: range,
    progressPercent
  };
}

export function getStreakTier(streak: number): {
  name: string;
  badgeColor: string;
  flameIcon: string;
  multiplier: number;
} {
  if (streak >= 30) {
    return { name: 'Mythic Plasma', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50', flameIcon: '💠', multiplier: 2.0 };
  }
  if (streak >= 14) {
    return { name: 'Inferno Gold', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50', flameIcon: '🔥', multiplier: 1.5 };
  }
  if (streak >= 7) {
    return { name: 'Blazing Silver', badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/50', flameIcon: '⚡', multiplier: 1.25 };
  }
  return { name: 'Bronze Spark', badgeColor: 'bg-slate-700/40 text-slate-300 border-slate-600/40', flameIcon: '✨', multiplier: 1.0 };
}
