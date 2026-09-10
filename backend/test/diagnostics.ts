import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import admin from 'firebase-admin';

// Load server .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function runDiagnostics() {
  console.log('====================================================');
  console.log('🔍 RUNNING PERSONALIZED MAUSAM CONNECTIVITY AUDIT');
  console.log('====================================================\n');

  // 1. Check Environment Variables
  console.log('1. Checking Environment Variables...');
  const mongoUri = process.env.MONGODB_URI;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const port = process.env.PORT || '3000';

  console.log(`   - PORT: ${port}`);
  console.log(`   - MONGODB_URI: ${mongoUri ? 'Configured ✅ (' + mongoUri.split('@')[1] + ')' : 'Missing ❌'}`);
  console.log(`   - FIREBASE_PROJECT_ID: ${projectId ? 'Configured ✅ (' + projectId + ')' : 'Missing ❌'}`);
  console.log(`   - FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'Configured ✅ (' + clientEmail + ')' : 'Missing ❌'}`);
  console.log(`   - FIREBASE_PRIVATE_KEY: ${privateKey ? 'Configured ✅ (Length: ' + privateKey.length + ' chars)' : 'Missing ❌'}`);

  let mongoSuccess = false;
  let firebaseSuccess = false;

  // 2. Test MongoDB Atlas Connection
  console.log('\n2. Testing MongoDB Atlas Connectivity...');
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

  // 3. Test Firebase Admin SDK Initialization
  console.log('\n3. Testing Firebase Admin SDK Initialization...');
  if (projectId && clientEmail && privateKey) {
    try {
      const cleanKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
      const cleanEmail = clientEmail.replace(/^["']|["']$/g, '');
      const cleanProjectId = projectId.replace(/^["']|["']$/g, '');

      const app = admin.initializeApp(
        {
          credential: admin.credential.cert({
            projectId: cleanProjectId,
            clientEmail: cleanEmail,
            privateKey: cleanKey,
          }),
        },
        'diagnostics-app'
      );

      // Verify app can communicate with Firebase Auth service
      const auth = app.auth();
      // Test listing users or getting project config
      const listUsers = await auth.listUsers(1);
      console.log('   ✅ Firebase Admin SDK Initialized and Authenticated with Google Cloud');
      console.log(`   ✅ Current Total Firebase Auth Users: ${listUsers.users.length}`);
      firebaseSuccess = true;
    } catch (err: any) {
      console.error('   ❌ Firebase Admin Initialization Failed:', err.message);
    }
  } else {
    console.log('   ❌ Firebase Admin credentials incomplete in .env.');
  }

  console.log('\n====================================================');
  console.log('📊 CONNECTIVITY SUMMARY');
  console.log('====================================================');
  console.log(`- MongoDB Atlas  : ${mongoSuccess ? 'CONNECTED & OPERATIONAL ✅' : 'FAILED ❌'}`);
  console.log(`- Firebase Admin : ${firebaseSuccess ? 'INITIALIZED & VERIFIED ✅' : 'FAILED ❌'}`);
  console.log('====================================================\n');

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  process.exit(mongoSuccess && firebaseSuccess ? 0 : 1);
}

runDiagnostics().catch((err) => {
  console.error('Fatal diagnostics error:', err);
  process.exit(1);
});
