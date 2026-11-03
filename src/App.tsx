import React, { useState, useEffect } from 'react';
import { UserProfile, BetGroup, WeighIn, ActivityLog, BanterItem, DisciplineType } from './types';
import {
  INITIAL_BET_GROUP,
  INITIAL_USERS,
  INITIAL_WEIGH_INS,
  INITIAL_TODAY_ACTIVITIES,
  INITIAL_BANTER
} from './data/initialData';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { TodayView } from './components/TodayView';
import { LeaderboardView } from './components/LeaderboardView';
import { HistoryView } from './components/HistoryView';
import { LogWeighInModal } from './components/LogWeighInModal';
import { DisciplineModal } from './components/DisciplineModal';
import { EditBetModal } from './components/EditBetModal';
import { OnboardingModal } from './components/OnboardingModal';
import { CreateBetModal } from './components/CreateBetModal';
import { ShareBetModal } from './components/ShareBetModal';
import { JoinBetModal } from './components/JoinBetModal';

export function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('betfit_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
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

  const [currentTab, setCurrentTab] = useState<string>('today');

  // Modals
  const [isWeighInOpen, setIsWeighInOpen] = useState(false);
  const [isDisciplineOpen, setIsDisciplineOpen] = useState(false);
  const [isBetOpen, setIsBetOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCreateBetOpen, setIsCreateBetOpen] = useState(false);
  const [isShareBetOpen, setIsShareBetOpen] = useState(false);
  
  // Shared Invite Handling
  const [incomingBet, setIncomingBet] = useState<BetGroup | null>(null);
  const [isJoinBetOpen, setIsJoinBetOpen] = useState(false);

  // Check URL query param for shared bet link on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encodedBet = params.get('bet');
      if (encodedBet) {
        const decoded = JSON.parse(atob(decodeURIComponent(encodedBet)));
        if (decoded && decoded.title) {
          setIncomingBet(decoded as BetGroup);
          setIsJoinBetOpen(true);
        }
      }
    } catch {
      // Ignored if invalid
    }
  }, []);

  // Sync to localStorage
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
    localStorage.setItem('betfit_banter', JSON.stringify(banterList));
  }, [banterList]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const userWeighIns = weighInsMap[currentUser?.id] || [];

  const userActivities = activitiesMap[currentUser?.id] || (currentUser?.chosenDisciplines || []).map((d, i) => ({
    id: `act-${currentUser?.id}-${d}-${i}`,
    userId: currentUser?.id,
    discipline: d,
    date: '2026-11-03',
    completed: false,
    xpEarned: 0
  }));

  // Toggle habit completion with PROPER daily streak tracking bug fix
  const handleToggleActivity = (activityId: string, completed: boolean) => {
    const todayDate = '2026-11-03';

    // 1. Update activities list
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

    // 2. Check day completion boundary (ALL chosen habits for today must be completed)
    const wasDayFullyCompleted =
      userActivities.length > 0 && userActivities.every((a) => a.completed);
    const isDayNowFullyCompleted =
      updatedActivities.length > 0 && updatedActivities.every((a) => a.completed);

    // 3. Update streak strictly when transitioning between full day completion
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          let newStreak = u.streakCount;
          let newLastCompletedDate = u.lastCompletedDate;

          if (isDayNowFullyCompleted && !wasDayFullyCompleted) {
            // All habits for today completed!
            if (u.lastCompletedDate !== todayDate) {
              newStreak = u.streakCount + 1;
              newLastCompletedDate = todayDate;
            }
          } else if (!isDayNowFullyCompleted && wasDayFullyCompleted) {
            // A habit was unchecked, today is incomplete
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
  };

  // Save updated habits/disciplines
  const handleSaveDisciplines = (newDisciplines: DisciplineType[]) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return { ...u, chosenDisciplines: newDisciplines };
        }
        return u;
      })
    );

    const newActs: ActivityLog[] = newDisciplines.map((d, i) => {
      const existing = userActivities.find((a) => a.discipline === d);
      return existing || {
        id: `act-${currentUser.id}-${d}-${i}`,
        userId: currentUser.id,
        discipline: d,
        date: '2026-11-03',
        completed: false,
        xpEarned: 0
      };
    });

    setActivitiesMap((prev) => ({
      ...prev,
      [currentUser.id]: newActs
    }));
  };

  // Post banter message
  const handleSendBanter = (toUserId: string, text: string, type: 'nudge' | 'cheer' | 'taunt') => {
    const target = users.find((u) => u.id === toUserId);
    if (!target) return;

    const newBanter: BanterItem = {
      id: `b-${Date.now()}`,
      fromName: currentUser.name,
      fromInitials: currentUser.avatarInitials || currentUser.name.slice(0, 2),
      fromColor: currentUser.avatarColor || 'emerald',
      toName: target.name,
      type,
      text,
      timeAgo: 'Just now'
    };

    setBanterList((prev) => [newBanter, ...prev]);
  };

  // 1. Create a Completely Clean Slate Bet
  const handleCreateNewBet = (newBet: BetGroup, creatorProfile: UserProfile) => {
    setBetGroup(newBet);
    setUsers([creatorProfile]); // Clean slate: creator is sole participant!
    setCurrentUserId(creatorProfile.id);

    // Initial baseline weigh in
    const initialWeighIn: WeighIn = {
      id: `w-${Date.now()}`,
      userId: creatorProfile.id,
      date: '2026-11-03',
      weight: creatorProfile.startingWeight,
      notes: 'Bet kickoff baseline weigh-in'
    };
    setWeighInsMap({ [creatorProfile.id]: [initialWeighIn] });

    // Initial fresh blank activities
    const initialActivities: ActivityLog[] = creatorProfile.chosenDisciplines.map((d, i) => ({
      id: `act-${creatorProfile.id}-${d}-${i}`,
      userId: creatorProfile.id,
      discipline: d,
      date: '2026-11-03',
      completed: false,
      xpEarned: 0
    }));
    setActivitiesMap({ [creatorProfile.id]: initialActivities });

    setBanterList([
      {
        id: `b-${Date.now()}`,
        fromName: 'Bet System',
        fromInitials: 'BS',
        fromColor: 'zinc',
        toName: creatorProfile.name,
        type: 'cheer',
        text: `Bet "${newBet.title}" created with ₹${newBet.potAmount} stake. Share link to invite friends.`,
        timeAgo: 'Just now'
      }
    ]);

    setCurrentTab('today');
    setTimeout(() => setIsShareBetOpen(true), 250);
  };

  // 2. Accept shared link and join bet
  const handleJoinSharedBet = (joinedProfile: UserProfile, bet: BetGroup) => {
    setBetGroup(bet);

    setUsers((prev) => {
      const exists = prev.some((u) => u.id === joinedProfile.id);
      return exists ? prev : [joinedProfile, ...prev];
    });
    setCurrentUserId(joinedProfile.id);

    const initialWeighIn: WeighIn = {
      id: `w-${Date.now()}`,
      userId: joinedProfile.id,
      date: '2026-11-03',
      weight: joinedProfile.startingWeight,
      notes: 'Joined bet baseline weigh-in'
    };
    setWeighInsMap((prev) => ({
      ...prev,
      [joinedProfile.id]: [initialWeighIn]
    }));

    const freshActs: ActivityLog[] = joinedProfile.chosenDisciplines.map((d, i) => ({
      id: `act-${joinedProfile.id}-${d}-${i}`,
      userId: joinedProfile.id,
      discipline: d,
      date: '2026-11-03',
      completed: false,
      xpEarned: 0
    }));
    setActivitiesMap((prev) => ({
      ...prev,
      [joinedProfile.id]: freshActs
    }));

    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    setCurrentTab('today');
  };

  // Complete standard user onboarding
  const handleCompleteOnboarding = (newProfile: UserProfile) => {
    setUsers((prev) => [newProfile, ...prev]);
    setCurrentUserId(newProfile.id);

    const initialWeighIn: WeighIn = {
      id: `w-${Date.now()}`,
      userId: newProfile.id,
      date: '2026-11-03',
      weight: newProfile.startingWeight,
      notes: 'Kickoff baseline weigh-in'
    };
    setWeighInsMap((prev) => ({
      ...prev,
      [newProfile.id]: [initialWeighIn]
    }));

    const freshActivities: ActivityLog[] = newProfile.chosenDisciplines.map((d, i) => ({
      id: `act-${newProfile.id}-${d}-${i}`,
      userId: newProfile.id,
      discipline: d,
      date: '2026-11-03',
      completed: false,
      xpEarned: 0
    }));
    setActivitiesMap((prev) => ({
      ...prev,
      [newProfile.id]: freshActivities
    }));

    setCurrentTab('today');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      {/* Top Header */}
      <Header
        users={users}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSelectUser={(u) => setCurrentUserId(u.id)}
        onOpenWeighInModal={() => setIsWeighInOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full px-4 pt-3">
        {currentTab === 'today' && (
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
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'bet' && (
          <LeaderboardView
            users={users}
            currentUser={currentUser}
            betGroup={betGroup}
            banterList={banterList}
            onSendBanter={handleSendBanter}
            onOpenBetModal={() => setIsBetOpen(true)}
            onOpenShareModal={() => setIsShareBetOpen(true)}
            onOpenCreateBetModal={() => setIsCreateBetOpen(true)}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            currentUser={currentUser}
            weighIns={userWeighIns}
            betGroup={betGroup}
            onOpenWeighInModal={() => setIsWeighInOpen(true)}
          />
        )}
      </main>

      {/* 3-Tab Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />

      {/* Modals */}
      <LogWeighInModal
        isOpen={isWeighInOpen}
        onClose={() => setIsWeighInOpen(false)}
        currentUser={currentUser}
        onSaveWeight={handleSaveWeight}
      />

      <DisciplineModal
        isOpen={isDisciplineOpen}
        onClose={() => setIsDisciplineOpen(false)}
        selectedDisciplines={currentUser?.chosenDisciplines || []}
        onSaveDisciplines={handleSaveDisciplines}
      />

      <EditBetModal
        isOpen={isBetOpen}
        onClose={() => setIsBetOpen(false)}
        betGroup={betGroup}
        onSaveBet={(updated) => setBetGroup(updated)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onCompleteOnboarding={handleCompleteOnboarding}
      />

      {/* Clean Slate Bet Creation Modal */}
      <CreateBetModal
        isOpen={isCreateBetOpen}
        onClose={() => setIsCreateBetOpen(false)}
        onCreateNewBet={handleCreateNewBet}
      />

      {/* Share Bet Link Modal */}
      <ShareBetModal
        isOpen={isShareBetOpen}
        onClose={() => setIsShareBetOpen(false)}
        betGroup={betGroup}
      />

      {/* Join Bet Link Invite Modal */}
      {incomingBet && (
        <JoinBetModal
          isOpen={isJoinBetOpen}
          onClose={() => setIsJoinBetOpen(false)}
          sharedBet={incomingBet}
          onJoinBet={handleJoinSharedBet}
        />
      )}
    </div>
  );
}

export default App;
