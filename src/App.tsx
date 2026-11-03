import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  BetGroup,
  WeighIn,
  ActivityLog,
  BanterItem,
  DisciplineType
} from './types';
import {
  INITIAL_BET_GROUP,
  INITIAL_USERS,
  INITIAL_WEIGH_INS,
  INITIAL_TODAY_ACTIVITIES
} from './data/initialData';
import { AppLayout } from './components/AppLayout';
import { TodayView } from './components/TodayView';
import { LeaderboardView } from './components/LeaderboardView';
import { ActivityView } from './components/ActivityView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { LogWeighInModal } from './components/LogWeighInModal';
import { DisciplineModal } from './components/DisciplineModal';
import { CreateBetModal } from './components/CreateBetModal';
import { ShareBetModal } from './components/ShareBetModal';
import { JoinBetModal } from './components/JoinBetModal';
import { EditBetModal } from './components/EditBetModal';
import { Check } from 'lucide-react';

export function App() {
  // One-time reset to clear previous dummy data and start fresh as requested
  useEffect(() => {
    if (localStorage.getItem('betfit_fresh_start_v1') !== 'true') {
      localStorage.removeItem('betfit_users');
      localStorage.removeItem('betfit_active_user');
      localStorage.removeItem('betfit_weigh_ins');
      localStorage.removeItem('betfit_activities');
      localStorage.removeItem('betfit_banter');
      localStorage.setItem('betfit_fresh_start_v1', 'true');
    }
  }, []);

  // Theme state: defaults to light for the organic minimal look
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('betfit_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('betfit_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // User accounts state (starts empty/fresh)
  const [users, setUsers] = useState<UserProfile[]>(() => {
    if (localStorage.getItem('betfit_fresh_start_v1') !== 'true') return [];
    const saved = localStorage.getItem('betfit_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    if (localStorage.getItem('betfit_fresh_start_v1') !== 'true') return null;
    return localStorage.getItem('betfit_active_user') || null;
  });

  const [isSigningUp, setIsSigningUp] = useState<boolean>(() => {
    // If no users exist, default to onboarding signup flow
    if (localStorage.getItem('betfit_fresh_start_v1') !== 'true') return true;
    const savedUsers = localStorage.getItem('betfit_users');
    return !savedUsers || JSON.parse(savedUsers).length === 0;
  });

  const [betGroup, setBetGroup] = useState<BetGroup>(() => {
    const saved = localStorage.getItem('betfit_bet_group');
    return saved ? JSON.parse(saved) : INITIAL_BET_GROUP;
  });

  const [weighInsMap, setWeighInsMap] = useState<Record<string, WeighIn[]>>(() => {
    const saved = localStorage.getItem('betfit_weigh_ins');
    return saved ? JSON.parse(saved) : INITIAL_WEIGH_INS;
  });

  const [activitiesMap, setActivitiesMap] = useState<Record<string, ActivityLog[]>>(() => {
    const saved = localStorage.getItem('betfit_activities');
    return saved ? JSON.parse(saved) : {};
  });

  const [activePage, setActivePage] = useState<string>('Today');
  const [toast, setToast] = useState<string>('');

  // Modals
  const [isWeighInOpen, setIsWeighInOpen] = useState(false);
  const [isDisciplineOpen, setIsDisciplineOpen] = useState(false);
  const [isCreateBetOpen, setIsCreateBetOpen] = useState(false);
  const [isShareBetOpen, setIsShareBetOpen] = useState(false);
  const [isEditBetOpen, setIsEditBetOpen] = useState(false);
  const [isJoinBetOpen, setIsJoinBetOpen] = useState(false);
  const [incomingBet, setIncomingBet] = useState<BetGroup | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  // URL Invite Link detection
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encodedBet = params.get('bet');
      if (encodedBet) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(encodedBet))));
        if (decoded && decoded.title) {
          setIncomingBet(decoded as BetGroup);
          setIsJoinBetOpen(true);
        }
      }
    } catch {
      // Ignored if invalid
    }
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('betfit_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('betfit_active_user', currentUserId);
    } else {
      localStorage.removeItem('betfit_active_user');
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('betfit_bet_group', JSON.stringify(betGroup));
  }, [betGroup]);

  useEffect(() => {
    localStorage.setItem('betfit_weigh_ins', JSON.stringify(weighInsMap));
  }, [weighInsMap]);

  useEffect(() => {
    localStorage.setItem('betfit_activities', JSON.stringify(activitiesMap));
  }, [activitiesMap]);

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const userWeighIns = currentUser ? weighInsMap[currentUser.id] || [] : [];

  const userActivities = currentUser
    ? activitiesMap[currentUser.id] ||
      (currentUser.chosenDisciplines || []).map((d, i) => ({
        id: `act-${currentUser.id}-${d}-${i}`,
        userId: currentUser.id,
        discipline: d,
        date: '2026-11-03',
        completed: false,
        xpEarned: 0
      }))
    : [];

  // Toggle habit with verified streak logic
  const handleToggleActivity = (activityId: string, completed: boolean) => {
    if (!currentUser) return;
    const todayDate = '2026-11-03';

    const updatedActivities = userActivities.map((act) => {
      if (act.id === activityId) {
        return { ...act, completed };
      }
      return act;
    });

    setActivitiesMap((prev) => ({
      ...prev,
      [currentUser.id]: updatedActivities
    }));

    // Day completion boundary check
    const wasDayFullyCompleted =
      userActivities.length > 0 && userActivities.every((a) => a.completed);
    const isDayNowFullyCompleted =
      updatedActivities.length > 0 && updatedActivities.every((a) => a.completed);

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          let newStreak = u.streakCount;
          let newLastCompletedDate = u.lastCompletedDate;

          if (isDayNowFullyCompleted && !wasDayFullyCompleted) {
            // All habits completed!
            if (u.lastCompletedDate !== todayDate) {
              newStreak = u.streakCount + 1;
              newLastCompletedDate = todayDate;
            }
          } else if (!isDayNowFullyCompleted && wasDayFullyCompleted) {
            // A habit was unchecked
            if (u.lastCompletedDate === todayDate) {
              newStreak = Math.max(0, u.streakCount - 1);
              newLastCompletedDate = undefined;
            }
          }

          return {
            ...u,
            streakCount: newStreak,
            lastCompletedDate: newLastCompletedDate
          };
        }
        return u;
      })
    );
  };

  // Save new weigh-in
  const handleSaveWeight = (newWeight: number, date: string, notes?: string) => {
    if (!currentUser) return;

    const newRecord: WeighIn = {
      id: `w-${Date.now()}`,
      userId: currentUser.id,
      date,
      weight: newWeight,
      notes
    };

    const updatedUserWeighIns = [...userWeighIns, newRecord].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setWeighInsMap((prev) => ({
      ...prev,
      [currentUser.id]: updatedUserWeighIns
    }));

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return { ...u, currentWeight: newWeight };
        }
        return u;
      })
    );

    setToast(`Weight check-in saved: ${newWeight} ${currentUser.weightUnit}`);
  };

  // Update chosen disciplines
  const handleUpdateDisciplines = (disciplines: DisciplineType[]) => {
    if (!currentUser) return;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return { ...u, chosenDisciplines: disciplines };
        }
        return u;
      })
    );

    const newActivities: ActivityLog[] = disciplines.map((d, i) => {
      const existing = userActivities.find((a) => a.discipline === d);
      return (
        existing || {
          id: `act-${currentUser.id}-${d}-${i}`,
          userId: currentUser.id,
          discipline: d,
          date: '2026-11-03',
          completed: false,
          xpEarned: 0
        }
      );
    });

    setActivitiesMap((prev) => ({
      ...prev,
      [currentUser.id]: newActivities
    }));

    setToast('Habits updated.');
  };

  // Finish Onboarding / Signup
  const handleFinishSignup = (profile: UserProfile, newBetGroup?: BetGroup) => {
    setUsers((prev) => [profile, ...prev.filter((u) => u.id !== profile.id)]);
    setCurrentUserId(profile.id);

    const initialHabits: ActivityLog[] = profile.chosenDisciplines.map((d, i) => ({
      id: `act-${profile.id}-${d}-${i}`,
      userId: profile.id,
      discipline: d,
      date: '2026-11-03',
      completed: false,
      xpEarned: 0
    }));

    setActivitiesMap((prev) => ({
      ...prev,
      [profile.id]: initialHabits
    }));

    const initialWeighIn: WeighIn = {
      id: `w-${Date.now()}`,
      userId: profile.id,
      date: '2026-11-03',
      weight: profile.startingWeight,
      notes: 'Baseline check-in from sign up'
    };

    setWeighInsMap((prev) => ({
      ...prev,
      [profile.id]: [initialWeighIn]
    }));

    if (newBetGroup) {
      setBetGroup(newBetGroup);
    }

    setIsSigningUp(false);
    setActivePage('Today');
    setToast(`Welcome, ${profile.name.split(' ')[0]}!`);
  };

  // Join shared bet from link
  const handleJoinBet = (profile: UserProfile) => {
    setUsers((prev) => [...prev, profile]);
    setCurrentUserId(profile.id);

    const initialHabits: ActivityLog[] = profile.chosenDisciplines.map((d, i) => ({
      id: `act-${profile.id}-${d}-${i}`,
      userId: profile.id,
      discipline: d,
      date: '2026-11-03',
      completed: false,
      xpEarned: 0
    }));

    setActivitiesMap((prev) => ({
      ...prev,
      [profile.id]: initialHabits
    }));

    const initialWeighIn: WeighIn = {
      id: `w-${Date.now()}`,
      userId: profile.id,
      date: '2026-11-03',
      weight: profile.startingWeight,
      notes: 'Baseline check-in'
    };

    setWeighInsMap((prev) => ({
      ...prev,
      [profile.id]: [initialWeighIn]
    }));

    window.history.replaceState({}, document.title, window.location.pathname);
    setIsSigningUp(false);
    setToast(`Joined ${betGroup.title}!`);
  };

  // Log out
  const handleLogout = () => {
    setCurrentUserId(null);
    setIsSigningUp(false);
    setToast('Logged out.');
  };

  // Export Data JSON
  const handleExportData = () => {
    const backup = {
      betGroup,
      users,
      weighInsMap,
      activitiesMap
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `betfit-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('Backup exported.');
  };

  // Reset Application Data
  const handleResetData = () => {
    if (
      window.confirm(
        'This will clear all local data and return to a completely fresh starting point. Continue?'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // SCENARIO 1: User is signing up / adding new user
  if (isSigningUp) {
    return (
      <OnboardingFlow
        onFinish={handleFinishSignup}
        onCancel={users.length > 0 ? () => setIsSigningUp(false) : undefined}
        existingBet={betGroup}
      />
    );
  }

  // SCENARIO 2: Not logged in (select profile or click sign up)
  if (!currentUser) {
    return (
      <AuthScreen
        existingUsers={users}
        onSelectUser={(id) => setCurrentUserId(id)}
        onStartSignup={() => setIsSigningUp(true)}
        isDarkMode={theme === 'dark'}
        onToggleTheme={toggleTheme}
        betGroup={betGroup}
      />
    );
  }

  // SCENARIO 3: Logged in and viewing the app
  return (
    <AppLayout
      currentUser={currentUser}
      activePage={activePage}
      onSelectPage={setActivePage}
      isDarkMode={theme === 'dark'}
      onToggleTheme={toggleTheme}
      onOpenProfile={() => setActivePage('Settings')}
      onAddNewUser={() => setIsSigningUp(true)}
      onLogout={handleLogout}
    >
      {/* Dynamic Tab Views */}
      {activePage === 'Today' && (
        <TodayView
          currentUser={currentUser}
          allUsers={users}
          betGroup={betGroup}
          todayActivities={userActivities}
          weighIns={userWeighIns}
          onToggleActivity={handleToggleActivity}
          onOpenWeighInModal={() => setIsWeighInOpen(true)}
          onOpenDisciplineModal={() => setIsDisciplineOpen(true)}
          onOpenShareModal={() => setIsShareBetOpen(true)}
          onNavigateToTab={setActivePage}
        />
      )}

      {activePage === 'The Bet' && (
        <LeaderboardView
          currentUser={currentUser}
          allUsers={users}
          betGroup={betGroup}
          banterList={[]}
          onOpenShareModal={() => setIsShareBetOpen(true)}
          onOpenCreateBetModal={() => setIsCreateBetOpen(true)}
          onOpenEditBetModal={() => setIsEditBetOpen(true)}
          onSendBanter={(toUser, type) => {
            setToast(`Sent ${type} to ${toUser.name}`);
          }}
        />
      )}

      {activePage === 'Activity' && (
        <ActivityView
          currentUser={currentUser}
          todayActivities={userActivities}
          activityHistory={userActivities.filter((a) => a.completed)}
          onToggleActivity={handleToggleActivity}
          onOpenDisciplineModal={() => setIsDisciplineOpen(true)}
          onOpenLogModal={() => setIsDisciplineOpen(true)}
        />
      )}

      {activePage === 'Progress' && (
        <HistoryView
          currentUser={currentUser}
          weighIns={userWeighIns}
          onOpenWeighInModal={() => setIsWeighInOpen(true)}
        />
      )}

      {activePage === 'Settings' && (
        <SettingsView
          currentUser={currentUser}
          allUsers={users}
          betGroup={betGroup}
          onSwitchUser={(id) => {
            setCurrentUserId(id);
            setToast('Switched participant.');
          }}
          onAddNewUser={() => setIsSigningUp(true)}
          onLogout={handleLogout}
          onExportData={handleExportData}
          onResetData={handleResetData}
        />
      )}

      {/* Modals */}
      <LogWeighInModal
        currentUser={currentUser}
        isOpen={isWeighInOpen}
        onClose={() => setIsWeighInOpen(false)}
        onSave={handleSaveWeight}
      />

      <DisciplineModal
        isOpen={isDisciplineOpen}
        onClose={() => setIsDisciplineOpen(false)}
        currentDisciplines={currentUser.chosenDisciplines}
        onSave={handleUpdateDisciplines}
      />

      <CreateBetModal
        isOpen={isCreateBetOpen}
        onClose={() => setIsCreateBetOpen(false)}
        currentUserName={currentUser.name}
        onCreateBet={(bet) => {
          setBetGroup(bet);
          setToast(`Created new bet: ${bet.title}`);
        }}
      />

      <ShareBetModal
        isOpen={isShareBetOpen}
        onClose={() => setIsShareBetOpen(false)}
        betGroup={betGroup}
      />

      <EditBetModal
        isOpen={isEditBetOpen}
        onClose={() => setIsEditBetOpen(false)}
        betGroup={betGroup}
        onSave={(updated) => {
          setBetGroup(updated);
          setToast('Wager updated.');
        }}
      />

      {incomingBet && (
        <JoinBetModal
          isOpen={isJoinBetOpen}
          onClose={() => setIsJoinBetOpen(false)}
          betData={incomingBet}
          onJoinBet={handleJoinBet}
        />
      )}

      {/* Minimal Toast Feedback */}
      {toast && (
        <div className="toast">
          <Check size={15} className="text-[var(--green)]" />
          <span>{toast}</span>
        </div>
      )}
    </AppLayout>
  );
}
export default App;
