const { initializeApp } = require('firebase/app');
const { getFirestore, getDocs, collection } = require('firebase/firestore');

// Прописываем firebaseConfig вручную
const firebaseConfig = {
  apiKey: "AIzaSyAuxhw1JZmMKi4WiuXCBEQD1Db2f6JSwkU",
  authDomain: "almauapp-c26cb.firebaseapp.com",
  projectId: "almauapp-c26cb",
  storageBucket: "almauapp-c26cb.appspot.com",
  messagingSenderId: "559698111504",
  appId: "1:559698111504:web:bbb04524d32ef625c62e95",
  measurementId: "G-CTLCJC5CW0"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function generateGrades() {
  const scheduleSnap = await getDocs(collection(db, 'schedule'));
  const subjects = scheduleSnap.docs.map(doc => doc.data());
  // Группируем по названию дисциплины
  const subjectMap = {};
  subjects.forEach(s => {
    if (!subjectMap[s.subject]) subjectMap[s.subject] = [];
    subjectMap[s.subject].push(s);
  });
  const grades = [];
  for (const subject in subjectMap) {
    // Берём первую дату занятия как стартовую
    const lessons = subjectMap[subject];
    const firstDate = lessons[0]?.date || '2024-09-01';
    for (let i = 0; i < 16; i++) {
      grades.push({
        subject,
        date: addDays(firstDate, i * 7),
        type: 'attendance',
        value: Math.floor(Math.random() * 101)
      });
    }
  }
  console.log(JSON.stringify(grades, null, 2));
}

generateGrades(); 