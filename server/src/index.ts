import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import wagerRoutes from './routes/wagerRoutes.js';
import weighInRoutes from './routes/weighInRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import banterRoutes from './routes/banterRoutes.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(authMiddleware);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BetFit Arena Production API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wagers', wagerRoutes);
app.use('/api/weigh-ins', weighInRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/banter', banterRoutes);

// Error Handling Middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST && process.env.RUN_SERVER === 'true') {
  app.listen(PORT, () => {
    console.log(`🚀 BetFit Arena API running at http://localhost:${PORT}`);
  });
}


export default app;
