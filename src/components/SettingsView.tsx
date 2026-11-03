import React from 'react';
import { Download, Trash2, UserRound, Sparkles, Shield, RefreshCw } from 'lucide-react';
import { UserProfile, BetGroup } from '../types';

interface SettingsViewProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  betGroup: BetGroup;
  onSwitchUser: (userId: string) => void;
  onStartOnboarding: () => void;
  onExportData: () => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  allUsers,
  betGroup,
  onSwitchUser,
  onStartOnboarding,
  onExportData,
  onResetData
}) => {
  return (
    <div>
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">PREFERENCES</div>
          <h1>Settings</h1>
          <p>Manage your participant profile, storage, and local BetFit data.</p>
        </div>
      </div>

      {/* Switch Active User */}
      <div className="settings-card">
        <div>
          <b>Active Participant</b>
          <p>Switch between friends in this group bet to view their dashboard or log progress.</p>
        </div>
        <select
          value={currentUser.id}
          onChange={(e) => onSwitchUser(e.target.value)}
          className="h-9 px-3 text-xs bg-[var(--surface-subtle)] border border-[var(--line)] rounded-lg text-[var(--text)]"
        >
          {allUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.goalType === 'gain' ? 'Bulk' : 'Cut'} · {u.currentWeight}kg)
            </option>
          ))}
        </select>
      </div>

      {/* Onboarding & Blank Slate */}
      <div className="settings-card">
        <div>
          <b>Onboarding & Blank Slate</b>
          <p>Experience the 5-step onboarding flow as a fresh user or set up a brand new bet.</p>
        </div>
        <button className="btn-secondary" onClick={onStartOnboarding}>
          <Sparkles size={15} /> Launch Onboarding
        </button>
      </div>

      {/* Storage Information */}
      <div className="settings-card">
        <div>
          <b>Local Browser Storage</b>
          <p>Your habit streaks, weigh-in history, and bet pot are saved securely on this device.</p>
        </div>
        <span className="storage-badge">OFFLINE LOCAL</span>
      </div>

      {/* Export Data */}
      <div className="settings-card">
        <div>
          <b>Export Backup Data</b>
          <p>Download a JSON backup of your current participants, weigh-ins, habits, and wager rules.</p>
        </div>
        <button className="btn-secondary" onClick={onExportData}>
          <Download size={15} /> Export JSON
        </button>
      </div>

      {/* Danger Reset */}
      <div className="settings-card danger-row">
        <div>
          <b className="text-[var(--danger)]">Reset Application</b>
          <p>Clear all local state and restore demo participants and settings.</p>
        </div>
        <button className="btn-danger" onClick={onResetData}>
          <Trash2 size={15} /> Reset Data
        </button>
      </div>

      <p className="settings-foot">
        BetFit Arena is designed for peer accountability without requiring external servers or accounts. All stakes are displayed in Indian Rupees (₹).
      </p>
    </div>
  );
};
