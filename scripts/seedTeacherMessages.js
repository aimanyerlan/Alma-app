// scripts/seedTeacherMessages.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

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

// Данные преподавателей и их сообщения
const TEACHER_MESSAGES = [
  {
    teacher: "Самбетова М.Е.",
    subject: "ИТ-Стартап 1 (Идея/валидация)",
    messages: [
      "Здравствуйте! Я ваш преподаватель по предмету 'ИТ-Стартап 1 (Идея/валидация)'. Готов ответить на ваши вопросы по проекту.",
      "Напоминаю, что презентация проекта должна быть готова к следующей неделе.",
      "Отличная работа над валидацией идеи! Продолжайте в том же духе."
    ]
  },
  {
    teacher: "Нугуманов Н.И.",
    subject: "Прикладная линейная алгебра",
    messages: [
      "Здравствуйте! Я ваш преподаватель по предмету 'Прикладная линейная алгебра'. Если есть вопросы по материалу - обращайтесь.",
      "Домашнее задание по матрицам нужно сдать до пятницы.",
      "Хорошо справились с последней контрольной работой!"
    ]
  },
  {
    teacher: "Төрахмет М.Ғ.",
    subject: "Анализ данных в Excel",
    messages: [
      "Здравствуйте! Я ваш преподаватель по предмету 'Анализ данных в Excel'. Готов помочь с практическими заданиями.",
      "Не забудьте про лабораторную работу по сводным таблицам.",
      "Отличные результаты по анализу данных!"
    ]
  },
  {
    teacher: "Базарбеков И.М.",
    subject: "Введение в Web-разработку",
    messages: [
      "Здравствуйте! Я ваш преподаватель по предмету 'Введение в Web-разработку'. Вопросы по HTML/CSS/JavaScript?",
      "Финальный проект должен быть готов к концу семестра.",
      "Хорошо работаете с JavaScript! Продолжайте практиковаться."
    ]
  },
  {
    teacher: "Адильжан А.М.",
    subject: "Введение в программирование и алгоритмы",
    messages: [
      "Здравствуйте! Я ваш преподаватель по предмету 'Введение в программирование и алгоритмы'.",
      "Практические задания по алгоритмам нужно сдать до среды.",
      "Отличные результаты по программированию! Алгоритмы даются хорошо."
    ]
  },
  {
    teacher: "Джубанова Г.Д.",
    subject: "Казахский (русский) язык 1",
    messages: [
      "Здравствуйте! Я ваш преподаватель по предмету 'Казахский (русский) язык 1'.",
      "Эссе по теме 'Моя семья' нужно сдать до понедельника.",
      "Хорошо справились с грамматическими заданиями!"
    ]
  },
  {
    teacher: "Абдрахманова Б.Ж.",
    subject: "Модуль социально-политических знаний",
    messages: [
      "Здравствуйте! Я ваш преподаватель по предмету 'Модуль социально-политических знаний'.",
      "Реферат по психологии нужно сдать до пятницы.",
      "Отличная работа над культурологическими вопросами!"
    ]
  }
];

const seedTeacherMessages = async () => {
  try {
    console.log('Добавление сообщений от преподавателей...');
    
    for (const teacherData of TEACHER_MESSAGES) {
      const chatId = createTeacherChatId(teacherData.teacher);
      
      for (const messageText of teacherData.messages) {
        const messageData = {
          chatId: chatId,
          sender: 'teacher',
          type: 'text',
          content: messageText,
          createdAt: serverTimestamp(),
          isRead: false,
        };
        
        await addDoc(collection(db, 'messages'), messageData);
        console.log(`✅ Добавлено сообщение от ${teacherData.teacher}: "${messageText.substring(0, 50)}..."`);
      }
    }
    
    console.log('🎉 Все сообщения от преподавателей добавлены успешно!');
  } catch (error) {
    console.error('❌ Ошибка при добавлении сообщений:', error);
  }
};

seedTeacherMessages();