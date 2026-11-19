import React, { createContext, useContext, useState, useEffect } from 'react';
import SCHEDULE from '../data/schedule';
import GRADES from '../data/grades';
import { collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { View, Text } from 'react-native';

// Интерфейсы для типизации данных
export interface Subject {
  id: string;
  name: string;
  code?: string;
  credits?: number;
  semester: number;
  teacher: string;
  type?: 'lecture' | 'seminar' | 'lab' | 'practice';
  totalHours?: number;
  color?: string;
}

export interface Grade {
  id: string;
  subjectId: string;
  type: 'attendance' | 'homework' | 'midterm' | 'final' | 'project' | 'exam' | 'seminar';
  value: number | string; // число для оценок, строка для буквенных оценок
  maxValue: number;
  weight: number; // вес оценки в процентах
  date: string;
  comment?: string;
  isAbsent?: boolean;
  semester: number; // Добавляем поле semester
}

export interface SemesterGrades {
  semester: number;
  subjects: Subject[];
  grades: Grade[];
  gpa: number;
  totalCredits: number;
}

export interface GradeBookData {
  studentId: string;
  studentName: string;
  program: string;
  year: number;
  semesters: SemesterGrades[];
  overallGpa: number;
  totalCredits: number;
}

// Универсальная функция для subjectId
function makeSubjectId(subject: string, teacher: string) {
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

// Генерация оценок по GRADES и расписанию
function generateGradesFromData() {
  const startDate = new Date('2025-01-13'); // 13 января 2025
  const weeks = 15;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weekStartDates = Array.from({ length: weeks }, (_, i) => new Date(startDate.getTime() + i * weekMs));
  const dayMap: Record<string, number> = { 'ПН': 1, 'ВТ': 2, 'СР': 3, 'ЧТ': 4, 'ПТ': 5, 'СБ': 6, 'ВС': 0 };
  let idCounter = 1;
  const grades: Grade[] = [];
  const subjects: Subject[] = [];

  for (const subj of GRADES) {
    // Нормализуем subject и teacher для сравнения
    const normalizeSubject = (s: string) => s
      .replace(/,? ?'КЧ'?/, '')
      .replace(/['"«»]/g, '')
      .replace(/[Bb]/g, 'В') // латинская и кириллическая B/В взаимозаменяемы
      .replace(/[В]/g, 'В')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .trim();
    const normalizeTeacher = (t: string) => t.replace(/["'«»]/g, '').replace(/\s+/g, ' ').replace(/\./g, '').trim();
    const lessons = SCHEDULE.filter(l =>
      normalizeSubject(l.subject) === normalizeSubject(subj.subject) &&
      normalizeTeacher(l.teacher) === normalizeTeacher(subj.teacher)
    );
    const lessonDays = Array.from(new Set(lessons.map(l => l.day)));
    const subjectId = makeSubjectId(subj.subject, subj.teacher);
    
    subjects.push({
      id: subjectId,
      name: subj.subject,
      semester: 1,
      teacher: subj.teacher,
      credits: subj.credits,
      type: 'seminar',
    });
    // srtek11: 8 недель, только одна оценка на неделю (по первому дню)
    let itStartupAttendance1 = [56, 64, 72, 60, 66, 74, 78, 90];
    let itStartupAttendance2 = [80, 86, 90, 84, 85];
    for (let i = 0; i < 8; i++) {
      const weekDate = weekStartDates[i];
      if (lessonDays.length > 0) {
        const day = lessonDays[0];
        const dayNum = dayMap[day];
        const date = new Date(weekDate);
        date.setDate(weekDate.getDate() + ((dayNum - weekDate.getDay() + 7) % 7));
        if (date >= weekDate && date < new Date(weekDate.getTime() + weekMs)) {
          grades.push({
            id: (idCounter++).toString(),
            subjectId,
            type: 'seminar',
            value:
              subj.subject === 'ИТ-Стартап 1 (Идея/валидация)' && subj.teacher === 'Самбетова М.Е'
                ? itStartupAttendance1[i]
                : Number(subj.grades.srtek11) || 0,
            maxValue: 100,
            weight: 5,
            date: date.toISOString().slice(0, 10),
            semester: 1,
          });
        }
      }
    }
    // rk1: неделя 9 (3-9 марта), только одна оценка на первый день занятия недели
    {
      const weekIdx = 7;
      const weekDate = weekStartDates[weekIdx];
      let rk1Set = false;
      for (const day of lessonDays) {
        if (rk1Set) break;
        const dayNum = dayMap[day];
        const date = new Date(weekDate);
        date.setDate(weekDate.getDate() + ((dayNum - weekDate.getDay() + 7) % 7));
        if (date >= weekDate && date < new Date(weekDate.getTime() + weekMs)) {
          grades.push({
            id: (idCounter++).toString(),
            subjectId,
            type: 'midterm',
            value: Number(subj.grades.rk1) || 0,
            maxValue: 100,
            weight: 20,
            date: date.toISOString().slice(0, 10),
            semester: 1,
          });
          rk1Set = true;
        }
      }
    }
    // srtek22: 5 недель, только одна оценка на неделю (по первому дню)
    for (let i = 9; i < 14; i++) {
      const weekDate = weekStartDates[i];
      if (lessonDays.length > 0) {
        const day = lessonDays[0];
        const dayNum = dayMap[day];
        const date = new Date(weekDate);
        date.setDate(weekDate.getDate() + ((dayNum - weekDate.getDay() + 7) % 7));
        if (date >= weekDate && date < new Date(weekDate.getTime() + weekMs)) {
          grades.push({
            id: (idCounter++).toString(),
            subjectId,
            type: 'seminar',
            value:
              subj.subject === 'ИТ-Стартап 1 (Идея/валидация)' && subj.teacher === 'Самбетова М.Е'
                ? itStartupAttendance2[i-9]
                : Number(subj.grades.srtek22) || 0,
            maxValue: 100,
            weight: 5,
            date: date.toISOString().slice(0, 10),
            semester: 1,
          });
        }
      }
    }
    // rk2: неделя 15 (21-27 апр), только одна оценка на неделю (по первому дню)
    {
      const weekIdx = 14;
      const weekDate = weekStartDates[weekIdx];
      if (lessonDays.length > 0) {
        const day = lessonDays[0];
        const dayNum = dayMap[day];
        const date = new Date(weekDate);
        date.setDate(weekDate.getDate() + ((dayNum - weekDate.getDay() + 7) % 7));
        if (date >= weekDate && date < new Date(weekDate.getTime() + weekMs)) {
          grades.push({
            id: (idCounter++).toString(),
            subjectId,
            type: 'midterm',
            value: Number(subj.grades.rk2) || 0,
            maxValue: 100,
            weight: 20,
            date: date.toISOString().slice(0, 10),
            semester: 1,
          });
        }
      }
    }
    // exam: 28 апр — 11 мая (только одна оценка на неделю, по первому дню)
    if ('exam' in subj.grades) {
      const examStart = new Date('2025-04-28');
      if (lessonDays.length > 0) {
        const day = lessonDays[0];
        const dayNum = dayMap[day];
        const date = new Date(examStart);
        date.setDate(examStart.getDate() + ((dayNum - examStart.getDay() + 7) % 7));
        if (date >= examStart && date < new Date(examStart.getTime() + weekMs)) {
          grades.push({
            id: (idCounter++).toString(),
            subjectId,
            type: 'exam',
            value: Number(subj.grades.exam) || 0,
            maxValue: 100,
            weight: 50,
            date: date.toISOString().slice(0, 10),
            semester: 1,
          });
        }
      }
    }
    // pass: 11 мая (только одна оценка на неделю, по первому дню)
    if ('pass' in subj.grades) {
      const passDate = new Date('2025-05-11');
      if (lessonDays.length > 0) {
        const day = lessonDays[0];
        const dayNum = dayMap[day];
        const date = new Date(passDate);
        date.setDate(passDate.getDate() + ((dayNum - passDate.getDay() + 7) % 7));
        if (date >= passDate && date < new Date(passDate.getTime() + weekMs)) {
          grades.push({
            id: (idCounter++).toString(),
            subjectId,
            type: 'final',
            value: typeof subj.grades.pass === 'string' ? subj.grades.pass : (Number(subj.grades.pass) || 'зачет'),
            maxValue: 100,
            weight: 100,
            date: date.toISOString().slice(0, 10),
            semester: 1,
          });
        }
      }
    }
  }
  return { grades, subjects };
}

const { grades: initialGrades, subjects: initialSubjects } = generateGradesFromData();

const subjectCodeMap: { [key: string]: string } = {
  'Модуль социально-политических знаний (Культурология/Психология)': 'MSPZKP 1106',
  'Введение в программирование и алгоритмы': 'VPA 1215',
  'Анализ данных в Excel': 'ADE 1134',
  'Введение в Web-разработку с помощью HTML, CSS, JavaScript': 'VWRPHCJ 1219',
  'ИТ-Стартап 1 (Идея/валидация)': 'ISI 1212',
  'Казахский (русский) язык 1 (B2)': 'KRYaV 1110',
  'Прикладная линейная алгебра': 'PLA 1217',
  'Дизайн жизни': 'DZh 1135',
};

const normalizeSubject = (s: string) => s
  .replace(/,? ?'КЧ'?/, '')
  .replace(/['"«»]/g, '')
  .replace(/[Bb]/g, 'В') // латинская и кириллическая B/В взаимозаменяемы
  .replace(/[В]/g, 'В')
  .replace(/\s+/g, ' ')
  .toLowerCase()
  .trim();
initialSubjects.forEach(subj => {
  const normName = normalizeSubject(subj.name);
  for (const key in subjectCodeMap) {
    if (normalizeSubject(key) === normName) {
      subj.code = subjectCodeMap[key];
      break;
    }
  }
});

const initialGradeBookData: GradeBookData = {
  studentId: '2024001',
  studentName: 'Айман Ерлан',
  program: 'Информационные технологии',
  year: 2024,
  semesters: [
    {
      semester: 1,
      subjects: initialSubjects,
      grades: initialGrades,
      gpa: 0,
      totalCredits: initialSubjects.reduce((sum, s) => sum + (s.credits ?? 3), 0),
    },
    // Академический период 2 (семестр 2)
    {
      semester: 2,
      subjects: [
        { id: 'VBERBD1220', name: 'Введение в Back-End разработку и Базы данных', code: 'VBERBD 1220', credits: 5, semester: 2, teacher: '', type: 'seminar' },
        { id: 'DMS1218', name: 'Дискретные математические структуры', code: 'DMS 1218', credits: 3, semester: 2, teacher: '', type: 'seminar' },
        { id: 'FK1102', name: 'Физическая культура 1', code: 'FK 1102', credits: 4, semester: 2, teacher: '', type: 'seminar' },
        { id: 'FK1103', name: 'Физическая культура 2', code: 'FK 1103', credits: 4, semester: 2, teacher: '', type: 'seminar' },
        { id: 'Fil1104', name: 'Философия', code: 'Fil 1104', credits: 5, semester: 2, teacher: '', type: 'seminar' },
        { id: 'ISZPMVP1301', name: 'ИТ-Стартап 2 (Запуск проекта, MVP, Веб проект)', code: 'ISZPMVP 1301', credits: 5, semester: 2, teacher: '', type: 'seminar' },
        { id: 'SO1204', name: 'Служение обществу', code: 'SO 1204', credits: 3, semester: 2, teacher: '', type: 'seminar' },
        { id: 'OOPSD1216', name: 'Объектно-ориентированное программирование и структуры данных', code: 'OOPSD 1216', credits: 3, semester: 2, teacher: '', type: 'seminar' },
        { id: 'IYaA1118', name: 'Иностранный язык 1 (A2)', code: 'IYaA 1118', credits: 5, semester: 2, teacher: '', type: 'seminar' },
      ],
      grades: [], // нет оценок, неосвоено
      gpa: 0,
      totalCredits: 52, // сумма кредитов периода 2
    },
    // Академический период 3 (семестр 3)
    {
      semester: 3,
      subjects: [
        { id: 'KRYaV1115', name: 'Казахский (русский) язык 2 (B2)', code: 'KRYaV 1115', credits: 5, semester: 3, teacher: '', type: 'seminar' },
        { id: 'PSVPD1302', name: 'Практика 1 - Создание внутрикорпоративных проектов (Dual)', code: 'PSVPD 1302', credits: 10, semester: 3, teacher: '', type: 'seminar' },
      ],
      grades: [],
      gpa: 0,
      totalCredits: 15,
    },
  ],
  overallGpa: 0,
  totalCredits: initialSubjects.reduce((sum, s) => sum + (s.credits ?? 3), 0) + 52, // 1+2 периоды
};

// После генерации initialGrades:
const modSocSubject = initialSubjects.find(s => normalizeSubject(s.name) === normalizeSubject("Модуль социально-политических знаний (Культурология/Психология)"));
if (modSocSubject) {
  initialGrades.push({
    id: 'abs1',
    subjectId: modSocSubject.id,
    type: 'attendance',
    value: 0,
    maxValue: 100,
    weight: 0,
    date: '2025-01-13',
    isAbsent: true,
    comment: 'Пропуск',
    semester: 1,
  });
}

// Добавляем пропуск для Анализ данных в Excel
const excelSubject = initialSubjects.find(s => normalizeSubject(s.name) === normalizeSubject("Анализ данных в Excel"));
if (excelSubject) {
  initialGrades.push({
    id: 'abs2',
    subjectId: excelSubject.id,
    type: 'attendance',
    value: 0,
    maxValue: 100,
    weight: 0,
    date: '2025-01-20', // Пропуск на второй неделе
    isAbsent: true,
    comment: 'Пропуск',
    semester: 1,
  });
}

// Контекст для журнала оценок
interface GradeBookContextType {
  gradeBookData: GradeBookData;
  currentSemester: number;
  setCurrentSemester: (semester: number) => void;
  getSubjectGrades: (subjectId: string) => Grade[];
  calculateSubjectGpa: (subjectId: string) => number;
  calculateSemesterGpa: (semester: number) => number;
  addGrade: (grade: Omit<Grade, 'id'>) => void;
  updateGrade: (id: string, updates: Partial<Grade>) => void;
  deleteGrade: (id: string) => void;
  getGradeTypeLabel: (type: Grade['type']) => string;
  getGradeColor: (grade: Grade) => string;
  calculateOverallGpa: () => number;
  loadingGrades: boolean;
  gradesError: string | null;
}

const GradeBookContext = createContext<GradeBookContextType | undefined>(undefined);

export const useGradeBook = () => {
  const context = useContext(GradeBookContext);
  if (!context) {
    throw new Error('useGradeBook must be used within a GradeBookProvider');
  }
  return context;
};

// Провайдер журнала оценок
export const GradeBookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gradeBookData, setGradeBookData] = useState<GradeBookData>(initialGradeBookData);
  const [currentSemester, setCurrentSemester] = useState(1);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [gradesError, setGradesError] = useState<string | null>(null);

  // Загрузка оценок из Firestore при инициализации
  useEffect(() => {
    async function fetchGradesFromFirestore() {
      setLoadingGrades(true);
      setGradesError(null);
      try {
        const gradesCol = collection(db, 'grades');
        const gradesSnapshot = await getDocs(gradesCol);
        // Приводим к типу Grade & { semester: number }
        const grades = gradesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Grade & { semester: number }))
          .filter(g => typeof g.semester === 'number');
        // Группируем оценки по семестрам
        const semesters = gradeBookData.semesters.map(sem => ({
          ...sem,
          grades: grades.filter(g => g.semester === sem.semester),
        }));
        setGradeBookData(prev => ({ ...prev, semesters }));
      } catch (e) {
        setGradesError('Ошибка загрузки оценок из Firestore');
      } finally {
        setLoadingGrades(false);
      }
    }
    fetchGradesFromFirestore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Получить оценки по предмету
  const getSubjectGrades = (subjectId: string): Grade[] => {
    return gradeBookData.semesters
      .flatMap(semester => semester.grades)
      .filter(grade => grade.subjectId === subjectId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Рассчитать GPA по предмету по пользовательской формуле (final → 4-балльная шкала)
  const calculateSubjectGpa = (subjectId: string): number => {
    const grades = getSubjectGrades(subjectId);
    // srtek11: attendance или seminar за 1-8 недели
    const srtek11 = grades.filter(g => (g.type === 'attendance' || g.type === 'seminar') && g.date >= '2025-01-13' && g.date < '2025-03-03');
    // srtek22: attendance или seminar за 10-14 недели
    const srtek22 = grades.filter(g => (g.type === 'attendance' || g.type === 'seminar') && g.date >= '2025-03-10' && g.date < '2025-04-14');
    // rk1: midterm за 9 неделю (2025-03-03 ... 2025-03-09)
    const rk1 = grades.filter(g => g.type === 'midterm' && g.date >= '2025-03-03' && g.date <= '2025-03-09');
    // rk2: midterm за 15 неделю (2025-04-21 ... 2025-04-27)
    const rk2 = grades.filter(g => g.type === 'midterm' && g.date >= '2025-04-21' && g.date <= '2025-04-27');
    // exam: exam за 28 апр — 11 мая
    const exam = grades.filter(g => g.type === 'exam' && g.date >= '2025-04-28' && g.date <= '2025-05-11');
    const avg1 = srtek11.length ? srtek11.reduce((a, b) => a + Number(b.value), 0) / srtek11.length : 0;
    const avg2 = srtek22.length ? srtek22.reduce((a, b) => a + Number(b.value), 0) / srtek22.length : 0;
    const rk1avg = rk1.length ? rk1.reduce((a, b) => a + Number(b.value), 0) / rk1.length : 0;
    const rk2avg = rk2.length ? rk2.reduce((a, b) => a + Number(b.value), 0) / rk2.length : 0;
    const examAvg = exam.length ? exam.reduce((a, b) => a + Number(b.value), 0) / exam.length : 0;
    const current = (avg1 + avg2 + rk1avg + rk2avg) / 4;
    const finalScore = current * 0.6 + examAvg * 0.4;
    const finalRounded = Math.round(finalScore * 100) / 100;
    // GPA по шкале
    let gpa = 0;
    if (finalRounded >= 95) gpa = 4.0;
    else if (finalRounded >= 90) gpa = 3.67;
    else if (finalRounded >= 85) gpa = 3.33;
    else if (finalRounded >= 80) gpa = 3.0;
    else if (finalRounded >= 75) gpa = 2.67;
    else if (finalRounded >= 70) gpa = 2.33;
    else if (finalRounded >= 65) gpa = 2.0;
    else if (finalRounded >= 60) gpa = 1.67;
    else if (finalRounded >= 55) gpa = 1.33;
    else if (finalRounded >= 50) gpa = 1.0;
    else gpa = 0.0;
    return Number(gpa.toFixed(2));
  };

  // Рассчитать GPA по семестру
  const calculateSemesterGpa = (semester: number): number => {
    const semesterData = gradeBookData.semesters.find(s => s.semester === semester);
    if (!semesterData) return 0;

    const subjectGpas = semesterData.subjects.map(subject => ({
      gpa: calculateSubjectGpa(subject.id),
      credits: subject.credits ?? 3
    }));

    const totalCredits = subjectGpas.reduce((sum, subject) => sum + (subject.credits ?? 3), 0);
    const weightedGpa = subjectGpas.reduce((sum, subject) => sum + (subject.gpa * (subject.credits ?? 3)), 0);

    return totalCredits > 0 ? weightedGpa / totalCredits : 0;
  };

  // Добавить оценку (только локально)
  const addGrade = (grade: Omit<Grade, 'id'>) => {
    const semesterNum = (grade as any).semester ?? currentSemester;
    const newGrade: Grade = {
      ...grade,
      id: Date.now().toString(),
      semester: semesterNum,
    } as Grade & { semester: number };
    setGradeBookData(prev => {
      const semesters = prev.semesters.map(semester =>
        semester.semester === semesterNum
          ? { ...semester, grades: [...semester.grades, newGrade] }
          : semester
      );
      return { ...prev, semesters };
    });
  };

  // Обновить оценку (только локально)
  const updateGrade = (id: string, updates: Partial<Grade>) => {
    setGradeBookData(prev => {
      const semesters = prev.semesters.map(semester => ({
        ...semester,
        grades: semester.grades.map(grade =>
          grade.id === id ? { ...grade, ...updates } : grade
        )
      }));
      return { ...prev, semesters };
    });
  };

  // Удалить оценку (только локально)
  const deleteGrade = (id: string) => {
    setGradeBookData(prev => {
      const semesters = prev.semesters.map(semester => ({
        ...semester,
        grades: semester.grades.filter(grade => grade.id !== id)
      }));
      return { ...prev, semesters };
    });
  };

  // Получить название типа оценки
  const getGradeTypeLabel = (type: Grade['type']): string => {
    const labels = {
      attendance: 'Посещаемость',
      homework: 'Домашнее задание',
      midterm: 'Рубежный контроль',
      final: 'Финальный экзамен',
      project: 'Проект',
      exam: 'Экзамен',
      seminar: 'Семинар',
    };
    return labels[type];
  };

  // Получить цвет для оценки
  const getGradeColor = (grade: Grade): string => {
    const percentage = (Number(grade.value) / grade.maxValue) * 100;
    
    if (percentage >= 90) return '#4CAF50'; // Зеленый - отлично
    if (percentage >= 80) return '#8BC34A'; // Светло-зеленый - хорошо
    if (percentage >= 70) return '#FFC107'; // Желтый - удовлетворительно
    if (percentage >= 60) return '#FF9800'; // Оранжевый - плохо
    return '#F44336'; // Красный - очень плохо
  };

  // Рассчитать общий GPA по всем освоенным семестрам (средневзвешенно по кредитам)
  const calculateOverallGpa = (): number => {
    // Только семестры, где есть хотя бы одна освоенная дисциплина
    const passedSemesters = gradeBookData.semesters.filter(semester =>
      semester.subjects.some(subj => {
        const grades = semester.grades.filter(g => g.subjectId === subj.id);
        const final = grades.find(g => g.type === 'final' || g.type === 'exam');
        if (!final) return false;
        if (typeof final.value === 'string' && final.value.toLowerCase().includes('зачет')) return true;
        if (typeof final.value === 'number' && final.value >= 50) return true;
        return false;
      })
    );
    const totalCredits = passedSemesters.reduce((sum, s) => sum + (s.totalCredits ?? 0), 0);
    const weightedGpa = passedSemesters.reduce((sum, s) => sum + (calculateSemesterGpa(s.semester) * (s.totalCredits ?? 0)), 0);
    return totalCredits > 0 ? weightedGpa / totalCredits : 0;
  };

  const value: GradeBookContextType = {
    gradeBookData,
    currentSemester,
    setCurrentSemester,
    getSubjectGrades,
    calculateSubjectGpa,
    calculateSemesterGpa,
    addGrade,
    updateGrade,
    deleteGrade,
    getGradeTypeLabel,
    getGradeColor,
    calculateOverallGpa,
    loadingGrades,
    gradesError,
  };

  return (
    <GradeBookContext.Provider value={value}>
      {loadingGrades && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Загрузка оценок...</Text>
        </View>
      )}
      {gradesError && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'red' }}>{gradesError}</Text>
        </View>
      )}
      {!loadingGrades && !gradesError && children}
    </GradeBookContext.Provider>
  );
}; 