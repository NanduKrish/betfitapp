import React, { useState } from 'react';
import {
  LogOut,
  Trophy,
  Plus,
  Sliders,
  Check,
  Share2,
  Copy,
  ExternalLink,
  Flame,
  ShieldCheck,
  Target,
  Sparkles
} from 'lucide-react';
import { UserProfile, BetGroup } from '../types';
import { Avatar } from './Avatar';

interface SettingsViewProps {
  currentUser: UserProfile;
  allUsers?: UserProfile[];
  betGroup: BetGroup;
  allBets?: BetGroup[];
  onSelectBet?: (betId: string) => void;
  onOpenCreateBet?: () => void;
  onOpenEditBet?: () => void;
  onDeleteBet?: (betId: string) => void;
  onOpenShareModal?: () => void;
  onLogout: () => void;
  // Optional backwards compatibility
  onSwitchUser?: (userId: string) => void;
  onAddNewUser?: () => void;
  onDeleteUser?: (userId: string) => void;
  onExportData?: () => void;
  onResetData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  betGroup,
  allBets = [],
  onSelectBet,
  onOpenCreateBet,
  onOpenEditBet,
  onOpenShareModal,
  onLogout,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyInviteLink = (b: BetGroup) => {
    const code = b.inviteCode || b.id;
    const shareUrl = `${window.location.origin}${window.location.pathname}?join=${code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">MY ACCOUNT</div>
          <h1>Settings & Profile</h1>
          <p>
            Manage your personal profile, review your active wager showdowns, and manage your account.
          </p>
        </div>
      </div>

      {/* 1. My Profile Card */}
      <div className="section-title">
        <h2>My Profile</h2>
        <span className="flex items-center gap-1 text-[var(--green)]">
          <ShieldCheck size={14} /> Cloud Synchronized
        </span>
      </div>

      <div className="clean-card rounded-2xl p-5 bg-[var(--surface)] border border-[var(--line)] space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Avatar initials={currentUser.avatarInitials} colorClass={currentUser.avatarColor} size="lg" />

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <b className="text-base sm:text-lg font-bold text-[var(--text)]">{currentUser.name}</b>
              <span className="text-xs font-semibold text-[var(--green)] bg-[var(--surface-subtle)] border border-[var(--line)] px-2 py-0.5 rounded-full uppercase">
                {currentUser.goalType === 'gain' ? 'Bulking (Weight Gain)' : 'Cutting (Weight Loss)'}
              </span>
            </div>

            <p className="text-xs text-[var(--muted)]">
              Starting: <strong className="text-[var(--text)]">{currentUser.startingWeight} {currentUser.weightUnit}</strong> · Current: <strong className="text-[var(--text)]">{currentUser.currentWeight} {currentUser.weightUnit}</strong> · Target: <strong className="text-[var(--text)]">{currentUser.targetWeight} {currentUser.weightUnit}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[var(--line)]">
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
            <span className="text-xs text-[var(--muted)] block">Habit Streak</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Flame size={16} className="text-[var(--green)]" />
              <b className="text-sm sm:text-base font-bold text-[var(--text)] font-mono-num">
                {currentUser.streakCount} {currentUser.streakCount === 1 ? 'day' : 'days'}
              </b>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
            <span className="text-xs text-[var(--muted)] block">Streak Shields</span>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldCheck size={16} className="text-[var(--green)]" />
              <b className="text-sm sm:text-base font-bold text-[var(--text)] font-mono-num">
                {currentUser.streakShields} available
              </b>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] col-span-2 sm:col-span-1">
            <span className="text-xs text-[var(--muted)] block">Cloud Database</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Sparkles size={16} className="text-[var(--amber)]" />
              <b className="text-xs font-semibold text-[var(--text)]">Supabase Live</b>
            </div>
          </div>
        </div>
      </div>

      {/* 2. My Active Showdowns */}
      <div className="section-title recent-title">
        <div>
          <h2>My Active Wagers</h2>
          <span>{allBets.length} {allBets.length === 1 ? 'showdown' : 'showdowns'}</span>
        </div>
        {onOpenCreateBet && (
          <button className="btn-secondary text-xs h-8 px-2.5" onClick={onOpenCreateBet}>
            <Plus size={14} /> <span>New Showdown</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {allBets.map((b) => {
          const isActive = b.id === betGroup.id;
          const code = b.inviteCode || b.id;
          const isCopied = copiedCode === code;

          return (
            <div
              key={b.id}
              className={`clean-card rounded-xl p-4 bg-[var(--surface)] border flex items-center justify-between gap-3 flex-wrap transition ${
                isActive ? 'border-[var(--green)]/60 bg-[var(--green-pale)]' : 'border-[var(--line)]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-[var(--green)] text-black font-bold' : 'bg-[var(--surface-subtle)] text-[var(--muted)]'
                  }`}
                >
                  <Trophy size={16} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <b className="text-xs sm:text-sm text-[var(--text)] truncate">{b.title}</b>
                    {isActive && (
                      <span className="text-xs font-semibold text-[var(--green)] bg-[var(--surface)] border border-[var(--line)] px-1.5 py-0.5 rounded">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5 font-mono-num">
                    {b.currency || '₹'}{b.potAmount} Pot · Deadline: {b.targetDeadline}
                    {b.inviteCode ? ` · Code: ${b.inviteCode}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  className="btn-secondary text-xs h-8 px-2.5"
                  onClick={() => handleCopyInviteLink(b)}
                  title="Copy shareable invite link"
                >
                  {isCopied ? <Check size={13} className="text-[var(--green)]" /> : <Copy size={13} />}
                  <span>{isCopied ? 'Link Copied' : 'Invite'}</span>
                </button>

                {isActive && onOpenEditBet && (
                  <button
                    className="btn-secondary text-xs h-8 px-2.5"
                    onClick={onOpenEditBet}
                  >
                    <Sliders size={13} />
                    <span>Edit</span>
                  </button>
                )}

                {!isActive && onSelectBet && (
                  <button
                    className="btn-secondary text-xs h-8 px-2.5"
                    onClick={() => onSelectBet(b.id)}
                  >
                    <span>Switch</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Session & Logout */}
      <div className="section-title recent-title">
        <h2>Session</h2>
        <span>Logged in as {currentUser.name}</span>
      </div>

      <div className="clean-card rounded-2xl p-5 bg-[var(--surface)] border border-[var(--line)] flex items-center justify-between gap-4 flex-wrap">
        <div>
          <b className="text-xs sm:text-sm text-[var(--text)] font-semibold block">Log Out of BetFit Arena</b>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Safely disconnect this device from your active account. Your weights and habits stay safely synced in the cloud database.
          </p>
        </div>
        <button
          className="btn-secondary text-xs h-9 px-3.5 shrink-0 flex items-center gap-2 hover:border-[var(--danger)] hover:text-[var(--danger)]"
          onClick={onLogout}
        >
          <LogOut size={14} /> Log out
        </button>
      </div>

      <p className="settings-foot">
        BetFit Arena · Production Cloud Version 1.0 · All stakes tracked in Indian Rupees (₹).
      </p>
    </div>
  );
};
export default SettingsView;
