import { DisciplineMeta, DisciplineType } from '../types';

export const DISCIPLINES: Record<DisciplineType, DisciplineMeta> = {
  gym: {
    id: 'gym',
    label: 'Gym & Strength',
    iconName: 'Dumbbell',
    category: 'strength',
    description: 'Weightlifting, progressive overload & compound lifts'
  },
  swimming: {
    id: 'swimming',
    label: 'Swimming',
    iconName: 'Waves',
    category: 'endurance',
    description: 'Lap swimming & low-impact aerobic conditioning'
  },
  running: {
    id: 'running',
    label: 'Running',
    iconName: 'Footprints',
    category: 'cardio',
    description: 'Paced road runs, intervals & zone-2 training'
  },
  cycling: {
    id: 'cycling',
    label: 'Cycling',
    iconName: 'Bike',
    category: 'cardio',
    description: 'Outdoor road biking or indoor spin workouts'
  },
  walking: {
    id: 'walking',
    label: 'Daily Steps (10k)',
    iconName: 'Activity',
    category: 'mobility',
    description: 'Daily step consistency and active recovery'
  },
  diet: {
    id: 'diet',
    label: 'Clean Nutrition',
    iconName: 'Apple',
    category: 'nutrition',
    description: 'Meeting target calories, macros and protein goals'
  },
  calisthenics: {
    id: 'calisthenics',
    label: 'Calisthenics',
    iconName: 'Zap',
    category: 'strength',
    description: 'Pull-ups, dips, core control & bodyweight training'
  },
  custom: {
    id: 'custom',
    label: 'Custom Activity',
    iconName: 'Target',
    category: 'custom',
    description: 'Martial arts, sports, mobility or specialized workout'
  }
};

export const INITIAL_ACHIEVEMENTS = [
  {
    id: 'first-session',
    title: 'First Step',
    description: 'Complete your first daily habit check-in',
    icon: 'Check',
    category: 'discipline' as const,
    unlocked: true,
    unlockedAt: '2026-10-15',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'streak-7',
    title: '7-Day Consistency',
    description: 'Maintain an active 7-day unbroken habit streak',
    icon: 'Flame',
    category: 'streak' as const,
    unlocked: true,
    unlockedAt: '2026-10-22',
    progress: 12,
    maxProgress: 7
  },
  {
    id: 'milestone-25',
    title: 'Quarter Milestone',
    description: 'Reach 25% of your target weight goal',
    icon: 'Target',
    category: 'weight' as const,
    unlocked: true,
    unlockedAt: '2026-10-24',
    progress: 35,
    maxProgress: 25
  },
  {
    id: 'milestone-50',
    title: 'Halfway Mark',
    description: 'Reach 50% of your target weight goal',
    icon: 'Trophy',
    category: 'weight' as const,
    unlocked: false,
    progress: 35,
    maxProgress: 50
  }
];
