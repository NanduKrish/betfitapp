import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  UserProfile,
  BetGroup,
  WeighIn,
  ActivityLog,
  DisciplineType
} from './types';
import {
  INITIAL_BET_GROUP,
  INITIAL_USERS,
  INITIAL_WEIGH_INS
} from './data/initialData';
import {
  authApi,
  wagerApi,
  weighInApi,
  habitApi,
  leaderboardApi
} from './api/client';
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
import { BetSwitcherModal } from './components/BetSwitcherModal';
import { Check } from 'lucide-react';

export function App() {
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

  // User accounts & session
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('betfit_users');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      const seen = new Set<string>();
      return parsed.filter((u) => {
        if (!u.id || seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      });
    } catch {
      return [];
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem('betfit_active_user') || null;
  });

  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);

  // Multi-Bet Showdowns State
  const [allBets, setAllBets] = useState<BetGroup[]>(() => {
    const savedAll = localStorage.getItem('betfit_all_bets');
    if (savedAll) {
      try {
        const parsed = JSON.parse(savedAll);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [INITIAL_BET_GROUP];
  });

  const [activeBetId, setActiveBetId] = useState<string>(() => {
    const savedId = localStorage.getItem('betfit_active_bet_id');
    if (savedId) return savedId;
    return allBets[0]?.id || INITIAL_BET_GROUP.id;
  });

  const betGroup = allBets.find((b) => b.id === activeBetId) || allBets[0] || INITIAL_BET_GROUP;

  const [weighInsMap, setWeighInsMap] = useState<Record<string, WeighIn[]>>(() => {
    const saved = localStorage.getItem('betfit_weigh_ins');
    return saved ? JSON.parse(saved) : {};
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
  const [isBetSwitcherOpen, setIsBetSwitcherOpen] = useState(false);
  const [isJoinBetOpen, setIsJoinBetOpen] = useState(false);
  const [incomingBet, setIncomingBet] = useState<BetGroup | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Sync state to localStorage cache
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
    localStorage.setItem('betfit_all_bets', JSON.stringify(allBets));
  }, [allBets]);

  useEffect(() => {
    localStorage.setItem('betfit_active_bet_id', activeBetId);
    localStorage.setItem('betfit_bet_group', JSON.stringify(betGroup));
  }, [activeBetId, betGroup]);

  useEffect(() => {
    localStorage.setItem('betfit_weigh_ins', JSON.stringify(weighInsMap));
  }, [weighInsMap]);

  useEffect(() => {
    localStorage.setItem('betfit_activities', JSON.stringify(activitiesMap));
  }, [activitiesMap]);

  // Refresh Leaderboard from Cloud (Supabase PostgreSQL)
  const refreshLeaderboard = useCallback(async (targetWagerId?: string) => {
    const wagerId = targetWagerId || activeBetId;
    if (!wagerId) return;

    try {
      const res = await leaderboardApi.getLeaderboard(wagerId);
      if (res && res.leaderboard) {
        const lb = res.leaderboard;

        // Map cloud participants to UserProfile
        const cloudUsers: UserProfile[] = lb.entries.map((e: any) => ({
          id: e.userId,
          name: e.name,
          avatarInitials: e.avatarInitials,
          avatarColor: e.avatarColor,
          startingWeight: e.startingWeight,
          currentWeight: e.currentWeight,
          targetWeight: e.targetWeight,
          weightUnit: e.weightUnit,
          goalType: e.goalType,
          chosenDisciplines: ['gym', 'walking', 'diet'],
          streakCount: e.currentStreak,
          streakShields: e.streakShields,
        }));

        setUsers(cloudUsers);

        // Update pot amount in allBets
        setAllBets((prev) =>
          prev.map((b) =>
            b.id === wagerId ? { ...b, potAmount: lb.totalPot } : b
          )
        );
      }
    } catch (err) {
      console.warn('Could not refresh cloud leaderboard:', err);
    }
  }, [activeBetId]);

  // Load Cloud Session & Data
  const loadCloudSession = useCallback(async () => {
    const token = localStorage.getItem('betfit_auth_token');
    if (!token) return;

    try {
      const meRes = await authApi.getMe();
      if (meRes && meRes.user) {
        const user = meRes.user;
        setCurrentUserId(user.id);

        // Load user's wagers from Supabase
        const wagersRes = await wagerApi.getWagers();
        if (wagersRes && wagersRes.wagers && wagersRes.wagers.length > 0) {
          const mapped: BetGroup[] = wagersRes.wagers.map((w: any) => ({
            id: w.id,
            title: w.title,
            targetDeadline: w.targetDeadline,
            wagerDescription: w.description || `${w.stakeAmount} ₹ stake per person by ${w.targetDeadline}`,
            potAmount: w.totalPot,
            currency: w.currency || '₹',
            forfeitDescription: w.forfeitRule,
            creatorName: w.creatorId === user.id ? user.fullName : undefined,
            inviteCode: w.inviteCode,
          }));

          setAllBets(mapped);
          const initialId = mapped[0].id;
          setActiveBetId(initialId);
          await refreshLeaderboard(initialId);

          // Load weigh-ins
          try {
            const hRes = await weighInApi.getHistory(initialId);
            if (hRes && hRes.history) {
              setWeighInsMap((prev) => ({
                ...prev,
                [user.id]: hRes.history.map((h: any) => ({
                  id: h.id,
                  userId: h.userId,
                  date: h.weighInDate,
                  weight: h.weight,
                  notes: h.notes,
                })),
              }));
            }
          } catch {}
        }

        // Load today's habits
        try {
          const habitsRes = await habitApi.getTodayHabits();
          if (habitsRes && habitsRes.habits && habitsRes.habits.length > 0) {
            setActivitiesMap((prev) => ({
              ...prev,
              [user.id]: habitsRes.habits.map((h: any) => ({
                id: h.id,
                userId: h.userId,
                discipline: h.discipline,
                date: h.habitDate,
                completed: h.completed,
                xpEarned: 0,
              })),
            }));
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Session verification failed, please log in:', err);
      localStorage.removeItem('betfit_auth_token');
      setCurrentUserId(null);
    }
  }, [refreshLeaderboard]);

  // Initial mount: Check URL for invite code & check cloud session
  useEffect(() => {
    loadCloudSession();

    // Check URL parameters for ?join=CODE or ?bet=BASE64
    try {
      const params = new URLSearchParams(window.location.search);
      const joinCode = params.get('join');
      const encodedBet = params.get('bet');

      if (joinCode) {
        wagerApi.previewInvite(joinCode).then((res) => {
          if (res && res.wager) {
            const w = res.wager;
            setIncomingBet({
              id: w.id,
              title: w.title,
              targetDeadline: w.targetDeadline,
              wagerDescription: `${w.stakeAmount} ₹ stake by ${w.targetDeadline}`,
              potAmount: w.totalPot,
              currency: w.currency || '₹',
              forfeitDescription: w.forfeitRule,
              creatorName: w.creatorName,
              inviteCode: w.inviteCode,
            });
            setIsJoinBetOpen(true);
          }
        }).catch((err) => {
          console.warn('Could not load invite code preview:', err);
        });
      } else if (encodedBet) {
        // Fallback for legacy base64 bet links
        const decoded = JSON.parse(decodeURIComponent(escape(atob(encodedBet))));
        if (decoded && decoded.title) {
          setIncomingBet(decoded as BetGroup);
          setIsJoinBetOpen(true);
        }
      }
    } catch {}
  }, [loadCloudSession]);

  // Real-time Background Sync (every 15s and on window focus)
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUserId && activeBetId) {
        refreshLeaderboard(activeBetId);
      }
    }, 15000);

    const onFocus = () => {
      if (currentUserId && activeBetId) {
        refreshLeaderboard(activeBetId);
      }
    };

    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [currentUserId, activeBetId, refreshLeaderboard]);

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const userWeighIns = currentUser ? weighInsMap[currentUser.id] || [] : [];

  const userActivities = currentUser
    ? activitiesMap[currentUser.id] ||
      (currentUser.chosenDisciplines || []).map((d, i) => ({
        id: `act-${currentUser.id}-${d}-${i}`,
        userId: currentUser.id,
        discipline: d,
        date: new Date().toISOString().slice(0, 10),
        completed: false,
        xpEarned: 0
      }))
    : [];

  // Toggle habit with verified cloud sync
  const handleToggleActivity = async (activityId: string, completed: boolean) => {
    if (!currentUser) return;
    const todayDate = new Date().toISOString().slice(0, 10);

    const actToToggle = userActivities.find((a) => a.id === activityId);
    if (!actToToggle) return;

    // Optimistic UI update
    const updatedActivities = userActivities.map((act) => {
      if (act.id === activityId) return { ...act, completed };
      return act;
    });

    setActivitiesMap((prev) => ({
      ...prev,
      [currentUser.id]: updatedActivities
    }));

    // Call Cloud API
    try {
      const res = await habitApi.toggleHabit(actToToggle.discipline, completed, todayDate);
      if (res && res.streak) {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === currentUser.id) {
              return {
                ...u,
                streakCount: res.streak.currentStreak,
                streakShields: res.streak.shieldsAvailable,
              };
            }
            return u;
          })
        );
      }
    } catch (err) {
      console.warn('Could not sync habit toggle with cloud:', err);
    }
  };

  // Save new weigh-in with cloud sync
  const handleSaveWeight = async (newWeight: number, date: string, notes?: string) => {
    if (!currentUser) return;

    // Optimistic UI update
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

    // Call Cloud API
    try {
      await weighInApi.logWeighIn({
        wagerId: activeBetId,
        weight: newWeight,
        weighInDate: date,
        notes,
      });
      // Refresh cloud leaderboard to get updated rankings and progress
      await refreshLeaderboard(activeBetId);
    } catch (err) {
      console.warn('Could not sync weigh-in with cloud:', err);
    }
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

    const todayDate = new Date().toISOString().slice(0, 10);
    const newActivities: ActivityLog[] = disciplines.map((d, i) => {
      const existing = userActivities.find((a) => a.discipline === d);
      return (
        existing || {
          id: `act-${currentUser.id}-${d}-${i}`,
          userId: currentUser.id,
          discipline: d,
          date: todayDate,
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

  // Finish Onboarding / Signup (with Supabase persistence)
  const handleFinishSignup = async (profile: UserProfile, newBetGroup?: BetGroup) => {
    try {
      // 1. Ensure user is authenticated in Supabase
      let userToken = localStorage.getItem('betfit_auth_token');
      if (!userToken) {
        const dummyPhone = `+9198${Date.now().toString().slice(-8)}`;
        const authRes = await authApi.verifyOtp(dummyPhone, '123456', profile.name);
        userToken = authRes.token;
        profile.id = authRes.user.id;
      }

      // 2. Create wager in Supabase if requested
      if (newBetGroup) {
        const wagerRes = await wagerApi.createWager({
          title: newBetGroup.title,
          currency: newBetGroup.currency || '₹',
          stakeAmount: newBetGroup.potAmount || 1000,
          targetDeadline: newBetGroup.targetDeadline || '2026-12-31',
          forfeitRule: newBetGroup.forfeitDescription || 'Pays for dinner celebration',
          goalType: profile.goalType,
          startingWeight: profile.startingWeight,
          targetWeight: profile.targetWeight,
          chosenDisciplines: profile.chosenDisciplines || ['gym', 'walking', 'diet'],
        });

        const createdWager = wagerRes.wager;
        const newBet: BetGroup = {
          id: createdWager.id,
          title: createdWager.title,
          targetDeadline: createdWager.targetDeadline,
          wagerDescription: `${createdWager.stakeAmount} ₹ stake by ${createdWager.targetDeadline}`,
          potAmount: createdWager.totalPot,
          currency: createdWager.currency || '₹',
          forfeitDescription: createdWager.forfeitRule,
          creatorName: profile.name,
          inviteCode: createdWager.inviteCode,
        };

        setAllBets((prev) => [newBet, ...prev.filter((b) => b.id !== newBet.id)]);
        setActiveBetId(newBet.id);

        // Initial weigh-in
        await weighInApi.logWeighIn({
          wagerId: createdWager.id,
          weight: profile.startingWeight,
          notes: 'Baseline check-in from sign up',
        });
      }

      setUsers((prev) => [profile, ...prev.filter((u) => u.id !== profile.id)]);
      setCurrentUserId(profile.id);
      setIsSigningUp(false);
      setActivePage('Today');
      setToast(`Welcome, ${profile.name.split(' ')[0]}!`);

      // Reload full state from cloud
      loadCloudSession();
    } catch (err: any) {
      console.error('Error during signup cloud sync:', err);
      // Local fallback
      setUsers((prev) => [profile, ...prev.filter((u) => u.id !== profile.id)]);
      setCurrentUserId(profile.id);
      setIsSigningUp(false);
      setActivePage('Today');
    }
  };

  // Join shared bet from invite link (with Supabase PostgreSQL persistence)
  const handleJoinBet = async (profile: UserProfile) => {
    if (!incomingBet) return;

    try {
      // 1. Authenticate joining user if not logged in
      let userToken = localStorage.getItem('betfit_auth_token');
      if (!userToken) {
        const phoneToUse = profile.phone || `+9197${Date.now().toString().slice(-8)}`;
        const authRes = await authApi.verifyOtp(phoneToUse, '123456', profile.name);
        userToken = authRes.token;
        profile.id = authRes.user.id;
      }

      // 2. Call cloud API to join wager showdown
      const joinedWagerId = incomingBet.id;
      await wagerApi.joinWager(joinedWagerId, {
        goalType: profile.goalType,
        startingWeight: profile.startingWeight,
        targetWeight: profile.targetWeight,
        chosenDisciplines: profile.chosenDisciplines || ['gym', 'walking', 'diet'],
      });

      // 3. Log initial baseline weigh-in
      await weighInApi.logWeighIn({
        wagerId: joinedWagerId,
        weight: profile.startingWeight,
        notes: 'Baseline check-in from join link',
      });

      // Clear ?join= from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsJoinBetOpen(false);
      setIncomingBet(null);
      setIsSigningUp(false);
      setToast(`Joined ${incomingBet.title}!`);

      // Reload cloud data: User A and Friend B now both appear on the leaderboard!
      await loadCloudSession();
      setActiveBetId(joinedWagerId);
      await refreshLeaderboard(joinedWagerId);
    } catch (err: any) {
      console.error('Error joining wager in cloud:', err);
      setToast(err.message || 'Error joining wager');
    }
  };

  // Bet Handlers (Create, Switch, Edit)
  const handleCreateBet = async (newBet: BetGroup) => {
    try {
      if (currentUser) {
        const res = await wagerApi.createWager({
          title: newBet.title,
          currency: newBet.currency || '₹',
          stakeAmount: newBet.potAmount || 1000,
          targetDeadline: newBet.targetDeadline || '2026-12-31',
          forfeitRule: newBet.forfeitDescription || 'Pays for celebratory dinner',
          goalType: currentUser.goalType,
          startingWeight: currentUser.startingWeight,
          targetWeight: currentUser.targetWeight,
          chosenDisciplines: currentUser.chosenDisciplines,
        });

        const created = res.wager;
        const mappedBet: BetGroup = {
          id: created.id,
          title: created.title,
          targetDeadline: created.targetDeadline,
          wagerDescription: `${created.stakeAmount} ₹ stake by ${created.targetDeadline}`,
          potAmount: created.totalPot,
          currency: created.currency || '₹',
          forfeitDescription: created.forfeitRule,
          creatorName: currentUser.name,
          inviteCode: created.inviteCode,
        };

        setAllBets((prev) => [mappedBet, ...prev.filter((b) => b.id !== mappedBet.id)]);
        setActiveBetId(mappedBet.id);
        setToast(`Created & switched to "${mappedBet.title}"`);
        await refreshLeaderboard(mappedBet.id);
        return;
      }
    } catch (err) {
      console.warn('Could not save wager to cloud, using local state:', err);
    }

    setAllBets((prev) => [newBet, ...prev.filter((b) => b.id !== newBet.id)]);
    setActiveBetId(newBet.id);
    setToast(`Created & switched to "${newBet.title}"`);
  };

  const handleUpdateBet = async (updated: BetGroup) => {
    try {
      await wagerApi.updateWager(updated.id, {
        title: updated.title,
        targetDeadline: updated.targetDeadline,
        forfeitRule: updated.forfeitDescription,
        stakeAmount: updated.potAmount,
      });
    } catch (err) {
      console.warn('Could not update wager in cloud:', err);
    }

    setAllBets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setToast(`Updated wager "${updated.title}"`);
  };

  const handleSelectBet = async (betId: string) => {
    setActiveBetId(betId);
    const target = allBets.find((b) => b.id === betId);
    setToast(`Switched active wager to "${target?.title || 'Wager'}"`);
    await refreshLeaderboard(betId);
  };

  const handleDeleteBet = async (betId: string) => {
    if (allBets.length <= 1) {
      setToast('You must keep at least one active wager.');
      return;
    }
    try {
      await wagerApi.deleteWager(betId);
    } catch {}

    const remaining = allBets.filter((b) => b.id !== betId);
    setAllBets(remaining);
    if (activeBetId === betId) {
      setActiveBetId(remaining[0].id);
      refreshLeaderboard(remaining[0].id);
    }
    setToast('Wager deleted.');
  };

  // Log out
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    localStorage.removeItem('betfit_auth_token');
    localStorage.removeItem('betfit_active_user');
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
        'This will clear all local cache data and reload fresh from the cloud. Continue?'
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

  // SCENARIO 2: Not logged in
  if (!currentUser) {
    return (
      <AuthScreen
        onStartSignup={() => setIsSigningUp(true)}
        onOtpLoginSuccess={(profile, token) => {
          setUsers((prev) => {
            const existing = prev.find((u) => u.id === profile.id);
            if (existing) return prev;
            return [profile, ...prev];
          });
          setCurrentUserId(profile.id);
          setToast(`Verified & logged in as ${profile.name}`);
          loadCloudSession();
        }}
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
      onLogout={handleLogout}
    >
      {/* Dynamic Tab Views */}
      {activePage === 'Today' && (
        <TodayView
          currentUser={currentUser}
          allUsers={users}
          betGroup={betGroup}
          allBets={allBets}
          todayActivities={userActivities}
          weighIns={userWeighIns}
          onToggleActivity={handleToggleActivity}
          onOpenWeighInModal={() => setIsWeighInOpen(true)}
          onOpenDisciplineModal={() => setIsDisciplineOpen(true)}
          onOpenShareModal={() => setIsShareBetOpen(true)}
          onOpenBetSwitcher={() => setIsBetSwitcherOpen(true)}
          onNavigateToTab={setActivePage}
        />
      )}

      {activePage === 'The Bet' && (
        <LeaderboardView
          currentUser={currentUser}
          allUsers={users}
          betGroup={betGroup}
          allBets={allBets}
          banterList={[]}
          onOpenShareModal={() => setIsShareBetOpen(true)}
          onOpenCreateBetModal={() => setIsCreateBetOpen(true)}
          onOpenEditBetModal={() => setIsEditBetOpen(true)}
          onOpenBetSwitcher={() => setIsBetSwitcherOpen(true)}
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
          allBets={allBets}
          onSelectBet={handleSelectBet}
          onOpenCreateBet={() => setIsCreateBetOpen(true)}
          onOpenEditBet={() => setIsEditBetOpen(true)}
          onDeleteBet={handleDeleteBet}
          onOpenShareModal={() => setIsShareBetOpen(true)}
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
        onCreateBet={handleCreateBet}
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
        onSave={handleUpdateBet}
      />

      <BetSwitcherModal
        isOpen={isBetSwitcherOpen}
        onClose={() => setIsBetSwitcherOpen(false)}
        allBets={allBets}
        activeBetId={activeBetId}
        onSelectBet={handleSelectBet}
        onOpenCreateBet={() => setIsCreateBetOpen(true)}
        onDeleteBet={handleDeleteBet}
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
