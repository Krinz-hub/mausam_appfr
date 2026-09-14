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

  // JWT Authentication config
  JWT_SECRET: process.env.JWT_SECRET || 'mausam_production_secure_jwt_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:8081',

  // Future IMD Gateway
  IMD_API_BASE_URL: process.env.IMD_API_BASE_URL || '',
  IMD_API_KEY: process.env.IMD_API_KEY || '',
};
