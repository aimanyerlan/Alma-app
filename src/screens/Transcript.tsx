import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useGradeBook } from '../contexts/GradeBookContext';

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

export default function TranscriptScreen() {
  const { gradeBookData, calculateOverallGpa, calculateSemesterGpa } = useGradeBook();
  const student = gradeBookData.studentName;
  const allSemesters = gradeBookData.semesters;
  const gpa = gradeBookData.overallGpa?.toFixed(2) ?? calculateOverallGpa().toFixed(2);
  const totalCredits = allSemesters.reduce((sum, s) => sum + (s.totalCredits ?? 0), 0);
  const passedCredits = allSemesters.reduce((sum, s) => sum + (s.subjects.filter(subj => {
    const grades = s.grades.filter(g => g.subjectId === subj.id);
    const final = grades.find(g => g.type === 'final' || g.type === 'exam');
    if (!final) return false;
    if (typeof final.value === 'string' && final.value.toLowerCase().includes('зачет')) return true;
    if (typeof final.value === 'number' && final.value >= 50) return true;
    return false;
  }).reduce((acc, subj) => acc + (subj.credits ?? 0), 0)), 0);

  const getSubjectGradeInfo = (subj: any) => {
    const grades = gradeBookData.semesters.flatMap(s => s.grades).filter(g => g.subjectId === subj.id);
    const final = grades.find(g => g.type === 'final' || g.type === 'exam');
    let percent = '', letter = '', value = '', trad = '';
    if (final) {
      if (typeof final.value === 'string' && final.value.toLowerCase().includes('зачет')) {
        percent = '';
        letter = '';
        value = '';
        trad = 'зачет';
      } else if (typeof final.value === 'number') {
        percent = final.value.toString();
        const scale = GRADE_SCALE.find(s => typeof final.value === 'number' && final.value >= s.percent) || GRADE_SCALE[GRADE_SCALE.length-1];
        letter = scale.letter;
        value = scale.value.toString();
        trad = scale.trad.toString();
      }
    }
    return { percent, letter, value, trad };
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-8`}>
        <View style={tw`p-4 border-b border-gray-200`}>
          <Text style={tw`text-2xl font-bold text-gray-800`}>Транскрипт</Text>
        </View>
        <View style={tw`p-4 border-b border-gray-200`}>
          <Text style={tw`text-lg font-bold text-gray-700 mb-1`}>{student}</Text>
          <Text style={tw`text-base text-gray-600 mb-1`}>GPA за весь период обучения: {gpa}</Text>
          <Text style={tw`text-base text-gray-600 mb-1`}>Общее количество кредитов: {totalCredits}</Text>
          <Text style={tw`text-base text-gray-600`}>Количество освоенных кредитов: {passedCredits}</Text>
        </View>
        {allSemesters.map((semester, idx) => (
          <View key={semester.semester} style={tw`p-4 border-b border-gray-100`}>
            <Text style={tw`text-lg font-bold mb-2 text-gray-700`}>Академический период {semester.semester}</Text>
            {semester.subjects.length === 0 ? (
              <Text style={tw`text-base text-gray-500 mb-2`}>Нет дисциплин</Text>
            ) : (
              semester.subjects.map((subj, i) => {
                const info = getSubjectGradeInfo(subj);
                return (
                  <View key={subj.id} style={tw`mb-3 p-3 rounded-xl bg-gray-50 border border-gray-200`}>
                    <Text style={tw`font-bold text-base text-gray-800 mb-1`}>{i+1}. {subj.name}{subj.code ? ` (${subj.code})` : ''}</Text>
                    <View style={tw`flex-row flex-wrap items-center`}>
                      <Text style={tw`text-xs text-gray-600 mr-4`}>Код: <Text style={tw`font-bold`}>{subj.code}</Text></Text>
                      <Text style={tw`text-xs text-gray-600 mr-4`}>Кредиты: <Text style={tw`font-bold`}>{subj.credits}</Text></Text>
                      <Text style={tw`text-xs text-gray-600 mr-4`}>%: <Text style={tw`font-bold`}>{info.percent}</Text></Text>
                      <Text style={tw`text-xs text-gray-600 mr-4`}>Букв: <Text style={tw`font-bold`}>{info.letter}</Text></Text>
                      <Text style={tw`text-xs text-gray-600`}>Балл: <Text style={tw`font-bold`}>{info.value}</Text></Text>
                    </View>
                  </View>
                );
              })
            )}
            {semester.subjects.length > 0 && semester.grades.length > 0 ? (
              <Text style={tw`text-base text-green-700 font-bold mt-2`}>GPA за период: {calculateSemesterGpa(semester.semester).toFixed(2)}</Text>
            ) : (
              <Text style={tw`text-base text-gray-400 mt-2`}>Период не освоен</Text>
            )}
          </View>
        ))}
        <View style={tw`p-4`}>
          <Text style={tw`text-lg font-bold mb-2 text-gray-700`}>Шкала оценок</Text>
          {GRADE_SCALE.map((row, i) => (
            <View key={row.letter} style={tw`flex-row justify-between items-center border-b border-gray-100 py-2`}>
              <Text style={tw`w-16 text-xs text-gray-700`}>{row.letter}</Text>
              <Text style={tw`w-16 text-xs text-gray-700`}>{row.value}</Text>
              <Text style={tw`w-20 text-xs text-gray-700`}>{row.percent}</Text>
              <Text style={tw`w-20 text-xs text-gray-700`}>{row.trad}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 