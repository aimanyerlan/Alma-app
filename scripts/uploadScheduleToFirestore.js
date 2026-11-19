// scripts/uploadScheduleToFirestore.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const schedule = require('./schedule');

const firebaseConfig = {
  apiKey: "AIzaSyAuxhw1JZmMKi4WiuXCBEQD1Db2f6JSwkU",
  authDomain: "almauapp-c26cb.firebaseapp.com",
  projectId: "almauapp-c26cb",
  storageBucket: "almauapp-c26cb.firebasestorage.app",
  messagingSenderId: "559698111504",
  appId: "1:559698111504:web:bbb04524d32ef625c62e95",
  measurementId: "G-CTLCJC5CW0"
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