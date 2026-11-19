// scripts/generateAttendanceGrades.js
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