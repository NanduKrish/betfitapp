import { BetGroup, UserProfile, WeighIn, ActivityLog, BanterItem } from '../types';

export const INITIAL_BET_GROUP: BetGroup = {
  id: 'december-bet-2026',
  title: 'December Fitness Showdown',
  targetDeadline: '2026-12-31',
  wagerDescription: '₹5,000 Winner Pot (₹1,000 per person) + Grand Dinner',
  potAmount: 5000,
  currency: '₹',
  forfeitDescription: 'Losers contribute ₹1,000 each and host a celebratory dinner for the winner.',
  creatorName: 'Alex'
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-alex',
    name: 'Alex (You)',
    avatarInitials: 'AK',
    avatarColor: 'emerald',
    startingWeight: 88.0,
    currentWeight: 84.5,
    targetWeight: 78.0,
    weightUnit: 'kg',
    goalType: 'loss',
    chosenDisciplines: ['swimming', 'gym'],
    streakCount: 12,
    streakShields: 1,
    lastCompletedDate: '2026-11-02',
    statusQuote: 'Morning swim session completed. Gym workout tonight.'
  },
  {
    id: 'user-sarah',
    name: 'Sarah M.',
    avatarInitials: 'SM',
    avatarColor: 'cyan',
    startingWeight: 74.0,
    currentWeight: 69.8,
    targetWeight: 66.0,
    weightUnit: 'kg',
    goalType: 'loss',
    chosenDisciplines: ['swimming', 'diet'],
    streakCount: 19,
    streakShields: 2,
    lastCompletedDate: '2026-11-02',
    statusQuote: 'Hit 2km swim workout. Nutrition locked in.'
  },
  {
    id: 'user-marcus',
    name: 'Marcus K.',
    avatarInitials: 'MK',
    avatarColor: 'violet',
    startingWeight: 75.0,
    currentWeight: 78.5,
    targetWeight: 82.0,
    weightUnit: 'kg',
    goalType: 'gain', // Bulking
    chosenDisciplines: ['gym', 'calisthenics'],
    streakCount: 15,
    streakShields: 1,
    lastCompletedDate: '2026-11-02',
    statusQuote: 'Clean bulk on track. Heavy deadlifts session complete.'
  },
  {
    id: 'user-elena',
    name: 'Elena R.',
    avatarInitials: 'ER',
    avatarColor: 'amber',
    startingWeight: 80.0,
    currentWeight: 75.5,
    targetWeight: 70.0,
    weightUnit: 'kg',
    goalType: 'loss',
    chosenDisciplines: ['running', 'gym'],
    streakCount: 14,
    streakShields: 2,
    lastCompletedDate: '2026-11-02',
    statusQuote: '7km interval run logged this morning.'
  },
  {
    id: 'user-dave',
    name: 'Dave B.',
    avatarInitials: 'DB',
    avatarColor: 'zinc',
    startingWeight: 102.0,
    currentWeight: 101.4,
    targetWeight: 90.0,
    weightUnit: 'kg',
    goalType: 'loss',
    chosenDisciplines: ['gym'],
    streakCount: 2,
    streakShields: 0,
    lastCompletedDate: '2026-11-01',
    statusQuote: 'Adjusting workout routine this week.'
  }
];

export const INITIAL_WEIGH_INS: Record<string, WeighIn[]> = {
  'user-alex': [
    { id: 'w1', userId: 'user-alex', date: '2026-10-01', weight: 88.0, notes: 'Kickoff baseline' },
    { id: 'w2', userId: 'user-alex', date: '2026-10-15', weight: 86.4, notes: 'Steady progress' },
    { id: 'w3', userId: 'user-alex', date: '2026-10-29', weight: 85.0, notes: 'Plateau broken' },
    { id: 'w4', userId: 'user-alex', date: '2026-11-03', weight: 84.5, notes: 'Down 3.5kg total' }
  ],
  'user-sarah': [
    { id: 'sw1', userId: 'user-sarah', date: '2026-10-01', weight: 74.0, notes: 'Baseline' },
    { id: 'sw2', userId: 'user-sarah', date: '2026-10-18', weight: 71.5, notes: 'Mid-term check' },
    { id: 'sw3', userId: 'user-sarah', date: '2026-11-03', weight: 69.8, notes: 'Over halfway to target' }
  ],
  'user-marcus': [
    { id: 'mw1', userId: 'user-marcus', date: '2026-10-01', weight: 75.0, notes: 'Starting bulk' },
    { id: 'mw2', userId: 'user-marcus', date: '2026-10-20', weight: 76.8, notes: 'Weight climbing' },
    { id: 'mw3', userId: 'user-marcus', date: '2026-11-02', weight: 78.5, notes: '+3.5kg lean muscle added' }
  ],
  'user-elena': [
    { id: 'ew1', userId: 'user-elena', date: '2026-10-01', weight: 80.0, notes: 'Starting line' },
    { id: 'ew2', userId: 'user-elena', date: '2026-11-03', weight: 75.5, notes: 'Pace maintained' }
  ],
  'user-dave': [
    { id: 'dw1', userId: 'user-dave', date: '2026-10-01', weight: 102.0, notes: 'Baseline' },
    { id: 'dw2', userId: 'user-dave', date: '2026-11-01', weight: 101.4, notes: 'Trailing pace' }
  ]
};

export const INITIAL_TODAY_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    userId: 'user-alex',
    discipline: 'swimming',
    date: '2026-11-03',
    completed: true,
    durationMinutes: 45,
    notes: '1,500m freestyle laps',
    xpEarned: 50
  },
  {
    id: 'act-2',
    userId: 'user-alex',
    discipline: 'gym',
    date: '2026-11-03',
    completed: false,
    durationMinutes: 60,
    xpEarned: 0
  }
];

export const INITIAL_BANTER: BanterItem[] = [
  {
    id: 'b1',
    fromName: 'Sarah M.',
    fromInitials: 'SM',
    fromColor: 'cyan',
    toName: 'Dave B.',
    type: 'taunt',
    text: 'Keep the pace up Dave, the ₹1,000 stake is approaching quickly!',
    timeAgo: '2h ago'
  },
  {
    id: 'b2',
    fromName: 'Marcus K.',
    fromInitials: 'MK',
    fromColor: 'violet',
    toName: 'Alex (You)',
    type: 'cheer',
    text: 'Solid consistency on the morning swim. See you on the board.',
    timeAgo: '4h ago'
  }
];
