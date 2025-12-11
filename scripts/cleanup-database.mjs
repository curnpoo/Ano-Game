/**
 * Database Cleanup Script
 * 
 * Cleans transient/orphaned data while preserving:
 * - users (accounts, stats, friends)
 * - avatars (user-created drawings)
 * - gallery (last 3 games per user - already auto-pruned)
 * 
 * Usage: node scripts/cleanup-database.mjs
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, remove, get } from 'firebase/database';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBCRY_cSMYDZXM1N1NQEBNaRSF6qd5TYU0",
  authDomain: "image-annotation-game.firebaseapp.com",
  databaseURL: "https://image-annotation-game-default-rtdb.firebaseio.com",
  projectId: "image-annotation-game",
  storageBucket: "image-annotation-game.firebasestorage.app",
  messagingSenderId: "854812877512",
  appId: "1:854812877512:web:ce3fbdc71a0f46aee2e2f7"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Collections to clean (transient data)
const PATHS_TO_CLEAN = [
  'rooms',           // Old game sessions
  'drawings',        // Drawings tied to rooms
  'presence',        // Temporary online status
  'invites',         // Game invites (expire quickly)
  'friendRequests',  // Old pending requests
  'pushTokens',      // Old device tokens from dev
];

// Collections to PRESERVE
// - users: accounts, stats, friends, cosmetics
// - avatars: player avatar drawings
// - gallery: last 3 games per user (self-prunes)

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...\n');
  console.log('Will PRESERVE: users, avatars, gallery');
  console.log('Will DELETE: rooms, drawings, presence, invites, friendRequests, pushTokens\n');

  for (const path of PATHS_TO_CLEAN) {
    try {
      const pathRef = ref(database, path);
      const snapshot = await get(pathRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const count = Object.keys(data).length;
        await remove(pathRef);
        console.log(`✅ Deleted ${path}: ${count} entries`);
      } else {
        console.log(`⏭️  Skipped ${path}: already empty`);
      }
    } catch (error) {
      console.error(`❌ Failed to clean ${path}:`, error);
    }
  }

  console.log('\n✨ Cleanup complete!');
  console.log('Your database now only contains: users, avatars, gallery');
  process.exit(0);
}

cleanupDatabase();
