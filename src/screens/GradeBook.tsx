import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useGradeBook } from '../contexts/GradeBookContext';
import GradeCalculator from '../components/GradeCalculator';
import { useNotifications } from '../contexts/NotificationContext';

const SEMESTERS = [
  { id: 1, name: '1 семестр' },
  { id: 2, name: '2 семестр' },
  { id: 3, name: '3 семестр' },
  { id: 4, name: '4 семестр' },
  { id: 5, name: '5 семестр' },
  { id: 6, name: '6 семестр' },
  { id: 7, name: '7 семестр' },
  { id: 8, name: '8 семестр' },
];

export default function GradeBookScreen({ navigation }: { navigation: any }) {
  const { 
    gradeBookData, 
    currentSemester, 
    setCurrentSemester, 
    calculateSubjectGpa,
    calculateSemesterGpa,
    getGradeColor,
    calculateOverallGpa,
    loadingGrades,
    gradesError
  } = useGradeBook();

  const currentSemesterData = gradeBookData.semesters.find(s => s.semester === currentSemester);
  const semesterGpa = calculateSemesterGpa(currentSemester);

  const getGpaColor = (gpa: number) => {
    if (gpa >= 3.5) return '#10B981';
    if (gpa >= 3.0) return '#059669';
    if (gpa >= 2.5) return '#F59E0B';
    if (gpa >= 2.0) return '#F97316';
    return '#EF4444';
  };

  const [modalVisible, setModalVisible] = useState(false);
  const { sendGradeNotification } = useNotifications();

  function getGradeLabel(score: number) {
    if (score >= 95) return 'A (Отлично, 4.0)';
    if (score >= 90) return 'A- (Отлично, 3.67)';
    if (score >= 85) return 'B+ (Хорошо, 3.33)';
    if (score >= 80) return 'B (Хорошо, 3.0)';
    if (score >= 75) return 'B- (Хорошо, 2.67)';
    if (score >= 70) return 'C+ (Удовлетворительно, 2.33)';
    if (score >= 65) return 'C (Удовлетворительно, 2.0)';
    if (score >= 60) return 'C- (Удовлетворительно, 1.67)';
    if (score >= 55) return 'D+ (Плохо, 1.33)';
    if (score >= 50) return 'D (Плохо, 1.0)';
    return 'F (Неудовлетворительно, 0.0)';
  }

  const handleAddGrade = async (newGrade: any) => {
    try {
      // Отправляем уведомление о новой оценке
      await sendGradeNotification(newGrade.subject, newGrade.value, newGrade.type);
    } catch (error) {
      console.error('Error adding grade:', error);
    }
  };

  // Показываем индикатор загрузки
  if (loadingGrades) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`}>
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#F3B3D3" />
          <Text style={tw`text-gray-600 mt-4 text-lg`}>Загрузка оценок...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Показываем ошибку
  if (gradesError) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`}>
        <View style={tw`flex-1 items-center justify-center px-6`}>
          <Icon name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={tw`text-red-500 text-lg mt-4 text-center`}>{gradesError}</Text>
          <Text style={tw`text-gray-600 text-sm mt-2 text-center`}>
            Проверьте подключение к интернету и попробуйте снова
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}> 
      {/* Header */}
      <View style={tw`flex-row items-center justify-between h-16 px-6 border-b border-gray-200 bg-white`}> 
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-2xl font-bold text-gray-900`}>Журнал оценок</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('GradeStatistics')}
          style={tw`p-2 rounded-full bg-gray-100`}
        >
          <Icon name="analytics-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Выберите семестр и карточки-семестры */}
      <View style={tw`px-0 pt-4 pb-2 bg-gray-50`}> 
        <Text style={tw`text-lg font-bold px-4 mb-3 text-gray-900`}>Выберите семестр</Text>
        <View style={tw`flex-row items-center justify-between px-4`}> 
          {SEMESTERS.map((semester) => (
            <TouchableOpacity
              key={semester.id}
              onPress={() => setCurrentSemester(semester.id)}
              style={tw`flex-1 mx-0.5 py-2 rounded-lg items-center ${
                currentSemester === semester.id 
                  ? 'bg-[#F3B3D3]' 
                  : 'bg-gray-200'
              }`}
            >
              <Text style={tw`text-base font-bold ${currentSemester === semester.id ? 'text-white' : 'text-gray-700'}`}>{semester.id}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Информация о семестре + калькулятор в карточке */}
      <View style={tw`mx-4 mt-4 mb-2 p-4 rounded-2xl bg-white shadow-lg border border-gray-100`}> 
        <View style={tw`flex-row items-center justify-start mb-0`}> 
          <Text style={tw`text-lg text-gray-900`}>{SEMESTERS.find(s => s.id === currentSemester)?.name} GPA:</Text>
          <Text style={tw`text-lg font-bold text-black ml-2`}>{semesterGpa.toFixed(2)}</Text>
        </View>
        <View style={tw`flex-row items-center mt-2`}>
          <Icon name="document-text-outline" size={14} color="#9CA3AF" />
          <Text style={tw`text-xs text-gray-500 ml-1`}>
            {currentSemesterData?.grades.length || 0} оценок загружено из Firestore
          </Text>
        </View>
        {/* Кнопка калькулятора итоговой оценки */}
        <View style={tw`flex-row items-center justify-between mt-4 mb-2`}>
          <Text style={tw`text-lg text-black`}>Калькулятор итоговой оценки</Text>
          <TouchableOpacity
            style={tw`w-12 h-12 rounded-xl bg-[#F3B3D3] items-center justify-center shadow`}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="calculator-outline" size={28} color="#111" />
          </TouchableOpacity>
        </View>
      </View>
      <GradeCalculator visible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* Subjects List */}
      <ScrollView style={tw`flex-1 px-4`} showsVerticalScrollIndicator={false}>
        {currentSemesterData?.subjects.map((subject, index) => {
          const grades = currentSemesterData.grades.filter(g => g.subjectId === subject.id);
          function getFinalScore() {
            const srtek11 = grades.filter(g => (g.type === 'attendance' || g.type === 'seminar') && g.date >= '2025-01-13' && g.date < '2025-03-03');
            const srtek22 = grades.filter(g => (g.type === 'attendance' || g.type === 'seminar') && g.date >= '2025-03-10' && g.date < '2025-04-14');
            const rk1 = grades.filter(g => g.type === 'midterm' && g.date >= '2025-03-03' && g.date <= '2025-03-09');
            const rk2 = grades.filter(g => g.type === 'midterm' && g.date >= '2025-04-21' && g.date <= '2025-04-27');
            const exam = grades.filter(g => g.type === 'exam' && g.date >= '2025-04-28' && g.date <= '2025-05-11');
            const avg1 = srtek11.length ? srtek11.reduce((a, b) => a + Number(b.value), 0) / srtek11.length : 0;
            const avg2 = srtek22.length ? srtek22.reduce((a, b) => a + Number(b.value), 0) / srtek22.length : 0;
            const rk1avg = rk1.length ? rk1.reduce((a, b) => a + Number(b.value), 0) / rk1.length : 0;
            const rk2avg = rk2.length ? rk2.reduce((a, b) => a + Number(b.value), 0) / rk2.length : 0;
            const examAvg = exam.length ? exam.reduce((a, b) => a + Number(b.value), 0) / exam.length : 0;
            const current = (avg1 + avg2 + rk1avg + rk2avg) / 4;
            const finalScore = current * 0.6 + examAvg * 0.4;
            return finalScore;
          }
          const finalScore = Math.round(getFinalScore());
          const gradeColor = getGradeColor({ value: finalScore, maxValue: 100, id: '', subjectId: '', type: 'exam', weight: 1, date: '', semester: currentSemester });
          
          return (
            <TouchableOpacity
              key={subject.id}
              onPress={() => navigation.navigate('GradeDetail', { subjectId: subject.id })}
              style={tw`mb-4 p-6 rounded-2xl bg-white shadow-lg border border-gray-100`}
            >
              <View style={tw`flex-row items-start justify-between`}>
                <View style={tw`flex-1 mr-4`}>
                  <Text style={tw`text-lg font-bold text-gray-900`} numberOfLines={2}>
                    {subject.name}
                  </Text>
                  {subject.code && (
                    <Text style={tw`text-sm text-gray-500 mt-1`}>
                      {subject.code}
                    </Text>
                  )}
                  <Text style={tw`text-sm text-gray-600 mt-2`}
                    numberOfLines={1} ellipsizeMode="tail">
                    {subject.teacher}
                  </Text>
                  <View style={tw`flex-row items-center mt-3`}>
                    <View style={tw`flex-row items-center mr-3`}>
                      <Icon name="school-outline" size={14} color="#9CA3AF" />
                      <Text style={tw`text-xs text-gray-500 ml-1`}>
                        {subject.credits} кредитов
                      </Text>
                    </View>
                    <View style={tw`px-3 py-1 rounded-full bg-gray-100`}>
                      <Text style={tw`text-xs text-gray-600`}>
                        {subject.type === 'lecture' ? 'Лекция' : 
                         subject.type === 'seminar' ? 'Семинар' : 
                         subject.type === 'lab' ? 'Лабораторная' : 'Практика'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={tw`items-end`}>
                  <View style={tw`items-center`}>
                    <View style={[tw`w-16 h-16 rounded-full items-center justify-center mb-2`, { backgroundColor: gradeColor + '20' }]}> 
                      <Text style={[tw`text-2xl font-bold`, { color: gradeColor }]}>{finalScore}</Text>
                    </View>
                    <Text style={tw`text-xs text-gray-500`}>
                      Итоговая
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
} 