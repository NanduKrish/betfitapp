import React from 'react';
import { Download, Trash2, UserPlus, LogOut, Shield, RefreshCw } from 'lucide-react';
import { UserProfile, BetGroup } from '../types';

interface SettingsViewProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  betGroup: BetGroup;
  onSwitchUser: (userId: string) => void;
  onAddNewUser: () => void;
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
  onLogout,
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
          <p>Manage your participant account, switch profiles, and manage local BetFit data.</p>
        </div>
      </div>

      {/* Switch Active User / Account */}
      <div className="settings-card">
        <div>
          <b>Active Participant</b>
          <p>Switch between profiles saved on this device, or add another participant.</p>
        </div>
        <div className="flex items-center gap-2">
          {allUsers.length > 1 && (
            <select
              value={currentUser.id}
              onChange={(e) => onSwitchUser(e.target.value)}
              className="h-9 px-3 text-xs bg-[var(--surface-subtle)] border border-[var(--line)] rounded-lg text-[var(--text)]"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.goalType === 'gain' ? 'Bulk' : 'Cut'})
                </option>
              ))}
            </select>
          )}

          <button className="btn-secondary text-xs h-9 px-3" onClick={onAddNewUser}>
            <UserPlus size={14} /> Add User
          </button>
        </div>
      </div>

      {/* Log Out */}
      <div className="settings-card">
        <div>
          <b>Account Session</b>
          <p>Log out to the welcome screen to switch accounts or register a new participant.</p>
        </div>
        <button className="btn-secondary text-xs h-9 px-3" onClick={onLogout}>
          <LogOut size={14} /> Log out
        </button>
      </div>

      {/* Storage Information */}
      <div className="settings-card">
        <div>
          <b>Local Browser Storage</b>
          <p>Your habit streaks, weigh-in records, and wager stakes are saved directly in this browser.</p>
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
          <p>Wipe all local data and return to a completely clean slate.</p>
        </div>
        <button className="btn-danger" onClick={onResetData}>
          <Trash2 size={15} /> Reset Data
        </button>
      </div>

      <p className="settings-foot">
        BetFit Arena is designed for peer accountability without external server tracking. All stakes are displayed in Indian Rupees (₹).
      </p>
    </div>
  );
};
