import React from 'react';
import { ArrowRight, UserPlus, LogIn, Trophy, Flame, Shield, Sun, Moon } from 'lucide-react';
import { UserProfile, BetGroup } from '../types';
import { Avatar } from './Avatar';
import { LineDiagramBackground } from './LineDiagramBackground';

interface AuthScreenProps {
  existingUsers: UserProfile[];
  onSelectUser: (userId: string) => void;
  onStartSignup: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  betGroup?: BetGroup;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  existingUsers,
  onSelectUser,
  onStartSignup,
  isDarkMode,
  onToggleTheme,
  betGroup
}) => {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col relative overflow-hidden">
      <LineDiagramBackground variant="topographic" />
      {/* Top Bar */}
      <header className="h-16 border-b border-[var(--line)] bg-[var(--surface)] px-6 sm:px-12 flex items-center justify-between">
        <div className="brand">
          <span className="brand-symbol">b.</span>
          <span>BETFIT</span>
        </div>

        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-subtle)] transition"
          title="Toggle theme"
        >
          {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Hero Pitch */}
          <div className="text-center space-y-3">
            <div className="inline-block text-xs font-semibold tracking-wider text-[var(--muted)] uppercase bg-[var(--surface-subtle)] px-3 py-1 rounded-full border border-[var(--line)]">
              HEALTH & HABIT SHOWDOWN
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)] font-sans leading-tight">
              A healthier routine,<br />
              <em className="not-italic text-[var(--green)]">at your pace.</em>
            </h1>

            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-sm mx-auto">
              Track daily habits, bet with friends on your target weight by December 31, and stay accountable with skin in the game.
            </p>
          </div>

          {/* If users already exist on this device: Offer Quick Login */}
          {existingUsers.length > 0 && (
            <div className="clean-card rounded-2xl p-5 bg-[var(--surface)] border border-[var(--line)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                  Select your profile
                </span>
                <span className="text-xs text-[var(--muted)]">Saved locally</span>
              </div>

              <div className="space-y-2">
                {existingUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSelectUser(u.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--line)] hover:border-[var(--green)] hover:bg-[var(--surface-subtle)] transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar initials={u.avatarInitials} colorClass={u.avatarColor} size="md" />
                      <div>
                        <b className="text-xs sm:text-sm text-[var(--text)] block font-semibold">{u.name}</b>
                        <small className="text-xs text-[var(--muted)]">
                          {u.goalType === 'gain' ? 'Bulk' : 'Cut'} · {u.currentWeight}kg (Target: {u.targetWeight}kg)
                        </small>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-[var(--green)] group-hover:translate-x-0.5 transition-transform">
                      <span>Log In</span>
                      <ArrowRight size={14} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action: Sign Up / Create New Profile */}
          <div className="space-y-3 text-center">
            <button
              onClick={onStartSignup}
              className="btn-primary w-full h-12 text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              <span>{existingUsers.length > 0 ? 'Create another profile' : 'Get started (Sign up)'}</span>
              <ArrowRight size={16} />
            </button>

            <p className="text-xs text-[var(--muted)]">
              Takes 60 seconds to configure your starting weight, target goal, and habits.
            </p>
          </div>

          {/* Feature Highlights Footer */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--line)] text-center">
            <div className="p-2 space-y-1">
              <Flame size={16} className="mx-auto text-[var(--green)]" />
              <b className="text-xs text-[var(--text)] block font-semibold">Habit Streaks</b>
              <span className="text-xs text-[var(--muted)] block">Complete all daily</span>
            </div>

            <div className="p-2 space-y-1">
              <Trophy size={16} className="mx-auto text-[var(--amber)]" />
              <b className="text-xs text-[var(--text)] block font-semibold">₹ Rupee Stakes</b>
              <span className="text-xs text-[var(--muted)] block">Skin in the game</span>
            </div>

            <div className="p-2 space-y-1">
              <Shield size={16} className="mx-auto text-[var(--green)]" />
              <b className="text-xs text-[var(--text)] block font-semibold">Private & Local</b>
              <span className="text-xs text-[var(--muted)] block">No cloud server</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
