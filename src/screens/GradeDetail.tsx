import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useColorScheme, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useGradeBook } from '../contexts/GradeBookContext';

// Функция для создания ID чата с преподавателем
const createTeacherChatId = (teacherName: string) => {
  return `teacher_${teacherName.replace(/[^а-яёa-z]/gi, '').toLowerCase()}`;
};

// Функция для получения инициалов преподавателя
const getTeacherInitials = (teacherName: string) => {
  const parts = teacherName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return teacherName.substring(0, 2).toUpperCase();
};

export default function GradeDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const colorScheme = useColorScheme();
  const subjectId = route?.params?.subjectId;
  const { 
    gradeBookData, 
    getSubjectGrades, 
    calculateSubjectGpa, 
    getGradeTypeLabel, 
    getGradeColor,
    deleteGrade
  } = useGradeBook();

  const currentSemester = gradeBookData.semesters.find(s => s.semester === 1);
  const subject = subjectId ? currentSemester?.subjects.find(s => s.id === subjectId) : undefined;
  const grades = subjectId ? getSubjectGrades(subjectId) : [];
  const subjectGpa = subjectId ? calculateSubjectGpa(subjectId) : 0;

  // Функция для перехода в чат с преподавателем
  const navigateToTeacherChat = (teacherName: string) => {
    const chatId = createTeacherChatId(teacherName);
    const initials = getTeacherInitials(teacherName);
    
    navigation.navigate('ChatRoomScreen', { 
      chatId, 
      name: teacherName, 
      initials,
      subject: subject?.name
    });
  };

  const getGpaColor = (gpa: number) => {
    if (gpa >= 3.5) return '#10B981'; // Emerald
    if (gpa >= 3.0) return '#059669'; // Emerald-600
    if (gpa >= 2.5) return '#F59E0B'; // Amber-500
    if (gpa >= 2.0) return '#F97316'; // Orange-500
    return '#EF4444'; // Red-500
  };

  const getGpaLabel = (gpa: number) => {
    if (gpa >= 3.5) return 'Отлично';
    if (gpa >= 3.0) return 'Хорошо';
    if (gpa >= 2.5) return 'Удовлетворительно';
    if (gpa >= 2.0) return 'Плохо';
    return 'Очень плохо';
  };

  // --- Новый расчет итоговой оценки по формуле пользователя ---
  function getFinalAndGpaFromGrades(subjectId: string) {
    // Получаем все оценки по предмету
    const allGrades = getSubjectGrades(subjectId);
    // Вспомогательная функция: только одна оценка за неделю по типу
    function uniqueByWeek(grades: any[]) {
      const seen = new Set();
      return grades.filter(g => {
        const week = new Date(g.date);
        const weekNum = `${week.getFullYear()}_${Math.ceil((week.getTime() - new Date(week.getFullYear(),0,1).getTime())/604800000)}`;
        const key = `${g.type}_${weekNum}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    // srtek11: attendance или seminar за 1-8 недели (только по одной на неделю)
    const srtek11 = uniqueByWeek(allGrades.filter(g => (g.type === 'attendance' || g.type === 'seminar') && g.date >= '2025-01-13' && g.date < '2025-03-03'));
    // srtek22: attendance или seminar за 10-14 недели (только по одной на неделю)
    const srtek22 = uniqueByWeek(allGrades.filter(g => (g.type === 'attendance' || g.type === 'seminar') && g.date >= '2025-03-10' && g.date < '2025-04-14'));
    // rk1: midterm за 9 неделю (2025-03-03 ... 2025-03-09) — только одна за неделю
    const rk1 = uniqueByWeek(allGrades.filter(g => g.type === 'midterm' && g.date >= '2025-03-03' && g.date <= '2025-03-09'));
    // rk2: midterm за 15 неделю (2025-04-21 ... 2025-04-27) — только одна за неделю
    const rk2 = uniqueByWeek(allGrades.filter(g => g.type === 'midterm' && g.date >= '2025-04-21' && g.date <= '2025-04-27'));
    // exam: exam за 28 апр — 11 мая — только одна за неделю
    const exam = uniqueByWeek(allGrades.filter(g => g.type === 'exam' && g.date >= '2025-04-28' && g.date <= '2025-05-11'));

    const avg1 = srtek11.length ? srtek11.reduce((a, b) => a + Number(b.value), 0) / srtek11.length : 0;
    const avg2 = srtek22.length ? srtek22.reduce((a, b) => a + Number(b.value), 0) / srtek22.length : 0;
    const rk1avg = rk1.length ? rk1.reduce((a, b) => a + Number(b.value), 0) / rk1.length : 0;
    const rk2avg = rk2.length ? rk2.reduce((a, b) => a + Number(b.value), 0) / rk2.length : 0;
    const examAvg = exam.length ? exam.reduce((a, b) => a + Number(b.value), 0) / exam.length : 0;

    const current = (avg1 + avg2 + rk1avg + rk2avg) / 4;
    const finalScore = current * 0.6 + examAvg * 0.4;
    const finalRounded = Math.round(finalScore);
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
    return { avg1, avg2, rk1avg, rk2avg, examAvg, finalRounded, gpa };
  }
  const calc = subject ? getFinalAndGpaFromGrades(subject.id) : null;

  // Функция для подписи типа оценки
  function getCustomGradeTypeLabel(grade: any) {
    if (grade.type === 'midterm') {
      if (grade.date >= '2025-03-03' && grade.date <= '2025-03-09') return 'Рубежный контроль 1';
      if (grade.date >= '2025-04-21' && grade.date <= '2025-04-27') return 'Рубежный контроль 2';
      return 'Рубежный контроль';
    }
    if (grade.type === 'attendance') return 'Посещаемость';
    if (grade.type === 'exam') return 'Экзамен';
    if (grade.type === 'final' && grade.value === 'зачет') return 'Зачет';
    return getGradeTypeLabel(grade.type);
  }

  // Получить уникальные оценки по неделям и типам (без дублей)
  function getUniqueGrades(grades: any[]) {
    const seen = new Set();
    return grades.filter(g => {
      const week = new Date(g.date);
      const weekNum = `${week.getFullYear()}_${Math.ceil((week.getTime() - new Date(week.getFullYear(),0,1).getTime())/604800000)}`;
      let key = '';
      if (g.type === 'seminar' || g.type === 'attendance') {
        key = `${g.type}_${weekNum}`;
      } else if (g.type === 'midterm') {
        key = `midterm_${weekNum}`;
      } else {
        key = `${g.type}_${g.date}`;
      }
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const uniqueGrades = getUniqueGrades(grades);

  if (!subjectId) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <Text style={tw`text-red-500 text-base`}>Ошибка: не передан параметр subjectId</Text>
      </View>
    );
  }
  if (!subject) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <Text style={tw`text-red-500 text-base`}>Ошибка: предмет не найден</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 ${colorScheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <View style={tw`flex-row items-center h-16 px-6 border-b ${colorScheme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-4`}>
          <Icon name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#374151'} />
        </TouchableOpacity>
        <Text style={tw`text-xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Детали предмета</Text>
      </View>

      {/* Subject Info Card */}
      <View style={tw`mx-4 mt-4 p-6 rounded-2xl ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <View style={tw`flex-row items-start justify-between mb-4`}>
          <View style={tw`flex-1`}>
            <Text style={tw`text-xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{subject.name}</Text>
            <View style={tw`flex-row items-center mt-1`}>
              <Text style={tw`text-sm ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{subject.code} • </Text>
              <TouchableOpacity 
                onPress={() => navigateToTeacherChat(subject.teacher)}
                style={tw`flex-row items-center`}
                activeOpacity={0.7}
              >
                <Text style={tw`text-sm font-semibold ${colorScheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  {subject.teacher}
                </Text>
                <Icon 
                  name="chatbubble-outline" 
                  size={14} 
                  color={colorScheme === 'dark' ? '#60A5FA' : '#2563EB'} 
                  style={tw`ml-1`}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={tw`items-end`}>
            <View style={tw`px-4 py-2 rounded-full ${colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Text style={tw`text-sm font-semibold ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {subject.credits} кредитов
              </Text>
            </View>
          </View>
        </View>
        <View style={tw`flex-row items-center`}>
          <View style={tw`px-3 py-1 rounded-full ${colorScheme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'}`}>
            <Text style={tw`text-xs font-semibold ${colorScheme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
              {subject.type === 'lecture' ? 'Лекция' : 
               subject.type === 'seminar' ? 'Семинар' : 
               subject.type === 'lab' ? 'Лабораторная' : 'Практика'}
            </Text>
          </View>
        </View>
      </View>

      {/* Итоговая оценка и GPA по формуле */}
      {calc && (
        <View style={tw`mx-4 mt-4 p-6 rounded-2xl ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}> 
          <Text style={tw`text-lg font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Результаты</Text>
          
          <View style={tw`space-y-3`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center`}>
                <Icon name="trending-up-outline" size={16} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <Text style={tw`text-sm ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ml-2`}>Ср. тек 1:</Text>
              </View>
              <Text style={tw`text-sm font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{calc.avg1.toFixed(2)}</Text>
            </View>
            
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center`}>
                <Icon name="trending-up-outline" size={16} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <Text style={tw`text-sm ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ml-2`}>Ср. тек 2:</Text>
              </View>
              <Text style={tw`text-sm font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{calc.avg2.toFixed(2)}</Text>
            </View>
            
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center`}>
                <Icon name="document-text-outline" size={16} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <Text style={tw`text-sm ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ml-2`}>РК1:</Text>
              </View>
              <Text style={tw`text-sm font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{calc.rk1avg.toFixed(2)}</Text>
            </View>
            
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center`}>
                <Icon name="document-text-outline" size={16} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <Text style={tw`text-sm ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ml-2`}>РК2:</Text>
              </View>
              <Text style={tw`text-sm font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{calc.rk2avg.toFixed(2)}</Text>
            </View>
            
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center`}>
                <Icon name="school-outline" size={16} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <Text style={tw`text-sm ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ml-2`}>Экзамен:</Text>
              </View>
              <Text style={tw`text-sm font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{calc.examAvg.toFixed(2)}</Text>
            </View>
            
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center`}>
                <Icon name="time-outline" size={16} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <Text style={tw`text-sm ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ml-2`}>Пропуски:</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-sm font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {(() => {
                    const lessons = require('../data/schedule').default.filter((l: any) => l.subject === subject.name);
                    const totalHours = lessons.length * 15; // 15 недель (каждое занятие 50 мин = 1 час)
                    const currentAbsences = grades.filter(g => g.isAbsent).length;
                    const hoursPerDay = lessons.length; // количество занятий в день (каждое = 1 час)
                    const currentAbsenceHours = currentAbsences * hoursPerDay;
                    return ((currentAbsenceHours / totalHours) * 100).toFixed(1);
                  })()}%
                </Text>
              </View>
            </View>
            {(() => {
              const absencePercent = parseFloat(
                (() => {
                  const lessons = require('../data/schedule').default.filter((l: any) => l.subject === subject.name);
                  const totalHours = lessons.length * 15; // 15 недель (каждое занятие 50 мин = 1 час)
                  const currentAbsences = grades.filter(g => g.isAbsent).length;
                  const hoursPerDay = lessons.length; // количество занятий в день (каждое = 1 час)
                  const currentAbsenceHours = currentAbsences * hoursPerDay;
                  return ((currentAbsenceHours / totalHours) * 100).toFixed(1);
                })()
              );
              if (absencePercent > 0) {
                return (
                  <TouchableOpacity
                    style={tw`flex-row items-center mt-2 bg-yellow-100 rounded-lg px-3 py-2 shadow`}
                    activeOpacity={0.7}
                    onPress={() => {
                      const lessons = require('../data/schedule').default.filter((l: any) => l.subject === subject.name);
                      const totalHours = lessons.length * 15;
                      const maxMiss = Math.floor(totalHours * 0.3);
                      const currentAbsences = grades.filter(g => g.isAbsent).length;
                      const hoursPerDay = lessons.length;
                      const currentAbsenceHours = currentAbsences * hoursPerDay;
                      const currentPercentage = ((currentAbsenceHours / totalHours) * 100).toFixed(1);
                      const maxPercentage = ((maxMiss / totalHours) * 100).toFixed(1);
                      const remainingMiss = Math.max(0, maxMiss - currentAbsenceHours);
                      Alert.alert('Пропуски', `Текущие пропуски: ${currentPercentage}%\nМаксимум допустимо: ${maxPercentage}%\nВсего часов: ${totalHours}\nМаксимум пропусков: ${maxMiss} часов\nМожно еще пропустить: ${remainingMiss} часов`);
                    }}
                  >
                    <Icon name="alert-circle-outline" size={22} color="#F59E0B" style={tw`mr-2`} />
                    <Text style={tw`text-sm text-yellow-700 mr-2`}>Есть пропуски! Подробнее...</Text>
                    <Icon name="chevron-forward" size={18} color="#F59E0B" />
                  </TouchableOpacity>
                );
              }
              return null;
            })()}
          </View>
          
          <View style={tw`mt-4 pt-4 border-t ${colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <View style={tw`flex-row items-center justify-between`}>
              <Text style={tw`text-lg font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Итоговая оценка:</Text>
              <Text style={tw`text-2xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{calc.finalRounded}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Таблица оценок */}
      <View style={tw`mx-4 mt-4`}> 
        <Text style={tw`text-lg font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Детали оценок</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={tw`mt-4 pl-4`}> 
          <View style={tw`flex-none`}> 
            {/* Row 1: Месяц */}
            <View style={tw`flex-row items-center`}>
              <Text style={tw`w-16 text-xs text-gray-500 mr-2`}>Месяц</Text>
              {uniqueGrades.map((grade, idx) => {
                const date = new Date(grade.date);
                const month = date.toLocaleString('ru-RU', { month: 'long' });
                return (
                  <View key={grade.id} style={tw`flex-row items-center`}>
                    <View style={tw`w-20 items-center justify-center`}>
                      <Text style={tw`text-xs text-black`}>{month.charAt(0).toUpperCase() + month.slice(1)}</Text>
                    </View>
                    {idx < uniqueGrades.length - 1 && <View style={tw`h-full w-[1px] bg-gray-300`} />}
                  </View>
                );
              })}
            </View>
            {/* Row 2: Дата */}
            <View style={tw`flex-row items-center mt-1`}>
              <Text style={tw`w-16 text-xs text-gray-500 mr-2`}>Дата</Text>
              {uniqueGrades.map((grade, idx) => {
                const date = new Date(grade.date);
                return (
                  <View key={grade.id} style={tw`flex-row items-center`}>
                    <View style={tw`w-20 items-center justify-center`}>
                      <Text style={tw`text-base text-black`}>{date.getDate()}</Text>
                    </View>
                    {idx < uniqueGrades.length - 1 && <View style={tw`h-full w-[1px] bg-gray-300`} />}
                  </View>
                );
              })}
            </View>
            {/* Row 3: Оценка */}
            <View style={tw`flex-row items-center mt-1`}>
              <Text style={tw`w-16 text-xs text-gray-500 mr-2`}>Оценка</Text>
              {uniqueGrades.map((grade, idx) => (
                <View key={grade.id} style={tw`flex-row items-center`}>
                  <View style={[tw`w-20 items-center justify-center rounded-md py-1`, { backgroundColor: getGradeColor(grade) + '22' }]}> 
                    <Text style={tw`text-base text-black`}>{grade.value}</Text>
                  </View>
                  {idx < uniqueGrades.length - 1 && <View style={tw`h-full w-[1px] bg-gray-300`} />}
                </View>
              ))}
            </View>
            {/* Row 4: Label (РК1, РК2, Экзамен) — без разделителей, строго под оценками */}
            <View style={tw`flex-row items-center mt-1`}>
              {uniqueGrades.map((grade) => {
                let label = '';
                if (grade.type === 'midterm' && grade.date >= '2025-03-03' && grade.date <= '2025-03-09') label = 'РК1';
                else if (grade.type === 'midterm' && grade.date >= '2025-04-21' && grade.date <= '2025-04-27') label = 'РК2';
                else if (grade.type === 'exam') label = 'Экзамен';
                return (
                  <View key={grade.id} style={tw`w-20 h-8 items-center justify-center`}>
                    <Text style={tw`text-xs text-black text-center`}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 