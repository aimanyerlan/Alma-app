// scripts/uploadScheduleToFirestore.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const schedule = require('./schedule');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadSchedule() {
  for (const item of schedule) {
    await addDoc(collection(db, 'schedule'), item);
    console.log('Added:', item.subject, item.day, item.start);
  }
  console.log('All schedule uploaded!');
}

uploadSchedule().catch(console.error);