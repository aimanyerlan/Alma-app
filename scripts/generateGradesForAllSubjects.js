const { initializeApp } = require('firebase/app');
const { getFirestore, getDocs, collection } = require('firebase/firestore');

// Конфигурация Firebase загружается из переменных окружения
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