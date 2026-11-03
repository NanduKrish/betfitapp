# BetFit Arena — The December Showdown ⚔️

[![Live Production](https://img.shields.io/badge/Production-betfitapp.vercel.app-10b981?style=flat-square)](https://betfitapp.vercel.app)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e?style=flat-square)](https://supabase.com)
[![CI/CD](https://img.shields.io/badge/Auto--Deploy-Vercel%20%2B%20GitHub-black?style=flat-square)](https://github.com/NanduKrish/betfitapp)

- **Live URL**: [https://betfitapp.vercel.app](https://betfitapp.vercel.app)
- **GitHub Repository**: [https://github.com/NanduKrish/betfitapp](https://github.com/NanduKrish/betfitapp)

A high-stakes, gamified social health tracking application designed for friend groups competing in a target-date weight loss bet.


## ✨ Key Features

- **🏆 The Bet Vault & Standings**:
  - Live group leaderboard ranked fairly by **% of Goal Achieved** (allowing fair competition regardless of different starting baselines or target deltas) as well as **% of Body Weight Lost** and **Habit Streaks**.
  - Wager stakes display ($250 Winner Pot, custom loser forfeits like wearing clown costumes and buying dinner).
  - Live Podium (Gold, Silver, Bronze) and "Locker Room" banter / trash talk feed with instant reactions (Taunt, Cheer, Nudge).
- **⚡ Multi-Discipline Habit Forge**:
  - Custom activity selection for each participant (Gym / Weightlifting, Swimming, Running, Cycling, 10K Steps, Calorie Deficit / Clean Diet, Calisthenics, Custom).
  - 1-tap daily check-in with dynamic streak counters, multi-tier flame badges (Bronze Spark, Blazing Silver, Inferno Gold, Mythic Plasma), and daily combo XP bonuses.
  - **Streak Shields** (rest day protection tokens earned every 7 days).
- **⚖️ Weight Lab & Predictive Analytics**:
  - Interactive SVG progress curve showing starting baseline, target threshold, and actual weigh-in checkpoints.
  - Trajectory pace calculator (e.g. required kg/week to hit target by Dec 31).
  - **🚨 Danger Zone Alert**: Flags players falling significantly behind pace with playful forfeit warnings.
  - Milestone unlockers (Quarter Smasher 25%, Halfway Hero 50%, Home Stretch 75%, Bet Victor 100%).
- **🎮 RPG Quests & Trophy Cabinet**:
  - Character sheets, player archetypes (Tidal Kraken, Iron Goliath, Wind Runner, Hybrid Titan), Levels & XP curve.
  - Weekly Group Raid mini-challenges (e.g. collective 15 gym sessions & 10 swims).
  - Trophy cabinet with 8+ unlockable badges.
- **🔄 Multi-Player Simulation**:
  - Switch between any friend's profile with one click to see how the experience feels from each participant's viewpoint.
  - LocalStorage persistence for all logs, weigh-ins, bets, and banter.

## 🚀 Getting Started

The development server is already running!

1. Open your browser to:
   - **Local**: [http://localhost:5173/](http://localhost:5173/)
   - **Network (Mobile Devices on same Wi-Fi)**: `http://<your-ip>:5173/`

2. To run manually anytime:
   ```bash
   export PATH="/opt/homebrew/bin:$PATH"
   npm run dev
   ```

3. To build for production:
   ```bash
   export PATH="/opt/homebrew/bin:$PATH"
   npm run build
   ```
