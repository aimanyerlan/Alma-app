import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useGradeBook } from '../contexts/GradeBookContext';

type Subject = { id: string; credits?: number };
type ManualGrades = { [subjectId: string]: number };
type GetFinalGrade = (subjectId: string) => number | null;

function calculateGpa(
  subjects: Subject[],
  manualGrades: ManualGrades,
  getFinalGrade: GetFinalGrade
) {
  let totalPoints = 0;
  let totalCredits = 0;
  for (const subj of subjects) {
    let grade = getFinalGrade(subj.id);
    if (grade === null && manualGrades[subj.id]) {
      const val = Number(manualGrades[subj.id]);
      if (!isNaN(val)) grade = val;
    }
    if (typeof grade === 'number') {
      let points = 0;
      if (grade >= 95) points = 4.0;
      else if (grade >= 90) points = 3.67;
      else if (grade >= 85) points = 3.33;
      else if (grade >= 80) points = 3.0;
      else if (grade >= 75) points = 2.67;
      else if (grade >= 70) points = 2.33;
      else if (grade >= 65) points = 2.0;
      else if (grade >= 60) points = 1.67;
      else if (grade >= 55) points = 1.33;
      else if (grade >= 50) points = 1.0;
      else points = 0.0;
      totalPoints += points * (subj.credits ?? 3);
      totalCredits += subj.credits ?? 3;
    }
  }
  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '-';
}

export default function GpaCalculatorScreen() {
  const { gradeBookData } = useGradeBook();
  const [selectedSemesters, setSelectedSemesters] = useState<number[]>([gradeBookData.semesters[0]?.semester ?? 1]);
  const [manualGrades, setManualGrades] = useState<{ [subjectId: string]: string }>({});
  const [gpa, setGpa] = useState('-');

  const toggleSemester = (semester: number) => {
    setSelectedSemesters(prev =>
      prev.includes(semester)
        ? prev.filter(s => s !== semester)
        : [...prev, semester].sort((a, b) => a - b)
    );
  };

  // Получить предметы выбранных семестров
  const subjects = useMemo(() => {
    return gradeBookData.semesters
      .filter(s => selectedSemesters.includes(s.semester))
      .flatMap(s => s.subjects.map(subj => ({ ...subj, semester: s.semester })));
  }, [gradeBookData, selectedSemesters]);

  function getFinalGrade(subjectId: string): number | null {
    const allGrades = gradeBookData.semesters.flatMap(s => s.grades);
    const grades = allGrades.filter(g => g.subjectId === subjectId);
    const final = grades.find(g => g.type === 'final' || g.type === 'exam');
    if (final && typeof final.value === 'number') return final.value;
    return null;
  }

  // Обработчик кнопки "Рассчитать"
  const handleCalculate = () => {
    const numericManualGrades = Object.fromEntries(
      Object.entries(manualGrades).map(([key, value]) => [key, Number(value)])
    );
    setGpa(calculateGpa(subjects, numericManualGrades, getFinalGrade));
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}> 
      <ScrollView contentContainerStyle={tw`pb-6`}> 
        <Text style={tw`text-xl font-bold text-center mt-4 mb-2`}>Калькулятор GPA</Text>
        {/* Новый стиль выбора семестров */}
        <View style={tw`px-4 py-3 border-b border-gray-200`}> 
          <Text style={tw`text-sm font-bold mb-2`}>Выберите семестры</Text>
          <View style={tw`flex-row items-center justify-between`}> 
            {gradeBookData.semesters.map(s => {
              const isSelected = selectedSemesters.includes(s.semester);
              return (
                <TouchableOpacity
                  key={s.semester}
                  onPress={() => toggleSemester(s.semester)}
                  style={tw`flex-1 mx-1 py-2 rounded-lg items-center ${isSelected ? 'bg-[#F3B3D3]' : 'bg-gray-200'}`}
                >
                  <Text style={tw`text-base font-bold ${isSelected ? 'text-[#0A0A0A]' : 'text-gray-700'}`}>{s.semester}</Text>
        </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={tw`border-t border-gray-200`}/>
        <View style={tw`flex-row px-4 pb-2 border-b border-gray-200 mt-2`}> 
          <Text style={tw`flex-1 font-bold text-xs`}>Предмет</Text>
          <Text style={tw`w-14 font-bold text-xs text-center`}>Кредиты</Text>
          <Text style={tw`w-20 font-bold text-xs text-center`}>Оценка</Text>
      </View>
        {subjects.length === 0 && (
          <Text style={tw`text-center text-gray-400 mt-6`}>Выберите хотя бы один семестр</Text>
        )}
        {subjects.map(subj => {
          const final = getFinalGrade(subj.id);
          const isClosed = final !== null;
          return (
            <View key={subj.id} style={tw`flex-row items-center px-4 py-2 border-b border-gray-100`}> 
              <Text style={tw`flex-1 text-xs`} numberOfLines={2}>{subj.name}</Text>
              <Text style={tw`w-14 text-xs text-center`}>{subj.credits ?? 3}</Text>
              {isClosed ? (
                <Text style={tw`w-20 text-xs text-center text-gray-500`}>{final}</Text>
              ) : (
        <TextInput
                  style={tw`w-20 text-xs text-center border border-gray-300 rounded bg-gray-50 py-1 px-2`}
                  keyboardType="numeric"
                  value={manualGrades[subj.id] ?? ''}
                  onChangeText={v => setManualGrades(mg => ({ ...mg, [subj.id]: v }))}
                  placeholder="..."
                />
              )}
            </View>
          );
        })}
        {/* Кнопка рассчитать */}
        <TouchableOpacity
          style={tw`bg-[#4CAF50] py-3 rounded-lg items-center mx-4 mt-6 mb-2`}
          onPress={handleCalculate}
        >
          <Text style={tw`text-white font-bold text-base`}>Рассчитать</Text>
        </TouchableOpacity>
        <View style={tw`p-4 border-t border-gray-200 bg-gray-50 mt-2 rounded-b-xl`}> 
          <Text style={tw`text-base font-bold text-center`}>Итоговый GPA: <Text style={{ color: '#4CAF50' }}>{gpa}</Text></Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
} 