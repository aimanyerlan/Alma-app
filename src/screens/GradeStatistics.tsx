import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useGradeBook } from '../contexts/GradeBookContext';
import { useMemo } from 'react';

const GRADE_SCALE = [
  { letter: 'A', value: 4, percent: 95, trad: 5 },
  { letter: 'A-', value: 3.67, percent: 90, trad: 5 },
  { letter: 'B+', value: 3.33, percent: 85, trad: 4 },
  { letter: 'B', value: 3, percent: 80, trad: 4 },
  { letter: 'B-', value: 2.67, percent: 75, trad: 4 },
  { letter: 'C+', value: 2.33, percent: 70, trad: 3 },
  { letter: 'C', value: 2, percent: 65, trad: 3 },
  { letter: 'C-', value: 1.67, percent: 60, trad: 3 },
  { letter: 'D+', value: 1.33, percent: 55, trad: 2 },
  { letter: 'D', value: 1, percent: 50, trad: 2 },
  { letter: 'FX', value: 0.5, percent: 25, trad: 2 },
  { letter: 'F', value: 0, percent: 0, trad: 2 },
];

export default function GradeStatisticsScreen() {
  const { gradeBookData, calculateOverallGpa, calculateSemesterGpa } = useGradeBook();
  // Удаляю переменные student, gpa, totalCredits, passedCredits, allSemesters, функцию getSubjectGradeInfo, секцию Student Info, секцию Семестры/Академические периоды, GPA по периоду

  // --- Статистика по неделям ---
  const weekStart = new Date('2025-01-13');
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weeks = Array.from({ length: 15 }, (_, i) => {
    const start = new Date(weekStart.getTime() + i * weekMs);
    const end = new Date(weekStart.getTime() + (i + 1) * weekMs);
    return { week: i + 1, start, end };
  });
  const allGrades = gradeBookData.semesters.flatMap(s => s.grades);
  const allSubjects = gradeBookData.semesters.flatMap(s => s.subjects);
  const allSchedule = allSubjects.map(subj => {
    // 15 недель * количество занятий в неделе (по расписанию)
    // Для простоты: допустим, 1 занятие в неделю на предмет
    return { subjectId: subj.id, totalLessons: 15 };
  });
  // Для каждого предмета считаем пропуски
  const subjectAbsences = allSubjects.map(subj => {
    const grades = allGrades.filter(g => g.subjectId === subj.id);
    const absences = grades.filter(g => g.isAbsent).length;
    const totalLessons = 15; // можно заменить на реальное количество занятий
    return { subjectId: subj.id, name: subj.name, absences, totalLessons };
  });

  // --- Карточки-алерты ---
  // Риск ретейка
  const retakeAlerts = subjectAbsences.filter(subj => {
    const limit = Math.floor(subj.totalLessons * 0.3);
    return subj.absences === limit - 1;
  });
  // Предметы с низкой средней оценкой за все недели
  const lowAvgSubjects = allSubjects.map(subj => {
    const grades = allGrades.filter(g => g.subjectId === subj.id && typeof g.value === 'number');
    if (!grades.length) return null;
    const avg = grades.reduce((sum, g) => sum + Number(g.value), 0) / grades.length;
    return { name: subj.name, avg };
  }).filter(s => s && s.avg < 50);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-8`}>
        {/* Header */}
        <View style={tw`p-4 border-b border-gray-200`}> 
          <Text style={tw`text-2xl font-bold text-gray-800`}>Статистика по неделям</Text>
        </View>
        {/* --- Карточки-алерты и фильтры --- */}
        <View style={tw`p-4`}> 
          {/* Карточки-алерты */}
          {retakeAlerts.length > 0 && (
            <View style={tw`mb-2 p-3 rounded-xl bg-red-100 border border-red-400 flex-row items-center`}> 
              <Text style={tw`text-red-800 font-bold`}>Внимание! По предмету(ам): {retakeAlerts.map(w => w.name).join(', ')} — ещё один пропуск и будет 30% отсутствий (ретейк)!</Text>
            </View>
          )}
          {lowAvgSubjects.length > 0 && (
            <View style={tw`mb-2 p-3 rounded-xl bg-yellow-100 border border-yellow-400 flex-row items-center`}> 
              <Text style={tw`text-yellow-800 font-bold`}>Средняя оценка ниже 50 по предмету(ам): {lowAvgSubjects.map(s => s!.name).join(', ')}</Text>
            </View>
          )}
        </View>
        {/* --- Статистика по неделям --- */}
        <View style={tw`p-4`}> 
          {weeks.map(({ week, start, end }) => {
            // Оценки и пропуски за неделю
            const gradesInWeek = allGrades.filter(g => {
              const d = new Date(g.date);
              return d >= start && d < end;
            });
            const absences = gradesInWeek.filter(g => g.isAbsent).length;
            const gradesOnly = gradesInWeek.filter(g => typeof g.value === 'number');
            const avg = gradesOnly.length ? (gradesOnly.reduce((sum, g) => sum + Number(g.value), 0) / gradesOnly.length) : null;
            // Предметы с низкой средней
            const subjectWeekStats = allSubjects.map(subj => {
              const subjGrades = gradesInWeek.filter(g => g.subjectId === subj.id && typeof g.value === 'number');
              const subjAvg = subjGrades.length ? (subjGrades.reduce((sum, g) => sum + Number(g.value), 0) / subjGrades.length) : null;
              return { name: subj.name, avg: subjAvg };
            });
            const below50 = subjectWeekStats.filter(s => s.avg !== null && s.avg < 50);
            const below70 = subjectWeekStats.filter(s => s.avg !== null && s.avg < 70 && s.avg >= 50);
            // Предупреждение о 30% пропусков
            const warnings = subjectAbsences.filter(subj => {
              const limit = Math.floor(subj.totalLessons * 0.3);
              return subj.absences === limit - 1;
            });
            return (
              <View key={week} style={tw`mb-4 p-3 rounded-xl bg-gray-50 border border-gray-200`}> 
                <Text style={tw`font-bold text-base text-gray-800 mb-1`}>Неделя {week}</Text>
                <Text style={tw`text-xs text-gray-700 mb-1`}>Пропусков: {absences} | Оценок: {gradesOnly.length} | Средняя оценка: {avg !== null ? avg.toFixed(1) : '—'}</Text>
                {below50.length > 0 && (
                  <Text style={tw`text-xs text-red-600 mb-1`}>Средняя оценка ниже 50: {below50.map(s => s.name).join(', ')}</Text>
                )}
                {below70.length > 0 && (
                  <Text style={tw`text-xs text-yellow-600 mb-1`}>Средняя оценка ниже 70: {below70.map(s => s.name).join(', ')}</Text>
                )}
                {warnings.length > 0 && (
                  <Text style={tw`text-xs text-red-700 font-bold`}>Внимание! По предмету(ам): {warnings.map(w => w.name).join(', ')} — ещё один пропуск и будет 30% отсутствий (ретейк)!</Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 