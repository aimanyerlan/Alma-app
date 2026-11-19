// scripts/createTeacherChats.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, setDoc, doc, serverTimestamp } = require('firebase/firestore');

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

// Функция для создания ID чата с преподавателем
const createTeacherChatId = (teacherName) => {
  return `teacher_${teacherName.replace(/[^а-яёa-z]/gi, '').toLowerCase()}`;
};

// Функция для получения инициалов преподавателя
const getTeacherInitials = (teacherName) => {
  const parts = teacherName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return teacherName.substring(0, 2).toUpperCase();
};

// Данные преподавателей из grades.ts
const TEACHERS = [
  { name: "Самбетова М.Е.", subject: "ИТ-Стартап 1 (Идея/валидация)" },
  { name: "Нугуманов Н.И.", subject: "Прикладная линейная алгебра" },
  { name: "Төрахмет М.Ғ.", subject: "Анализ данных в Excel" },
  { name: "Базарбеков И.М.", subject: "Введение в Web-разработку" },
  { name: "Адильжан А.М.", subject: "Введение в программирование и алгоритмы" },
  { name: "Джубанова Г.Д.", subject: "Казахский (русский) язык 1" },
  { name: "Абдрахманова Б.Ж.", subject: "Модуль социально-политических знаний" },
];

const createTeacherChats = async () => {
  try {
    console.log('Создание чатов с преподавателями...');
    
    for (const teacher of TEACHERS) {
      const chatId = createTeacherChatId(teacher.name);
      const initials = getTeacherInitials(teacher.name);
      
      const chatData = {
        id: chatId,
        name: teacher.name,
        lastMessage: `Здравствуйте! Я ваш преподаватель по предмету "${teacher.subject}".`,
        lastMessageTime: serverTimestamp(),
        unread: false,
        unreadCount: 0,
        initials: initials,
        avatar: null,
        type: 'teacher',
        subject: teacher.subject,
      };
      
      await setDoc(doc(db, 'chats', chatId), chatData);
      console.log(`✅ Создан чат с ${teacher.name} (${chatId})`);
    }
    
    console.log('🎉 Все чаты с преподавателями созданы успешно!');
  } catch (error) {
    console.error('❌ Ошибка при создании чатов:', error);
  }
};

createTeacherChats();