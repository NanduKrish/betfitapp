import React from 'react';

interface AvatarProps {
  initials: string;
  name?: string;
  color?: string;
  colorClass?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base'
};

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  color,
  colorClass,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  const cleanInitials = (initials || 'U')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold tracking-tight bg-[var(--green-pale)] text-[var(--green-dark)] border border-[var(--line)] ${sizeClasses} ${className} select-none font-mono-num`}
    >
      {cleanInitials}
    </div>
  );
};
