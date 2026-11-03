import React, { useState } from 'react';
import { ArrowRight, UserPlus, Trophy, Flame, Shield, Sun, Moon, Phone } from 'lucide-react';
import { UserProfile, BetGroup } from '../types';
import { LineDiagramBackground } from './LineDiagramBackground';
import { PhoneOtpModal } from './PhoneOtpModal';

interface AuthScreenProps {
  onStartSignup: () => void;
  onOtpLoginSuccess?: (profile: UserProfile, token: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  betGroup?: BetGroup;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onStartSignup,
  onOtpLoginSuccess,
  isDarkMode,
  onToggleTheme,
  betGroup
}) => {
  const [isOtpOpen, setIsOtpOpen] = useState(false);

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
              Track daily habits, bet with friends on your target weight, and stay accountable with skin in the game.
            </p>
          </div>

          {/* Primary Action Card */}
          <div className="clean-card rounded-2xl p-6 bg-[var(--surface)] border border-[var(--line)] space-y-3.5 shadow-sm">
            <button
              type="button"
              onClick={() => setIsOtpOpen(true)}
              className="btn-primary w-full h-12 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <Phone size={16} />
              <span>Sign in with Phone Number (OTP)</span>
              <ArrowRight size={16} />
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[var(--line)]"></div>
              <span className="flex-shrink mx-3 text-xs text-[var(--muted)] uppercase tracking-wider font-semibold">Or</span>
              <div className="flex-grow border-t border-[var(--line)]"></div>
            </div>

            <button
              onClick={onStartSignup}
              className="btn-secondary w-full h-11 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border-[var(--line)] hover:border-[var(--green)] transition"
            >
              <UserPlus size={15} className="text-[var(--green)]" />
              <span>Create New Account (60s setup)</span>
            </button>

            <p className="text-[11px] text-[var(--muted)] text-center pt-1">
              Your account and active showdowns are safely preserved in the cloud database.
            </p>
          </div>

          {/* Feature Highlights Footer */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--line)] text-center">
            <div className="p-2 space-y-1">
              <Flame size={16} className="mx-auto text-[var(--green)]" />
              <b className="text-xs text-[var(--text)] block font-semibold">Habit Streaks</b>
              <span className="text-xs text-[var(--muted)] block">Daily disciplines</span>
            </div>

            <div className="p-2 space-y-1">
              <Trophy size={16} className="mx-auto text-[var(--amber)]" />
              <b className="text-xs text-[var(--text)] block font-semibold">₹ Rupee Stakes</b>
              <span className="text-xs text-[var(--muted)] block">Skin in the game</span>
            </div>

            <div className="p-2 space-y-1">
              <Shield size={16} className="mx-auto text-[var(--green)]" />
              <b className="text-xs text-[var(--text)] block font-semibold">Verified Cloud</b>
              <span className="text-xs text-[var(--muted)] block">Supabase Postgres</span>
            </div>
          </div>
        </div>
      </div>

      <PhoneOtpModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        onLoginSuccess={(profile, token) => {
          if (onOtpLoginSuccess) {
            onOtpLoginSuccess(profile, token);
          }
        }}
      />
    </div>
  );
};
