import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../dist/index.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Customer Journey 1: Healthcheck and Phone OTP Authentication', async (t) => {
  // 1. Health check
  const healthRes = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthRes.status, 200);
  const healthData = await healthRes.json();
  assert.equal(healthData.status, 'ok');

  // 2. Send OTP
  const sendRes = await fetch(`${baseUrl}/api/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+919876543210' }),
  });
  assert.equal(sendRes.status, 200);
  const sendData = await sendRes.json();
  assert.equal(sendData.success, true);
  const devOtp = sendData.devOtp || '123456';

  // 3. Verify OTP as "Alex Rivera"
  const verifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '+919876543210',
      otp: devOtp,
      fullName: 'Alex Rivera',
    }),
  });
  assert.equal(verifyRes.status, 200);
  const verifyData = await verifyRes.json();
  assert.ok(verifyData.token, 'Should return JWT token');
  assert.equal(verifyData.user.fullName, 'Alex Rivera');
  assert.equal(verifyData.user.avatarInitials, 'AR');

  // Verify /api/auth/me
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${verifyData.token}` },
  });
  assert.equal(meRes.status, 200);
  const meData = await meRes.json();
  assert.equal(meData.user.fullName, 'Alex Rivera');
});

test('Customer Journey 2: Showdown Creation, Invite Code & Friend Join with Fair Bulk/Cut Leaderboard', async (t) => {
  // 1. Login Alex (Cut: 82kg -> 75kg)
  const alexLogin = await fetch(`${baseUrl}/api/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+919876543210', otp: '123456', fullName: 'Alex Rivera' }),
  });
  const { token: alexToken, user: alexUser } = await alexLogin.json();

  // 2. Alex creates Wager
  const wagerRes = await fetch(`${baseUrl}/api/wagers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${alexToken}`,
    },
    body: JSON.stringify({
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
    }),
  });
  assert.equal(wagerRes.status, 201);
  const { wager, participant: alexParticipant } = await wagerRes.json();
  assert.ok(wager.id);
  assert.ok(wager.inviteCode);
  assert.equal(wager.totalPot, 1000);
  assert.equal(alexParticipant.role, 'owner');

  // 3. Unauthenticated Public Invite Preview
  const previewRes = await fetch(`${baseUrl}/api/wagers/invite/${wager.inviteCode}`);
  assert.equal(previewRes.status, 200);
  const { wager: preview } = await previewRes.json();
  assert.equal(preview.title, 'New Year Showdown 2026');
  assert.equal(preview.totalPot, 1000);
  assert.equal(preview.participantCount, 1);

  // 4. Friend Sarah Signs up (Bulk/Muscle Gain: 68kg -> 74kg)
  const sarahLogin = await fetch(`${baseUrl}/api/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+919876543211', otp: '123456', fullName: 'Sarah Miller' }),
  });
  const { token: sarahToken } = await sarahLogin.json();

  // 5. Sarah Joins Wager
  const joinRes = await fetch(`${baseUrl}/api/wagers/${wager.id}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({
      goalType: 'gain',
      startingWeight: 68.0,
      targetWeight: 74.0,
      chosenDisciplines: ['gym', 'walking', 'diet'],
    }),
  });
  assert.equal(joinRes.status, 200);
  const joinData = await joinRes.json();
  assert.equal(joinData.wager.totalPot, 2000, 'Pot should now be ₹2000 with 2 participants');

  // 6. Log Weigh-ins:
  // Alex cuts from 82.0 to 80.8 (-1.2kg out of 7.0kg = 17.1% progress)
  const alexWeigh = await fetch(`${baseUrl}/api/weigh-ins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${alexToken}`,
    },
    body: JSON.stringify({
      wagerId: wager.id,
      weight: 80.8,
      notes: 'Morning weigh-in after fasted cardio',
    }),
  });
  assert.equal(alexWeigh.status, 201);

  // Sarah bulks from 68.0 to 69.5 (+1.5kg out of 6.0kg = 25.0% progress)
  const sarahWeigh = await fetch(`${baseUrl}/api/weigh-ins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({
      wagerId: wager.id,
      weight: 69.5,
      notes: 'Post meal weigh-in',
    }),
  });
  assert.equal(sarahWeigh.status, 201);

  // 7. Verify Ranked Fair Leaderboard
  const leaderRes = await fetch(`${baseUrl}/api/leaderboard/${wager.id}`, {
    headers: { Authorization: `Bearer ${alexToken}` },
  });
  assert.equal(leaderRes.status, 200);
  const { leaderboard } = await leaderRes.json();
  assert.equal(leaderboard.entries.length, 2);
  assert.equal(leaderboard.totalPot, 2000);

  // Sarah should be Rank 1 (25% progress)
  assert.equal(leaderboard.entries[0].name, 'Sarah Miller');
  assert.equal(leaderboard.entries[0].rank, 1);
  assert.equal(leaderboard.entries[0].progressPercent, 25);
  assert.equal(leaderboard.entries[0].goalType, 'gain');

  // Alex should be Rank 2 (17.1% progress)
  assert.equal(leaderboard.entries[1].name, 'Alex Rivera');
  assert.equal(leaderboard.entries[1].rank, 2);
  assert.equal(leaderboard.entries[1].progressPercent, 17.1);
  assert.equal(leaderboard.entries[1].goalType, 'loss');

  // 8. Social Banter
  const banterPost = await fetch(`${baseUrl}/api/banter/${wager.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({
      type: 'taunt',
      message: 'Leading the showdown! Time to step up your cardio, Alex!',
    }),
  });
  assert.equal(banterPost.status, 201);

  const banterList = await fetch(`${baseUrl}/api/banter/${wager.id}`, {
    headers: { Authorization: `Bearer ${alexToken}` },
  });
  const { banter } = await banterList.json();
  assert.equal(banter.length, 1);
  assert.equal(banter[0].type, 'taunt');
  assert.equal(banter[0].senderName, 'Sarah Miller');
});

test('Customer Journey 3: Habit Streak Precision & Shield Protection', async (t) => {
  const login = await fetch(`${baseUrl}/api/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+919999900001', otp: '123456', fullName: 'Streak Tester' }),
  });
  const { token } = await login.json();

  // Check 1 habit out of 3: streak should NOT increment
  const h1 = await fetch(`${baseUrl}/api/habits/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ discipline: 'gym', completed: true }),
  });
  const r1 = await h1.json();
  assert.equal(r1.dayCompleted, false);
  assert.equal(r1.streak.currentStreak, 0, 'Streak should not increment on single habit');

  // Check 2nd habit: still incomplete
  const h2 = await fetch(`${baseUrl}/api/habits/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ discipline: 'walking', completed: true }),
  });
  const r2 = await h2.json();
  assert.equal(r2.dayCompleted, false);
  assert.equal(r2.streak.currentStreak, 0);

  // Check 3rd habit: ALL completed today! Streak increments to 1!
  const h3 = await fetch(`${baseUrl}/api/habits/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ discipline: 'diet', completed: true }),
  });
  const r3 = await h3.json();
  assert.equal(r3.dayCompleted, true);
  assert.equal(r3.streak.currentStreak, 1, 'Streak should increment when all habits completed');

  // Unchecking habit reverts day completion
  const uncheck = await fetch(`${baseUrl}/api/habits/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ discipline: 'diet', completed: false }),
  });
  const uncheckRes = await uncheck.json();
  assert.equal(uncheckRes.dayCompleted, false);
  assert.equal(uncheckRes.streak.currentStreak, 0, 'Streak decrements when day becomes incomplete');

  // Check again to restore
  const recheck = await fetch(`${baseUrl}/api/habits/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ discipline: 'diet', completed: true }),
  });
  const recheckRes = await recheck.json();
  assert.equal(recheckRes.dayCompleted, true);
  assert.equal(recheckRes.streak.currentStreak, 1);

  // Test Shield Consumption
  const shieldRes = await fetch(`${baseUrl}/api/habits/shield`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const { stats } = await shieldRes.json();
  assert.equal(stats.shieldsAvailable, 0, 'Shield was consumed');
});
