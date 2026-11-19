const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Функция для создания subjectId (такая же, как в контексте)
function makeSubjectId(subject, teacher) {
  return (
    '1_' +
    subject
      .replace(/,? ?'КЧ'?/g, '')
      .replace(/["'«»]/g, '')
      .replace(/\s+/g, ' ')
      .trim() +
    '_' +
    teacher
      .replace(/["'«»]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\./g, '')
      .trim()
  );
}

// Данные из grades.ts
const GRADES = [
  {
    subject: "ИТ-Стартап 1 (Идея/валидация), 'КЧ'",
    teacher: "Самбетова М.Е.",
    credits: 5,
  },
  {
    subject: "Прикладная линейная алгебра, 'КЧ'",
    teacher: "Нугуманов Н.И.",
    credits: 3,
  },
  {
    subject: "Анализ данных в Excel, 'КЧ'",
    teacher: "Төрахмет М.Ғ.",
    credits: 5,
  },
  {
    subject: "Введение в Web-разработку с помощью HTML, CSS, JavaScript, 'КЧ'",
    teacher: "Базарбеков И.М.",
    credits: 3,
  },
  {
    subject: "Введение в программирование и алгоритмы, 'КЧ'",
    teacher: "Адильжан А.М.",
    credits: 5,
  },
  {
    subject: "Казахский (русский) язык 1 (В2), 'КЧ'",
    teacher: "Джубанова Г.Д.",
    credits: 5,
  },
  {
    subject: "Модуль социально-политических знаний (Культурология/Психология), 'КЧ'",
    teacher: "Абдрахманова Б.Ж.",
    credits: 4,
  }
];

async function debugSubjects() {
  try {
    console.log('=== ЛОКАЛЬНЫЕ ПРЕДМЕТЫ ===');
    GRADES.forEach((grade, index) => {
      const subjectId = makeSubjectId(grade.subject, grade.teacher);
      console.log(`${index + 1}. ${grade.subject}`);
      console.log(`   Преподаватель: ${grade.teacher}`);
      console.log(`   SubjectId: ${subjectId}`);
      console.log('');
    });

    console.log('=== ОЦЕНКИ В FIRESTORE ===');
    const gradesCollection = collection(db, 'grades');
    const gradesSnapshot = await getDocs(gradesCollection);
    
    const gradesBySubject = {};
    gradesSnapshot.docs.forEach(doc => {
      const grade = doc.data();
      if (!gradesBySubject[grade.subjectId]) {
        gradesBySubject[grade.subjectId] = [];
      }
      gradesBySubject[grade.subjectId].push(grade);
    });

    Object.keys(gradesBySubject).forEach(subjectId => {
      console.log(`SubjectId: ${subjectId}`);
      console.log(`Количество оценок: ${gradesBySubject[subjectId].length}`);
      console.log(`Оценки: ${gradesBySubject[subjectId].map(g => g.value).join(', ')}`);
      console.log('');
    });

    console.log('=== СРАВНЕНИЕ ===');
    GRADES.forEach((grade, index) => {
      const expectedSubjectId = makeSubjectId(grade.subject, grade.teacher);
      const hasGrades = gradesBySubject[expectedSubjectId];
      console.log(`${index + 1}. ${grade.subject}`);
      console.log(`   Ожидаемый SubjectId: ${expectedSubjectId}`);
      console.log(`   Есть оценки: ${hasGrades ? 'ДА' : 'НЕТ'} (${hasGrades ? hasGrades.length : 0} оценок)`);
      console.log('');
    });

  } catch (error) {
    console.error('Ошибка при отладке:', error);
  }
}

debugSubjects();