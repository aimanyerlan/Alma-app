// scripts/generateAttendanceGrades.js
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

const DAYS_MAP = { 'ВС': 0, 'ПН': 1, 'ВТ': 2, 'СР': 3, 'ЧТ': 4, 'ПТ': 5, 'СБ': 6 };
const startDate = new Date('2025-01-13'); // ПН первой недели
const weeks = 15;

function getDatesForDay(dayName) {
  const dates = [];
  for (let w = 0; w < weeks; w++) {
    const d = new Date(startDate);
    const dayOffset = (DAYS_MAP[dayName] - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + w * 7 + dayOffset);
    dates.push(new Date(d));
  }
  return dates;
}

async function generateAttendance() {
  for (const lesson of schedule) {
    const dates = getDatesForDay(lesson.day);
    for (const date of dates) {
      await addDoc(collection(db, 'grades'), {
        subject: lesson.subject,
        teacher: lesson.teacher,
        date: date.toISOString().slice(0, 10),
        type: 'attendance',
        semester: lesson.semester,
        value: null // Можно добавить значение, если нужно
      });
      console.log(`Added attendance for ${lesson.subject} on ${date.toISOString().slice(0,10)}`);
    }
  }
  console.log('All attendance grades generated!');
}

generateAttendance().catch(console.error);