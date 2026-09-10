import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 1. Load local server .env
dotenv.config();

// 2. If MONGODB_URI is not set, check for atlas-credentials.env in Downloads as convenience
if (!process.env.MONGODB_URI) {
  const downloadEnvPath = path.resolve(process.env.HOME || '', 'Downloads/atlas-credentials.env');
  if (fs.existsSync(downloadEnvPath)) {
    dotenv.config({ path: downloadEnvPath });
  }
}

export const ENV = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/personalized_mausam',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'personalized_mausam',

  // Firebase Admin SDK config
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',

  // Fallback flag for seamless local dev without credentials
  ALLOW_DEV_MOCK_AUTH:
    process.env.ALLOW_DEV_MOCK_AUTH !== 'false' &&
    (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_MOCK_AUTH === 'true'),

  // Future IMD Gateway
  IMD_API_BASE_URL: process.env.IMD_API_BASE_URL || '',
  IMD_API_KEY: process.env.IMD_API_KEY || '',
};
