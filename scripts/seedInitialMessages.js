// scripts/seedInitialMessages.js
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

const initialMessages = [
  // Эдвайзер
  {
    chatId: 'advisor', sender: 'advisor', type: 'text', content: 'Здравствуйте! Как дела с курсовой?', createdAt: serverTimestamp(), isRead: false,
  },
  {
    chatId: 'advisor', sender: 'student', type: 'text', content: 'Добрый день! Уже почти готова, осталось оформить выводы.', createdAt: serverTimestamp(), isRead: false,
  },
  {
    chatId: 'advisor', sender: 'advisor', type: 'text', content: 'Отлично! Не забудьте про оформление по ГОСТу.', createdAt: serverTimestamp(), isRead: false,
  },
  {
    chatId: 'advisor', sender: 'student', type: 'text', content: 'Спасибо, учту!', createdAt: serverTimestamp(), isRead: false,
  },
  // Новые сообщения от студента эдвайзеру
  {
    chatId: 'advisor', sender: 'student', type: 'text', content: 'Я отправила черновик на почту, посмотрите, пожалуйста.', createdAt: serverTimestamp(), isRead: false,
  },
  {
    chatId: 'advisor', sender: 'student', type: 'text', content: 'Если будут замечания — готова доработать!', createdAt: serverTimestamp(), isRead: false,
  },
  // Преподаватель
  {
    chatId: 'teacher', sender: 'teacher', type: 'text', content: 'Жду ваш отчёт до пятницы.', createdAt: serverTimestamp(), isRead: false,
  },
  {
    chatId: 'teacher', sender: 'student', type: 'text', content: 'Добрый вечер! Я отправлю завтра утром.', createdAt: serverTimestamp(), isRead: false,
  },
  {
    chatId: 'teacher', sender: 'teacher', type: 'text', content: 'Хорошо, жду. Не забудьте приложить презентацию.', createdAt: serverTimestamp(), isRead: false,
  },
  {
    chatId: 'teacher', sender: 'student', type: 'text', content: 'Спасибо, обязательно!', createdAt: serverTimestamp(), isRead: false,
  },
  // Новое входящее сообщение от преподавателя
  {
    chatId: 'teacher', sender: 'teacher', type: 'text', content: 'Проверьте, пожалуйста, комментарии к вашей работе в LMS.', createdAt: serverTimestamp(), isRead: false,
  },
  // Техподдержка
  {
    chatId: 'support', sender: 'support', type: 'text', content: 'Ваш запрос принят в работу.', createdAt: serverTimestamp(), isRead: false,
  },
  {
    chatId: 'support', sender: 'student', type: 'text', content: 'Спасибо! Ожидаю ответа.', createdAt: serverTimestamp(), isRead: false,
  },
  {
    chatId: 'support', sender: 'support', type: 'text', content: 'Проблема с доступом решена, проверьте, пожалуйста.', createdAt: serverTimestamp(), isRead: false,
  },
  {
    chatId: 'support', sender: 'student', type: 'text', content: 'Всё работает, благодарю!', createdAt: serverTimestamp(), isRead: false,
  },
];

async function seedMessages() {
  for (const msg of initialMessages) {
    await addDoc(collection(db, 'messages'), msg);
    console.log(`Добавлено сообщение для чата: ${msg.chatId}`);
  }
  console.log('Стартовые сообщения добавлены!');
}

seedMessages().then(() => process.exit(0));