const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, writeBatch, serverTimestamp, getDocs, collection } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const KNOWLEDGE_BASE = require('../assets/data/knowledge_base.json');

async function syncKnowledge() {
  console.log(`Syncing ${KNOWLEDGE_BASE.length} verified MoD knowledge chunks into Firestore...`);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    const batch = writeBatch(db);
    for (const item of KNOWLEDGE_BASE) {
      const ref = doc(db, 'knowledge_base', item.id);
      batch.set(ref, {
        ...item,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    await batch.commit();
    console.log(`✅ Successfully synced ${KNOWLEDGE_BASE.length} knowledge documents into Firestore (/knowledge_base collection)!`);

    const snap = await getDocs(collection(db, 'knowledge_base'));
    console.log(`📊 Firestore verified: Total documents in knowledge_base = ${snap.size}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Sync failed:', err.code || err.message);
    process.exit(1);
  }
}

syncKnowledge();
