const { initializeApp } = require('firebase/app');
const { getFirestore, setDoc, doc } = require('firebase/firestore');

// Прописываем firebaseConfig вручную, чтобы не импортировать src/firebase.js
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

const academicData = {
  academic_year: "2024-2025",
  semesters: [
    {
      semester: "1",
      name: "Осенний семестр",
      start: "2024-08-26",
      end: "2024-12-08",
      weeks: 15,
      midterms: [
        {
          name: "Рубежный контроль 1",
          start: "2024-10-28",
          end: "2024-11-03"
        },
        {
          name: "Рубежный контроль 2",
          start: "2024-12-02",
          end: "2024-12-08"
        }
      ],
      exam_session: {
        start: "2024-12-09",
        end: "2024-12-29"
      },
      holidays: {
        start: "2025-01-01",
        end: "2025-01-12"
      }
    },
    {
      semester: "2",
      name: "Весенний семестр",
      start: "2025-01-13",
      end: "2025-04-27",
      weeks: 15,
      midterms: [
        {
          name: "Рубежный контроль 1",
          start: "2025-03-03",
          end: "2025-03-09"
        },
        {
          name: "Рубежный контроль 2",
          start: "2025-04-21",
          end: "2025-04-27"
        }
      ],
      exam_session: {
        start: "2025-04-28",
        end: "2025-05-11"
      }
    },
    {
      semester: "3",
      name: "Летний семестр",
      start: "2025-05-12",
      end: "2025-07-13",
      weeks: 9,
      midterms: [
        {
          name: "Рубежный контроль 1",
          start: "2025-06-06",
          end: "2025-06-22"
        },
        {
          name: "Рубежный контроль 2",
          start: "2025-07-07",
          end: "2025-07-13"
        }
      ],
      exam_session: {
        start: "2025-07-14",
        end: "2025-07-20"
      },
      holidays: {
        start: "2025-07-21",
        end: "2025-08-24"
      }
    }
  ]
};

async function uploadAcademicPeriods() {
  try {
    await setDoc(doc(db, 'academicPeriods', academicData.academic_year), academicData);
    console.log('Academic periods uploaded!');
    process.exit(0);
  } catch (e) {
    console.error('Error uploading academic periods:', e);
    process.exit(1);
  }
}

uploadAcademicPeriods(); 