import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useColorScheme, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useGradeBook } from '../contexts/GradeBookContext';

const GRADE_TYPES = [
  { id: 'attendance', label: 'Посещаемость', icon: 'calendar-outline' },
  { id: 'homework', label: 'Домашнее задание', icon: 'book-outline' },
  { id: 'midterm', label: 'Рубежный контроль', icon: 'document-text-outline' },
  { id: 'final', label: 'Финальный экзамен', icon: 'school-outline' },
  { id: 'project', label: 'Проект', icon: 'folder-outline' },
  { id: 'exam', label: 'Экзамен', icon: 'library-outline' }
];

export default function AddGradeScreen({ navigation, route }: { navigation: any; route: any }) {
  const colorScheme = useColorScheme();
  const { subjectId } = route.params;
  const { gradeBookData, addGrade, getGradeTypeLabel } = useGradeBook();

  const [selectedType, setSelectedType] = useState('');
  const [gradeValue, setGradeValue] = useState('');
  const [maxValue, setMaxValue] = useState('100');
  const [weight, setWeight] = useState('20');
  const [comment, setComment] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const currentSemester = gradeBookData.semesters.find(s => s.semester === 1);
  const subject = currentSemester?.subjects.find(s => s.id === subjectId);

  const handleSubmit = () => {
    if (!selectedType) {
      Alert.alert('Ошибка', 'Выберите тип оценки');
      return;
    }

    if (!gradeValue || !maxValue || !weight) {
      Alert.alert('Ошибка', 'Заполните все обязательные поля');
      return;
    }

    const gradeValueNum = parseFloat(gradeValue);
    const maxValueNum = parseFloat(maxValue);
    const weightNum = parseFloat(weight);

    if (gradeValueNum > maxValueNum) {
      Alert.alert('Ошибка', 'Оценка не может быть больше максимального значения');
      return;
    }

    if (weightNum < 0 || weightNum > 100) {
      Alert.alert('Ошибка', 'Вес должен быть от 0 до 100%');
      return;
    }

    addGrade({
      subjectId,
      type: selectedType as any,
      value: gradeValueNum,
      maxValue: maxValueNum,
      weight: weightNum,
      date,
      comment: comment || undefined,
      semester: 1 // Добавляем обязательное поле semester
    });

    Alert.alert(
      'Успешно',
      'Оценка добавлена',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  if (!subject) {
    return (
      <SafeAreaView style={tw`flex-1 ${colorScheme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-lg ${colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'}`}>
            Предмет не найден
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 ${colorScheme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
      {/* Header */}
      <View style={tw`flex-row items-center h-16 px-4 border-b ${colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-3`}>
          <Icon name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#0A0A0A'} />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'}`}>
          Добавить оценку
        </Text>
      </View>

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {/* Subject Info */}
        <View style={tw`p-4 ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <Text style={tw`text-lg font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'}`}>
            {subject.name}
          </Text>
          <Text style={tw`text-sm ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {subject.code} • {subject.teacher}
          </Text>
        </View>

        {/* Grade Type Selection */}
        <View style={tw`p-4 ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'} mt-2`}>
          <Text style={tw`text-lg font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'} mb-4`}>
            Тип оценки
          </Text>
          <View style={tw`flex-row flex-wrap`}>
            {GRADE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                style={tw`w-[48%] p-4 mb-3 rounded-xl border-2 ${
                  selectedType === type.id
                    ? (colorScheme === 'dark' ? 'border-[#F3B3D3] bg-[#F3B3D3]' : 'border-[#F3B3D3] bg-[#F3B3D3]')
                    : (colorScheme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50')
                }`}
              >
                <View style={tw`items-center`}>
                  <Icon 
                    name={type.icon as any} 
                    size={32} 
                    color={selectedType === type.id 
                      ? (colorScheme === 'dark' ? '#1C1C1E' : '#0A0A0A') 
                      : (colorScheme === 'dark' ? '#fff' : '#666')
                    } 
                  />
                  <Text style={tw`text-sm font-bold mt-2 text-center ${
                    selectedType === type.id 
                      ? (colorScheme === 'dark' ? 'text-[#1C1C1E]' : 'text-[#0A0A0A]') 
                      : (colorScheme === 'dark' ? 'text-white' : 'text-gray-700')
                  }`}>
                    {type.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Grade Details */}
        <View style={tw`p-4 ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'} mt-2`}>
          <Text style={tw`text-lg font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'} mb-4`}>
            Детали оценки
          </Text>

          {/* Grade Value */}
          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'} mb-2`}>
              Оценка *
            </Text>
            <TextInput
              style={tw`p-3 rounded-lg border ${
                colorScheme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-[#0A0A0A]'
              }`}
              placeholder="Введите оценку"
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
              value={gradeValue}
              onChangeText={setGradeValue}
              keyboardType="numeric"
            />
          </View>

          {/* Max Value */}
          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'} mb-2`}>
              Максимальное значение *
            </Text>
            <TextInput
              style={tw`p-3 rounded-lg border ${
                colorScheme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-[#0A0A0A]'
              }`}
              placeholder="100"
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
              value={maxValue}
              onChangeText={setMaxValue}
              keyboardType="numeric"
            />
          </View>

          {/* Weight */}
          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'} mb-2`}>
              Вес в процентах *
            </Text>
            <TextInput
              style={tw`p-3 rounded-lg border ${
                colorScheme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-[#0A0A0A]'
              }`}
              placeholder="20"
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>

          {/* Date */}
          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'} mb-2`}>
              Дата
            </Text>
            <TextInput
              style={tw`p-3 rounded-lg border ${
                colorScheme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-[#0A0A0A]'
              }`}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
              value={date}
              onChangeText={setDate}
            />
          </View>

          {/* Comment */}
          <View style={tw`mb-4`}>
            <Text style={tw`text-sm font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'} mb-2`}>
              Комментарий (необязательно)
            </Text>
            <TextInput
              style={tw`p-3 rounded-lg border ${
                colorScheme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-[#0A0A0A]'
              }`}
              placeholder="Добавьте комментарий к оценке"
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={tw`p-4 ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-t ${colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <TouchableOpacity
          style={tw`bg-[#F3B3D3] py-3 px-6 rounded-xl items-center`}
          onPress={handleSubmit}
        >
          <Text style={tw`text-white font-bold text-lg`}>
            Добавить оценку
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 