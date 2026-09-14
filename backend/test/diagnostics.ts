import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { generateToken, verifyJwt } from '../src/utils/jwt';

// Load server .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function runDiagnostics() {
  console.log('====================================================');
  console.log('🔍 RUNNING PERSONALIZED MAUSAM NATIVE STACK AUDIT');
  console.log('====================================================\n');

  // 1. Check Environment Variables
  console.log('1. Checking Environment Variables...');
  const mongoUri = process.env.MONGODB_URI;
  const jwtSecret = process.env.JWT_SECRET;
  const port = process.env.PORT || '3000';

  console.log(`   - PORT: ${port}`);
  console.log(`   - MONGODB_URI: ${mongoUri ? 'Configured ✅ (' + (mongoUri.includes('@') ? mongoUri.split('@')[1] : 'Atlas cluster') + ')' : 'Missing ❌'}`);
  console.log(`   - JWT_SECRET: ${jwtSecret ? 'Configured ✅ (Length: ' + jwtSecret.length + ' chars)' : 'Missing ❌'}`);

  let mongoSuccess = false;
  let jwtSuccess = false;

  // 2. Test JWT Signing & Verification
  console.log('\n2. Testing JWT Signing & Verification...');
  try {
    const testUserId = 'diag_user_123';
    const token = generateToken(testUserId);
    const decoded = verifyJwt(token);
    if (decoded && decoded.userId === testUserId) {
      console.log('   ✅ JWT Signing and Verification operational');
      jwtSuccess = true;
    } else {
      console.error('   ❌ JWT verification returned invalid payload');
    }
  } catch (err: any) {
    console.error('   ❌ JWT Diagnostic Failed:', err.message);
  }

  // 3. Test MongoDB Atlas Connection
  console.log('\n3. Testing MongoDB Atlas Connectivity...');
  if (mongoUri) {
    try {
      const cleanUri = mongoUri.replace(/^["']|["']$/g, '');
      console.log('   Connecting to MongoDB Atlas Cluster...');
      await mongoose.connect(cleanUri, {
        dbName: process.env.MONGODB_DB_NAME || 'personalized_mausam',
        serverSelectionTimeoutMS: 10000,
      });

      const db = mongoose.connection.db;
      if (db) {
        const pingResult = await db.admin().ping();
        console.log('   ✅ MongoDB Atlas Ping Succeeded:', pingResult);

        const collections = await db.listCollections().toArray();
        console.log('   ✅ Database Collections:', collections.map((c) => c.name));
        mongoSuccess = true;
      }
    } catch (err: any) {
      console.error('   ❌ MongoDB Connection Failed:', err.message);
    }
  } else {
    console.log('   ❌ MONGODB_URI is not set.');
  }

  console.log('\n====================================================');
  console.log('📊 CONNECTIVITY SUMMARY');
  console.log('====================================================');
  console.log(`- Native JWT Engine : ${jwtSuccess ? 'OPERATIONAL ✅' : 'FAILED ❌'}`);
  console.log(`- MongoDB Atlas     : ${mongoSuccess ? 'CONNECTED & OPERATIONAL ✅' : 'FAILED ❌'}`);
  console.log('====================================================\n');

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  process.exit(mongoSuccess && jwtSuccess ? 0 : 1);
}

runDiagnostics().catch((err) => {
  console.error('Fatal diagnostics error:', err);
  process.exit(1);
});
