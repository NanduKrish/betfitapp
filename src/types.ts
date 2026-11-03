export type DisciplineType = 
  | 'gym' 
  | 'swimming' 
  | 'running' 
  | 'cycling' 
  | 'walking' 
  | 'diet' 
  | 'calisthenics' 
  | 'custom';

export type GoalType = 'loss' | 'gain';

export interface DisciplineMeta {
  id: DisciplineType;
  label: string;
  iconName: string; // Lucide icon key
  category: string;
  description: string;
  icon?: string;
  bgGradient?: string;
  borderColor?: string;
  color?: string;
}

export interface WeighIn {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weight: number;
  notes?: string;
  verified?: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  discipline: DisciplineType;
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
  durationMinutes?: number;
  xpEarned: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarInitials: string; // Professional initials (e.g., "AK", "SM")
  avatarColor: string; // Theme color class (e.g. "emerald", "cyan")
  startingWeight: number;
  currentWeight: number;
  targetWeight: number;
  weightUnit: 'kg' | 'lbs';
  goalType: GoalType; // 'loss' or 'gain'
  chosenDisciplines: DisciplineType[];
  streakCount: number;
  lastCompletedDate?: string; // Track day completion for genuine streak logic
  streakShields: number;
  statusQuote?: string;
  xp?: number;
  level?: number;
  archetype?: string;
  bio?: string;
  lastActiveDate?: string;
  avatar?: string;
  phone?: string;
}

export interface BetGroup {
  id: string;
  title: string;
  targetDeadline: string; // YYYY-MM-DD
  wagerDescription: string;
  potAmount: number;
  currency: string; // '₹'
  forfeitDescription: string;
  creatorName?: string;
  inviteCode?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'weight' | 'discipline' | 'special';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface BanterItem {
  id: string;
  fromName: string;
  fromInitials: string;
  fromColor: string;
  toName: string;
  type: 'nudge' | 'cheer' | 'taunt' | 'danger';
  text: string;
  timeAgo: string;
  fromAvatar?: string;
}
