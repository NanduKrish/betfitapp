import React from 'react';
import { Download, Trash2, UserPlus, LogOut, Check, ArrowRight } from 'lucide-react';
import { UserProfile, BetGroup } from '../types';
import { Avatar } from './Avatar';

interface SettingsViewProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  betGroup: BetGroup;
  onSwitchUser: (userId: string) => void;
  onAddNewUser: () => void;
  onDeleteUser: (userId: string) => void;
  onLogout: () => void;
  onExportData: () => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  allUsers,
  betGroup,
  onSwitchUser,
  onAddNewUser,
  onDeleteUser,
  onLogout,
  onExportData,
  onResetData
}) => {
  const handleDelete = (user: UserProfile) => {
    const isCurrent = user.id === currentUser.id;
    const msg = isCurrent
      ? `Are you sure you want to delete your active profile "${user.name}"? All your check-ins and habits will be removed.`
      : `Are you sure you want to delete profile "${user.name}"? All their check-ins and habits will be removed.`;

    if (window.confirm(msg)) {
      onDeleteUser(user.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">PREFERENCES</div>
          <h1>Settings</h1>
          <p>
            Manage participant profiles, account switching, local storage, and data backup.
          </p>
        </div>

        <div className="page-head-actions">
          <button className="btn-secondary text-xs" onClick={onAddNewUser}>
            <UserPlus size={14} /> Add new user
          </button>
        </div>
      </div>

      {/* 1. Manage Profiles / Participants */}
      <div className="section-title">
        <h2>Participants on this device</h2>
        <span>{allUsers.length} {allUsers.length === 1 ? 'profile' : 'profiles'} registered</span>
      </div>

      <div className="space-y-2.5">
        {allUsers.map((u) => {
          const isCurrent = u.id === currentUser.id;
          return (
            <div
              key={u.id}
              className={`clean-card rounded-xl p-4 bg-[var(--surface)] border flex items-center justify-between gap-3 flex-wrap transition ${
                isCurrent ? 'border-[var(--green)]/60 bg-[var(--green-pale)]' : 'border-[var(--line)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar initials={u.avatarInitials} colorClass={u.avatarColor} size="md" />

                <div>
                  <div className="flex items-center gap-2">
                    <b className="text-xs sm:text-sm text-[var(--text)]">{u.name}</b>
                    {isCurrent && (
                      <span className="text-xs font-semibold text-[var(--green)] bg-[var(--surface)] border border-[var(--line)] px-1.5 py-0.5 rounded">
                        ACTIVE
                      </span>
                    )}
                    <span className="text-xs font-semibold text-[var(--muted)] uppercase bg-[var(--surface-subtle)] border border-[var(--line)] px-1.5 py-0.5 rounded">
                      {u.goalType === 'gain' ? 'Bulk' : 'Cut'}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {u.currentWeight}kg (Target: {u.targetWeight}kg) · Streak: {u.streakCount} days
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {!isCurrent && (
                  <button
                    className="btn-secondary text-xs h-8 px-2.5"
                    onClick={() => onSwitchUser(u.id)}
                  >
                    <span>Switch</span>
                    <ArrowRight size={13} />
                  </button>
                )}

                <button
                  className="btn-danger text-xs h-8 px-2.5"
                  onClick={() => handleDelete(u)}
                  title={`Delete profile ${u.name}`}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Account Session */}
      <div className="section-title recent-title">
        <h2>Session & Account</h2>
        <span>Current: {currentUser.name}</span>
      </div>

      <div className="settings-card flex-wrap">
        <div>
          <b>Log out of active session</b>
          <p>Exit to the welcome screen so another participant can log in or register.</p>
        </div>
        <button className="btn-secondary text-xs h-9 px-3 shrink-0" onClick={onLogout}>
          <LogOut size={14} /> Log out
        </button>
      </div>

      {/* 3. Storage & Backup */}
      <div className="section-title recent-title">
        <h2>Storage & Backup</h2>
        <span>Private offline storage</span>
      </div>

      <div className="settings-card flex-wrap">
        <div>
          <b>Local Browser Storage</b>
          <p>Your habit streaks, weigh-in records, and wager stakes are saved directly in this browser.</p>
        </div>
        <span className="storage-badge shrink-0">OFFLINE LOCAL</span>
      </div>

      <div className="settings-card flex-wrap">
        <div>
          <b>Export Backup Data</b>
          <p>Download a JSON backup of your current participants, weigh-ins, habits, and wager rules.</p>
        </div>
        <button className="btn-secondary text-xs h-9 px-3 shrink-0" onClick={onExportData}>
          <Download size={15} /> Export JSON
        </button>
      </div>

      {/* 4. Danger Reset */}
      <div className="settings-card danger-row flex-wrap">
        <div>
          <b className="text-[var(--danger)]">Reset Application</b>
          <p>Wipe all local data and return to a completely fresh starting point.</p>
        </div>
        <button className="btn-danger text-xs h-9 px-3 shrink-0" onClick={onResetData}>
          <Trash2 size={14} /> Reset Data
        </button>
      </div>

      <p className="settings-foot">
        BetFit Arena is designed for peer accountability without external server tracking. All stakes are displayed in Indian Rupees (₹).
      </p>
    </div>
  );
};
