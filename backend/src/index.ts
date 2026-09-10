import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initFirebase } from './config/firebase.js';
import { authRouter } from './routes/authRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { weatherRouter } from './routes/weatherRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// 1. Global Middleware
app.use(cors({
  origin: '*', // Allow Expo client / mobile / web
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// 2. Request Logger in development
if (ENV.NODE_ENV !== 'test') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// 3. Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 4. API Routes
app.use('/api/auth', authRouter);
app.use('/api/me', userRouter);
app.use('/api/weather', weatherRouter);

// 5. Global Error Handler
app.use(errorHandler);

// 6. Bootstrap Server
async function startServer() {
  try {
    initFirebase();
    await connectDB();

    const server = app.listen(ENV.PORT, '0.0.0.0', () => {
      console.log(`🚀 Personalized Mausam Backend running on port ${ENV.PORT} (0.0.0.0)`);
      console.log(`📡 Health check available at http://localhost:${ENV.PORT}/health`);
    });

    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

// Only start when not imported for testing
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
