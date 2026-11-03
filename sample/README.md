# REPUBLIK v2

Mobile-first fitness goals and challenge app. Built with React, TypeScript and Vite.

## Run
- Node.js 20+
- `npm install`
- `npm run dev`

## Included
- First-time onboarding (profile, baseline, activities, first goal/challenge)
- Persistent local profile, settings, goals, challenges, activity logs and weight entries
- Personal dashboard with real empty states
- Create/edit-ready goal and challenge structure
- Activity and weight logging
- Mobile bottom navigation and responsive desktop layout

## Storage
All user data is stored in this browser's `localStorage` under `republik_v2_state`. No server, authentication or external database is used. Data is local to the browser/device and is not shared with other users. Clearing browser site data will remove it. Use the Settings page's Export data option to back up the current state.

## Not included yet
Cross-device sync, accounts, invitation links, real multi-user leaderboards, cloud backups and verified activity integrations.
