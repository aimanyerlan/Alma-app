// Скрипт для загрузки оценок из экспортного файла в Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, deleteDoc, doc, getDocs } = require('firebase/firestore');

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

// Данные оценок с правильными subjectId
const gradesData = [
  // ИТ-Стартап 1 (Идея/валидация)
  {
    id: '1',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'seminar',
    value: 70,
    maxValue: 100,
    weight: 5,
    date: '2025-01-13',
    semester: 1,
  },
  {
    id: '2',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'seminar',
    value: 80,
    maxValue: 100,
    weight: 5,
    date: '2025-01-20',
    semester: 1,
  },
  {
    id: '3',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'seminar',
    value: 90,
    maxValue: 100,
    weight: 5,
    date: '2025-01-27',
    semester: 1,
  },
  {
    id: '4',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'seminar',
    value: 70,
    maxValue: 100,
    weight: 5,
    date: '2025-02-03',
    semester: 1,
  },
  {
    id: '5',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'seminar',
    value: 75,
    maxValue: 100,
    weight: 5,
    date: '2025-02-10',
    semester: 1,
  },
  {
    id: '6',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'seminar',
    value: 50,
    maxValue: 100,
    weight: 5,
    date: '2025-02-17',
    semester: 1,
  },
  {
    id: '7',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'seminar',
    value: 78,
    maxValue: 100,
    weight: 5,
    date: '2025-02-24',
    semester: 1,
  },
  {
    id: '8',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'midterm',
    value: 85,
    maxValue: 100,
    weight: 20,
    date: '2025-03-03',
    semester: 1,
  },
  {
    id: '9',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'seminar',
    value: 89,
    maxValue: 100,
    weight: 5,
    date: '2025-03-10',
    semester: 1,
  },
  {
    id: '10',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'seminar',
    value: 87,
    maxValue: 100,
    weight: 5,
    date: '2025-03-17',
    semester: 1,
  },
  {
    id: '11',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'seminar',
    value: 80,
    maxValue: 100,
    weight: 5,
    date: '2025-03-24',
    semester: 1,
  },
  {
    id: '12',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'seminar',
    value: 83,
    maxValue: 100,
    weight: 5,
    date: '2025-03-31',
    semester: 1,
  },
  {
    id: '13',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'seminar',
    value: 55,
    maxValue: 100,
    weight: 5,
    date: '2025-04-07',
    semester: 1,
  },
  {
    id: '14',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'seminar',
    value: 65,
    maxValue: 100,
    weight: 5,
    date: '2025-04-14',
    semester: 1,
  },
  {
    id: '15',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'midterm',
    value: 75,
    maxValue: 100,
    weight: 20,
    date: '2025-04-21',
    semester: 1,
  },
  {
    id: '16',
    subjectId: makeSubjectId('ИТ-Стартап 1 (Идея/валидация)', 'Самбетова М.Е.'),
    type: 'exam',
    value: 95,
    maxValue: 100,
    weight: 50,
    date: '2025-04-28',
    semester: 1,
  },

  // Анализ данных в Excel
  {
    id: '17',
    subjectId: makeSubjectId('Анализ данных в Excel', 'Төрахмет М.Ғ.'),
    type: 'seminar',
    value: 92,
    maxValue: 100,
    weight: 5,
    date: '2025-01-13',
    semester: 1,
  },
  {
    id: '18',
    subjectId: makeSubjectId('Анализ данных в Excel', 'Төрахмет М.Ғ.'),
    type: 'seminar',
    value: 97,
    maxValue: 100,
    weight: 5,
    date: '2025-03-10',
    semester: 1,
  },
  {
    id: '19',
    subjectId: makeSubjectId('Анализ данных в Excel', 'Төрахмет М.Ғ.'),
    type: 'midterm',
    value: 85,
    maxValue: 100,
    weight: 20,
    date: '2025-03-03',
    semester: 1,
  },
  {
    id: '20',
    subjectId: makeSubjectId('Анализ данных в Excel', 'Төрахмет М.Ғ.'),
    type: 'midterm',
    value: 97,
    maxValue: 100,
    weight: 20,
    date: '2025-04-21',
    semester: 1,
  },
  {
    id: '21',
    subjectId: makeSubjectId('Анализ данных в Excel', 'Төрахмет М.Ғ.'),
    type: 'exam',
    value: 100,
    maxValue: 100,
    weight: 50,
    date: '2025-04-28',
    semester: 1,
  },

  // Прикладная линейная алгебра
  {
    id: '22',
    subjectId: makeSubjectId('Прикладная линейная алгебра', 'Нугуманов Н.И.'),
    type: 'seminar',
    value: 95,
    maxValue: 100,
    weight: 5,
    date: '2025-01-13',
    semester: 1,
  },
  {
    id: '23',
    subjectId: makeSubjectId('Прикладная линейная алгебра', 'Нугуманов Н.И.'),
    type: 'seminar',
    value: 93,
    maxValue: 100,
    weight: 5,
    date: '2025-03-10',
    semester: 1,
  },
  {
    id: '24',
    subjectId: makeSubjectId('Прикладная линейная алгебра', 'Нугуманов Н.И.'),
    type: 'midterm',
    value: 95,
    maxValue: 100,
    weight: 20,
    date: '2025-03-03',
    semester: 1,
  },
  {
    id: '25',
    subjectId: makeSubjectId('Прикладная линейная алгебра', 'Нугуманов Н.И.'),
    type: 'midterm',
    value: 93,
    maxValue: 100,
    weight: 20,
    date: '2025-04-21',
    semester: 1,
  },
  {
    id: '26',
    subjectId: makeSubjectId('Прикладная линейная алгебра', 'Нугуманов Н.И.'),
    type: 'exam',
    value: 94,
    maxValue: 100,
    weight: 50,
    date: '2025-04-28',
    semester: 1,
  },

  // Введение в Web-разработку
  {
    id: '27',
    subjectId: makeSubjectId('Введение в Web-разработку с помощью HTML, CSS, JavaScript', 'Базарбеков И.М.'),
    type: 'seminar',
    value: 84,
    maxValue: 100,
    weight: 5,
    date: '2025-01-13',
    semester: 1,
  },
  {
    id: '28',
    subjectId: makeSubjectId('Введение в Web-разработку с помощью HTML, CSS, JavaScript', 'Базарбеков И.М.'),
    type: 'seminar',
    value: 90,
    maxValue: 100,
    weight: 5,
    date: '2025-03-10',
    semester: 1,
  },
  {
    id: '29',
    subjectId: makeSubjectId('Введение в Web-разработку с помощью HTML, CSS, JavaScript', 'Базарбеков И.М.'),
    type: 'midterm',
    value: 84,
    maxValue: 100,
    weight: 20,
    date: '2025-03-03',
    semester: 1,
  },
  {
    id: '30',
    subjectId: makeSubjectId('Введение в Web-разработку с помощью HTML, CSS, JavaScript', 'Базарбеков И.М.'),
    type: 'midterm',
    value: 90,
    maxValue: 100,
    weight: 20,
    date: '2025-04-21',
    semester: 1,
  },
  {
    id: '31',
    subjectId: makeSubjectId('Введение в Web-разработку с помощью HTML, CSS, JavaScript', 'Базарбеков И.М.'),
    type: 'exam',
    value: 90,
    maxValue: 100,
    weight: 50,
    date: '2025-04-28',
    semester: 1,
  },

  // Введение в программирование и алгоритмы
  {
    id: '32',
    subjectId: makeSubjectId('Введение в программирование и алгоритмы', 'Адильжан А.М.'),
    type: 'seminar',
    value: 100,
    maxValue: 100,
    weight: 5,
    date: '2025-01-13',
    semester: 1,
  },
  {
    id: '33',
    subjectId: makeSubjectId('Введение в программирование и алгоритмы', 'Адильжан А.М.'),
    type: 'seminar',
    value: 97,
    maxValue: 100,
    weight: 5,
    date: '2025-03-10',
    semester: 1,
  },
  {
    id: '34',
    subjectId: makeSubjectId('Введение в программирование и алгоритмы', 'Адильжан А.М.'),
    type: 'midterm',
    value: 100,
    maxValue: 100,
    weight: 20,
    date: '2025-03-03',
    semester: 1,
  },
  {
    id: '35',
    subjectId: makeSubjectId('Введение в программирование и алгоритмы', 'Адильжан А.М.'),
    type: 'midterm',
    value: 97,
    maxValue: 100,
    weight: 20,
    date: '2025-04-21',
    semester: 1,
  },
  {
    id: '36',
    subjectId: makeSubjectId('Введение в программирование и алгоритмы', 'Адильжан А.М.'),
    type: 'exam',
    value: 100,
    maxValue: 100,
    weight: 50,
    date: '2025-04-28',
    semester: 1,
  },

  // Казахский (русский) язык 1
  {
    id: '37',
    subjectId: makeSubjectId('Казахский (русский) язык 1 (В2)', 'Джубанова Г.Д.'),
    type: 'seminar',
    value: 93,
    maxValue: 100,
    weight: 5,
    date: '2025-01-13',
    semester: 1,
  },
  {
    id: '38',
    subjectId: makeSubjectId('Казахский (русский) язык 1 (В2)', 'Джубанова Г.Д.'),
    type: 'seminar',
    value: 93,
    maxValue: 100,
    weight: 5,
    date: '2025-03-10',
    semester: 1,
  },
  {
    id: '39',
    subjectId: makeSubjectId('Казахский (русский) язык 1 (В2)', 'Джубанова Г.Д.'),
    type: 'midterm',
    value: 93,
    maxValue: 100,
    weight: 20,
    date: '2025-03-03',
    semester: 1,
  },
  {
    id: '40',
    subjectId: makeSubjectId('Казахский (русский) язык 1 (В2)', 'Джубанова Г.Д.'),
    type: 'midterm',
    value: 93,
    maxValue: 100,
    weight: 20,
    date: '2025-04-21',
    semester: 1,
  },
  {
    id: '41',
    subjectId: makeSubjectId('Казахский (русский) язык 1 (В2)', 'Джубанова Г.Д.'),
    type: 'exam',
    value: 93,
    maxValue: 100,
    weight: 50,
    date: '2025-04-28',
    semester: 1,
  },

  // Модуль социально-политических знаний
  {
    id: '42',
    subjectId: makeSubjectId('Модуль социально-политических знаний (Культурология/Психология)', 'Абдрахманова Б.Ж.'),
    type: 'seminar',
    value: 92,
    maxValue: 100,
    weight: 5,
    date: '2025-01-13',
    semester: 1,
  },
  {
    id: '43',
    subjectId: makeSubjectId('Модуль социально-политических знаний (Культурология/Психология)', 'Абдрахманова Б.Ж.'),
    type: 'seminar',
    value: 92,
    maxValue: 100,
    weight: 5,
    date: '2025-03-10',
    semester: 1,
  },
  {
    id: '44',
    subjectId: makeSubjectId('Модуль социально-политических знаний (Культурология/Психология)', 'Абдрахманова Б.Ж.'),
    type: 'midterm',
    value: 92,
    maxValue: 100,
    weight: 20,
    date: '2025-03-03',
    semester: 1,
  },
  {
    id: '45',
    subjectId: makeSubjectId('Модуль социально-политических знаний (Культурология/Психология)', 'Абдрахманова Б.Ж.'),
    type: 'midterm',
    value: 92,
    maxValue: 100,
    weight: 20,
    date: '2025-04-21',
    semester: 1,
  },
  {
    id: '46',
    subjectId: makeSubjectId('Модуль социально-политических знаний (Культурология/Психология)', 'Абдрахманова Б.Ж.'),
    type: 'exam',
    value: 93,
    maxValue: 100,
    weight: 50,
    date: '2025-04-28',
    semester: 1,
  },

  // Пропуски для разных предметов
  {
    id: '47',
    subjectId: makeSubjectId("ИТ-Стартап 1 (Идея/валидация), 'КЧ'", 'Самбетова М.Е.'),
    type: 'attendance',
    value: 0,
    maxValue: 100,
    weight: 0,
    date: '2025-01-20',
    isAbsent: true,
    comment: 'Пропуск',
    semester: 1,
  },
  {
    id: '48',
    subjectId: makeSubjectId("Анализ данных в Excel, 'КЧ'", 'Төрахмет М.Ғ.'),
    type: 'attendance',
    value: 0,
    maxValue: 100,
    weight: 0,
    date: '2025-02-10',
    isAbsent: true,
    comment: 'Пропуск',
    semester: 1,
  },
  {
    id: '49',
    subjectId: makeSubjectId("Казахский (русский) язык 1 (В2), 'КЧ'", 'Джубанова Г.Д.'),
    type: 'attendance',
    value: 0,
    maxValue: 100,
    weight: 0,
    date: '2025-03-03',
    isAbsent: true,
    comment: 'Пропуск',
    semester: 1,
  }
];

async function uploadGrades() {
  try {
    console.log('Начинаем загрузку оценок в Firestore...');
    
    // Сначала удаляем все существующие оценки
    const gradesCollection = collection(db, 'grades');
    const existingGrades = await getDocs(gradesCollection);
    
    console.log(`Найдено ${existingGrades.docs.length} существующих оценок. Удаляем...`);
    
    for (const doc of existingGrades.docs) {
      await deleteDoc(doc.ref);
    }
    
    console.log('Все существующие оценки удалены.');
    
    // Загружаем новые оценки
    let uploadedCount = 0;
    for (const grade of gradesData) {
      try {
        await addDoc(gradesCollection, grade);
        uploadedCount++;
        console.log(`Загружена оценка ${uploadedCount}/${gradesData.length}: ${grade.subjectId} - ${grade.value}`);
      } catch (error) {
        console.error(`Ошибка при загрузке оценки ${grade.id}:`, error);
      }
    }
    
    console.log(`\n✅ Загрузка завершена! Загружено ${uploadedCount} оценок из ${gradesData.length}`);
    
  } catch (error) {
    console.error('Ошибка при загрузке оценок:', error);
  }
}

// Запускаем загрузку
uploadGrades();