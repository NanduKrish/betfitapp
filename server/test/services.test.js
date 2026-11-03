import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../dist/services/authService.js';
import { WagerService } from '../dist/services/wagerService.js';
import { WeighInService } from '../dist/services/weighInService.js';
import { HabitService } from '../dist/services/habitService.js';
import { LeaderboardService } from '../dist/services/leaderboardService.js';
import { BanterService } from '../dist/services/banterService.js';
import { verifyToken } from '../dist/middleware/auth.js';
import { db } from '../dist/db/database.js';

test('Journey 1: Phone OTP & Authentication with JWT Issuance', async () => {
  const phone = `+9198${Date.now().toString().slice(-8)}`;
  // 1. Send OTP
  const sendResult = await AuthService.sendOtp(phone);
  assert.equal(sendResult.success, true);
  assert.ok(sendResult.devOtp, 'Should generate 6-digit dev OTP');
  assert.equal(sendResult.devOtp.length, 6);

  // 2. Reject invalid OTP
  await assert.rejects(async () => {
    await AuthService.verifyOtp(phone, '000000');
  }, /Invalid or expired OTP/);

  // 3. Verify with correct OTP
  const { token, user } = await AuthService.verifyOtp(phone, sendResult.devOtp, 'Alex Rivera');
  assert.ok(token);
  assert.equal(user.fullName, 'Alex Rivera');
  assert.equal(user.avatarInitials, 'AR');
  assert.equal(user.avatarColor, 'emerald');

  // 4. Verify signed JWT payload
  const payload = verifyToken(token);
  assert.ok(payload);
  assert.equal(payload.userId, user.id);
  assert.equal(payload.fullName, 'Alex Rivera');
});

test('Journey 2: Wager Creation, Invite Code, Friend Join with Fair Bulk/Cut Leaderboard', async () => {
  const alexPhone = `+9188${Date.now().toString().slice(-8)}`;
  const sarahPhone = `+9177${Date.now().toString().slice(-8)}`;

  // 1. Alex User (Cut goal: 82kg -> 75kg, 7kg to lose)
  const { user: alex } = await AuthService.verifyOtp(alexPhone, '123456', 'Alex Rivera');

  // 2. Alex creates Wager showdown
  const { wager, participant: alexP } = await WagerService.createWager(alex, {
    title: 'New Year Showdown 2026',
    description: 'First to hit goal weight takes the pot!',
    currency: '₹',
    stakeAmount: 1000,
    targetDeadline: '2026-12-31',
    forfeitRule: 'Pay ₹1000 + Buy high-protein dinner',
    goalType: 'loss',
    startingWeight: 82.0,
    targetWeight: 75.0,
    chosenDisciplines: ['gym', 'walking', 'diet'],
  });

  assert.ok(wager.id);
  assert.ok(wager.inviteCode.startsWith('NEWYEA-') || wager.inviteCode.length > 5);
  assert.equal(wager.totalPot, 1000);
  assert.equal(alexP.role, 'owner');
  assert.equal(alexP.goalType, 'loss');

  // 3. Public WhatsApp invite preview
  const preview = await WagerService.previewInvite(wager.inviteCode);
  assert.ok(preview);
  assert.equal(preview.title, 'New Year Showdown 2026');
  assert.equal(preview.creatorName, 'Alex Rivera');
  assert.equal(preview.totalPot, 1000);
  assert.equal(preview.participantCount, 1);

  // 4. Friend Sarah Signs up (Bulk goal: 68kg -> 74kg, 6kg to gain)
  const { user: sarah } = await AuthService.verifyOtp(sarahPhone, '123456', 'Sarah Miller');

  // 5. Sarah joins wager
  const { wager: updatedWager, participant: sarahP } = await WagerService.joinWager(sarah, wager.id, {
    goalType: 'gain',
    startingWeight: 68.0,
    targetWeight: 74.0,
    chosenDisciplines: ['gym', 'walking', 'diet'],
  });

  assert.equal(updatedWager.totalPot, 2000, 'Pot should automatically double to ₹2000');
  assert.equal(sarahP.role, 'participant');
  assert.equal(sarahP.goalType, 'gain');

  // 6. Log Weigh-ins:
  // Alex cuts from 82.0 to 80.8 (-1.2kg out of 7.0kg = 17.1% progress)
  await WeighInService.logWeighIn(alex.id, wager.id, { weight: 80.8, notes: 'Fasted cardio' });

  // Sarah bulks from 68.0 to 69.5 (+1.5kg out of 6.0kg = 25.0% progress)
  await WeighInService.logWeighIn(sarah.id, wager.id, { weight: 69.5, notes: 'Post-workout fuel' });

  // 7. Verify Ranked Leaderboard
  const leaderboard = await LeaderboardService.getLeaderboard(wager.id);
  assert.equal(leaderboard.entries.length, 2);
  assert.equal(leaderboard.totalPot, 2000);

  // Sarah Miller: 25.0% progress -> Rank #1!
  const rank1 = leaderboard.entries[0];
  assert.equal(rank1.name, 'Sarah Miller');
  assert.equal(rank1.rank, 1);
  assert.equal(rank1.progressPercent, 25);
  assert.equal(rank1.lostSoFar, 1.5);
  assert.equal(rank1.remaining, 4.5);
  assert.equal(rank1.goalType, 'gain');

  // Alex Rivera: 17.1% progress -> Rank #2!
  const rank2 = leaderboard.entries[1];
  assert.equal(rank2.name, 'Alex Rivera');
  assert.equal(rank2.rank, 2);
  assert.equal(rank2.progressPercent, 17.1);
  assert.equal(rank2.lostSoFar, 1.2);
  assert.equal(rank2.remaining, 5.8);
  assert.equal(rank2.goalType, 'loss');

  // 8. Social Banter
  const banter = await BanterService.postBanter(sarah, wager.id, {
    type: 'taunt',
    message: 'Bulking season is on fire! Catch me if you can, Alex!',
    recipientId: alex.id,
  });
  assert.ok(banter.id);
  assert.equal(banter.senderName, 'Sarah Miller');

  const banterList = await BanterService.getWagerBanter(wager.id);
  assert.equal(banterList.length, 1);
  assert.equal(banterList[0].message, 'Bulking season is on fire! Catch me if you can, Alex!');
});

test('Journey 3: Daily Habit Streak Precision & Rest-Day Shield Protection', async () => {
  const streakPhone = `+9199${Date.now().toString().slice(-8)}`;
  const { user } = await AuthService.verifyOtp(streakPhone, '123456', 'Streak Champ');
  const today = new Date().toISOString().slice(0, 10);

  // Check 1 habit: day NOT complete, streak must NOT increment
  const r1 = await HabitService.toggleHabit(user.id, 'gym', true, today);
  assert.equal(r1.dayCompleted, false);
  assert.equal(r1.streak.currentStreak, 0);

  // Check 2nd habit: still incomplete
  const r2 = await HabitService.toggleHabit(user.id, 'walking', true, today);
  assert.equal(r2.dayCompleted, false);
  assert.equal(r2.streak.currentStreak, 0);

  // Check 3rd habit: ALL complete today! Streak increments to 1!
  const r3 = await HabitService.toggleHabit(user.id, 'diet', true, today);
  assert.equal(r3.dayCompleted, true);
  assert.equal(r3.streak.currentStreak, 1);

  // User unchecks a habit: day incomplete, streak reverts back to 0!
  const r4 = await HabitService.toggleHabit(user.id, 'diet', false, today);
  assert.equal(r4.dayCompleted, false);
  assert.equal(r4.streak.currentStreak, 0);

  // User rechecks: streak restored to 1!
  const r5 = await HabitService.toggleHabit(user.id, 'diet', true, today);
  assert.equal(r5.dayCompleted, true);
  assert.equal(r5.streak.currentStreak, 1);

  // Shield mechanism
  const streakBefore = await HabitService.getStreakStats(user.id);
  assert.equal(streakBefore.shieldsAvailable, 1);
  const streakAfter = await HabitService.useShield(user.id);
  assert.equal(streakAfter.shieldsAvailable, 0);
});

test('Account Deletion & Data Cleanup', async () => {
  const { user } = await AuthService.verifyOtp('+919888877777', '123456', 'Temporary User');
  assert.ok(await db.getUserById(user.id));

  const deleted = await db.deleteUser(user.id);
  assert.equal(deleted, true);
  assert.equal(await db.getUserById(user.id), undefined);
});
