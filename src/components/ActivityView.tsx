import React from 'react';
import { Plus, Sliders, Calendar, Check } from 'lucide-react';
import { UserProfile, ActivityLog } from '../types';
import { DISCIPLINES } from '../data/constants';
import { DisciplineIcon } from './DisciplineIcon';

interface ActivityViewProps {
  currentUser: UserProfile;
  todayActivities: ActivityLog[];
  activityHistory: ActivityLog[];
  onToggleActivity: (activityId: string, completed: boolean) => void;
  onOpenDisciplineModal: () => void;
  onOpenLogModal: () => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  currentUser,
  todayActivities,
  activityHistory,
  onToggleActivity,
  onOpenDisciplineModal,
  onOpenLogModal
}) => {
  const completedToday = todayActivities.filter((a) => a.completed).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">YOUR MOVEMENT</div>
          <h1>Activity & Habits</h1>
          <p>
            Consistency builds the foundation. Complete all chosen activities to secure your daily streak.
          </p>
        </div>

        <div className="page-head-actions">
          <button className="btn-secondary" onClick={onOpenDisciplineModal}>
            <Sliders size={15} /> Choose habits
          </button>
          <button className="btn-primary" onClick={onOpenLogModal}>
            <Plus size={15} /> Log workout
          </button>
        </div>
      </div>

      {/* Responsive Progress Summary */}
      <div className="progress-summary">
        <div>
          <span>CURRENT STREAK</span>
          <b>{currentUser.streakCount} Days</b>
        </div>
        <div>
          <span>TODAY'S HABITS</span>
          <b>
            {completedToday}/{todayActivities.length} Done
          </b>
        </div>
        <div>
          <span>DISCIPLINES</span>
          <b>{currentUser.chosenDisciplines.length} Tracked</b>
        </div>
        <div>
          <span>TOTAL LOGS</span>
          <b>{activityHistory.length} Sessions</b>
        </div>
      </div>

      {/* Today's Checklist */}
      <div className="section-title">
        <h2>Today's Checklist</h2>
        <span>Must complete all for streak</span>
      </div>

      <div className="list-card">
        {todayActivities.length > 0 ? (
          todayActivities.map((act) => {
            const meta = DISCIPLINES[act.discipline] || DISCIPLINES.custom;
            return (
              <div
                key={act.id}
                onClick={() => onToggleActivity(act.id, !act.completed)}
                className="activity-item cursor-pointer hover:bg-[var(--surface-subtle)] px-2 -mx-2 rounded-lg transition"
              >
                <div
                  className={`activity-icon transition-colors ${
                    act.completed ? 'bg-[var(--green-pale)] text-[var(--green)]' : ''
                  }`}
                >
                  <DisciplineIcon discipline={act.discipline} className="w-4 h-4" />
                </div>

                <div className="activity-detail">
                  <b className={act.completed ? 'line-through opacity-70' : ''}>{meta.label}</b>
                  <small>{act.completed ? 'Completed today' : meta.description}</small>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    act.completed
                      ? 'bg-[var(--green)] border-[var(--green)] text-black dark:text-black font-bold shadow-xs'
                      : 'border-[var(--line)] hover:border-[var(--muted)]'
                  }`}
                >
                  {act.completed && <Check size={14} strokeWidth={3} />}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-xs text-[var(--muted)]">
            No habits chosen yet. Click "Choose habits" above.
          </div>
        )}
      </div>

      {/* Past Activity Logs */}
      <div className="section-title recent-title">
        <h2>Recent Activity History</h2>
        <span>Timestamped movement logs</span>
      </div>

      {activityHistory.length > 0 ? (
        <div className="list-card">
          {activityHistory.map((log) => {
            const meta = DISCIPLINES[log.discipline] || DISCIPLINES.custom;
            return (
              <div key={log.id} className="activity-item">
                <div className="activity-icon">
                  <DisciplineIcon discipline={log.discipline} className="w-4 h-4" />
                </div>
                <div className="activity-detail">
                  <b>{meta.label}</b>
                  <small>
                    {log.notes || 'Activity completed'}
                    {log.durationMinutes ? ` · ${log.durationMinutes} min` : ''}
                  </small>
                </div>
                <span className="activity-date">{log.date}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-card tall">
          <div className="empty-icon">
            <Calendar size={22} />
          </div>
          <b>No additional workouts logged yet</b>
          <p>
            When you complete extra gym sessions, swims, or runs, log them here to keep a detailed training journal.
          </p>
          <button className="btn-primary" onClick={onOpenLogModal}>
            <Plus size={15} /> Log your first workout
          </button>
        </div>
      )}
    </div>
  );
};
