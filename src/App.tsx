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
  INITIAL_TODAY_ACTIVITIES,
  INITIAL_BANTER
} from './data/initialData';
import { AppLayout } from './components/AppLayout';
import { TodayView } from './components/TodayView';
import { LeaderboardView } from './components/LeaderboardView';
import { ActivityView } from './components/ActivityView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { OnboardingFlow } from './components/OnboardingFlow';
import { LogWeighInModal } from './components/LogWeighInModal';
import { DisciplineModal } from './components/DisciplineModal';
import { CreateBetModal } from './components/CreateBetModal';
import { ShareBetModal } from './components/ShareBetModal';
import { JoinBetModal } from './components/JoinBetModal';
import { EditBetModal } from './components/EditBetModal';
import { Check } from 'lucide-react';

export function App() {
  // Theme state: defaults to light to showcase the warm minimal aesthetic from sample
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

  // Onboarding state
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    const saved = localStorage.getItem('betfit_onboarded');
    return saved ? saved === 'true' : true; // Default to true so existing users see dashboard, but can launch onboarding anytime
  });

  // LocalStorage-backed state
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('betfit_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('betfit_active_user') || 'user-alex';
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
    return saved ? JSON.parse(saved) : { 'user-alex': INITIAL_TODAY_ACTIVITIES };
  });

  const [banterList, setBanterList] = useState<BanterItem[]>(() => {
    const saved = localStorage.getItem('betfit_banter');
    return saved ? JSON.parse(saved) : INITIAL_BANTER;
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
    localStorage.setItem('betfit_active_user', currentUserId);
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

  useEffect(() => {
    localStorage.setItem('betfit_onboarded', String(isOnboarded));
  }, [isOnboarded]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const userWeighIns = weighInsMap[currentUser?.id] || [];

  const userActivities =
    activitiesMap[currentUser?.id] ||
    (currentUser?.chosenDisciplines || []).map((d, i) => ({
      id: `act-${currentUser?.id}-${d}-${i}`,
      userId: currentUser?.id,
      discipline: d,
      date: '2026-11-03',
      completed: false,
      xpEarned: 0
    }));

  // Toggle habit with verified streak logic
  const handleToggleActivity = (activityId: string, completed: boolean) => {
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

  // Finish Onboarding Flow
  const handleFinishOnboarding = (profile: UserProfile, newBetGroup?: BetGroup) => {
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
      notes: 'Baseline check-in from onboarding'
    };

    setWeighInsMap((prev) => ({
      ...prev,
      [profile.id]: [initialWeighIn]
    }));

    if (newBetGroup) {
      setBetGroup(newBetGroup);
    }

    setIsOnboarded(true);
    setActivePage('Today');
    setToast(`Welcome to BetFit Arena, ${profile.name.split(' ')[0]}!`);
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

    // Remove query param from URL without reload
    window.history.replaceState({}, document.title, window.location.pathname);
    setToast(`Joined ${betGroup.title}!`);
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
        'This will reset your local data and restore the initial participants and December showdown. Continue?'
      )
    ) {
      localStorage.removeItem('betfit_users');
      localStorage.removeItem('betfit_active_user');
      localStorage.removeItem('betfit_bet_group');
      localStorage.removeItem('betfit_weigh_ins');
      localStorage.removeItem('betfit_activities');
      localStorage.removeItem('betfit_onboarded');
      window.location.reload();
    }
  };

  // If user is currently in Onboarding Flow (e.g. freshly unboarded or triggered manually)
  if (!isOnboarded) {
    return (
      <OnboardingFlow
        onFinish={handleFinishOnboarding}
        onCancel={() => setIsOnboarded(true)}
        existingBet={betGroup}
      />
    );
  }

  return (
    <AppLayout
      currentUser={currentUser}
      activePage={activePage}
      onSelectPage={setActivePage}
      isDarkMode={theme === 'dark'}
      onToggleTheme={toggleTheme}
      onOpenProfile={() => setActivePage('Settings')}
      onStartOnboarding={() => setIsOnboarded(false)}
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
          banterList={banterList}
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
          onStartOnboarding={() => setIsOnboarded(false)}
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
