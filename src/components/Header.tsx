import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Avatar } from './Avatar';
import { Flame, ChevronDown, Plus, Sun, Moon, UserPlus } from 'lucide-react';

interface HeaderProps {
  users: UserProfile[];
  currentUser: UserProfile;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSelectUser: (user: UserProfile) => void;
  onOpenWeighInModal: () => void;
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  users,
  currentUser,
  theme,
  onToggleTheme,
  onSelectUser,
  onOpenWeighInModal,
  onOpenOnboarding
}) => {
  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3">
      <div className="mobile-container flex items-center justify-between">
        {/* User Switcher (Sleek Modern Profile) */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="flex items-center gap-2.5 py-1 px-1.5 -ml-1.5 rounded-xl hover:bg-[var(--bg-card-subtle)] active:scale-98 transition text-left"
          >
            <Avatar
              initials={currentUser.avatarInitials || currentUser.name}
              color={currentUser.avatarColor || 'emerald'}
              size="md"
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </div>
              <span className="text-[11px] text-[var(--text-secondary)] block leading-tight font-medium">
                {currentUser.goalType === 'gain' ? 'Bulking' : 'Cutting'} • Switch view
              </span>
            </div>
          </button>

          {/* Clean Dropdown */}
          {openDropdown && (
            <div className="absolute left-0 mt-2 w-60 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] px-2.5 py-1.5">
                Participants
              </div>
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u);
                    setOpenDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                    u.id === currentUser.id
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      initials={u.avatarInitials || u.name}
                      color={u.avatarColor || 'zinc'}
                      size="sm"
                    />
                    <span className="truncate font-medium">{u.name}</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono-num font-medium">
                    {u.currentWeight}kg
                  </span>
                </button>
              ))}

              <div className="pt-1 mt-1 border-t border-[var(--border-color)]">
                <button
                  onClick={() => {
                    setOpenDropdown(false);
                    onOpenOnboarding();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ New User / Blank Slate</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: Theme, Streak & Quick Log */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--border-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition border border-[var(--border-color)]"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>

          {/* Minimal Streak Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono-num">
            <Flame className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
            <span>{currentUser.streakCount}d</span>
          </div>

          {/* Quick Log Weight Button */}
          <button
            onClick={onOpenWeighInModal}
            className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold flex items-center justify-center transition shadow-xs"
            title="Log Today's Weight"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
};
