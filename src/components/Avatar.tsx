import React from 'react';

interface AvatarProps {
  initials: string;
  name?: string;
  color?: string; // e.g. "emerald", "indigo", "amber", "cyan", "rose", "zinc"
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60'
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800/60'
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60'
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800/60'
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60'
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800/60'
  },
  zinc: {
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-700 dark:text-zinc-300',
    border: 'border-zinc-200 dark:border-zinc-700'
  }
};

const SIZE_MAP = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base'
};

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  color = 'emerald',
  size = 'md',
  className = ''
}) => {
  const scheme = COLOR_MAP[color] || COLOR_MAP.emerald;
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  // Clean 2-letter uppercase initials
  const cleanInitials = (initials || 'U')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold tracking-tight border ${scheme.bg} ${scheme.text} ${scheme.border} ${sizeClasses} ${className} select-none`}
    >
      {cleanInitials}
    </div>
  );
};
