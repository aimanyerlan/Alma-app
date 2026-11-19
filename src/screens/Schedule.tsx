import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { fetchSchedule } from '../api/schedule';

const DAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
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
const COLORS = ['#A3D8F4', '#F3B3D3', '#D7E9C3', '#FFE07D', '#D7C3E9', '#C3E9E8', '#E8C3F3', '#F3B3D3'];
const hourHeight = 60;
const HOURS = Array.from({ length: 17 }, (_, i) => 6 + i); // 6:00 - 22:00

// Обновляем расписание с указанием семестра
const SCHEDULE = [
  { semester: 1, day: 'ПН', start: '16:20', end: '17:10', subject: "ИТ-Стартап 1 (Идея/валидация), 'КЧ'", teacher: 'Самбетова М.Е.', location: 'Основной корпус, A203', color: '#A3D8F4' },
  { semester: 1, day: 'ПН', start: '17:20', end: '18:10', subject: "ИТ-Стартап 1 (Идея/валидация), 'КЧ'", teacher: 'Самбетова М.Е.', location: 'Основной корпус, A203', color: '#A3D8F4' },
  { semester: 1, day: 'ПН', start: '18:20', end: '19:09', subject: "ИТ-Стартап 1 (Идея/валидация), 'КЧ'", teacher: 'Самбетова М.Е.', location: 'Основной корпус, A203', color: '#A3D8F4' },

  // ВТ
  { semester: 1, day: 'ВТ', start: '08:00', end: '08:50', subject: "Введение в программирование и алгоритмы, 'КЧ'", teacher: 'Адильжан А.М.', location: '(онлайн занятие)', color: '#F3B3D3' },
  { semester: 1, day: 'ВТ', start: '09:00', end: '09:50', subject: "Введение в программирование и алгоритмы, 'КЧ'", teacher: 'Адильжан А.М.', location: '(онлайн занятие)', color: '#F3B3D3' },
  { semester: 1, day: 'ВТ', start: '14:20', end: '15:10', subject: "Модуль социально-политических знаний (Культурология/Психология), 'КЧ'", teacher: 'Абдрахманова Б.Ж.', location: 'Основной корпус, 235', color: '#FFE07D' },
  { semester: 1, day: 'ВТ', start: '15:20', end: '16:10', subject: "Модуль социально-политических знаний (Культурология/Психология), 'КЧ'", teacher: 'Абдрахманова Б.Ж.', location: 'Основной корпус, 235', color: '#FFE07D' },
  { semester: 1, day: 'ВТ', start: '16:20', end: '17:10', subject: "Модуль социально-политических знаний (Культурология/Психология), 'КЧ'", teacher: 'Абдрахманова Б.Ж.', location: 'Основной корпус, 203', color: '#FFE07D' },

  // ЧТ
  { semester: 1, day: 'ЧТ', start: '12:10', end: '13:00', subject: "Прикладная линейная алгебра, 'КЧ'", teacher: 'Нугуманов Н.И.', location: 'Основной корпус, 412', color: '#C3E9E8' },
  { semester: 1, day: 'ЧТ', start: '13:10', end: '14:00', subject: "Прикладная линейная алгебра, 'КЧ'", teacher: 'Нугуманов Н.И.', location: 'Основной корпус, 412', color: '#C3E9E8' },
  { semester: 1, day: 'ЧТ', start: '14:20', end: '15:10', subject: "Введение в Web-разработку с помощью HTML, CSS, JavaScript, 'КЧ'", teacher: 'Базарбеков И.М.', location: 'Основной корпус, 309', color: '#A3D8F4' },
  { semester: 1, day: 'ЧТ', start: '15:20', end: '16:10', subject: "Введение в Web-разработку с помощью HTML, CSS, JavaScript, 'КЧ'", teacher: 'Базарбеков И.М.', location: 'Основной корпус, A401', color: '#A3D8F4' },

  // ПТ
  { semester: 1, day: 'ПТ', start: '10:00', end: '10:50', subject: "Введение в программирование и алгоритмы, 'КЧ'", teacher: 'Адильжан А.М.', location: 'Основной корпус, 230', color: '#F3B3D3' },
  { semester: 1, day: 'ПТ', start: '16:20', end: '17:10', subject: "Модуль социально-политических знаний (Культурология/Психология), 'КЧ'", teacher: 'Абдрахманова Б.Ж.', location: 'Основной корпус, 235', color: '#FFE07D' },
  { semester: 1, day: 'ПТ', start: '17:20', end: '18:10', subject: "Модуль социально-политических знаний (Культурология/Психология), 'КЧ'", teacher: 'Абдрахманова Б.Ж.', location: 'Основной корпус, 202', color: '#FFE07D' },
  { semester: 1, day: 'ПТ', start: '18:20', end: '19:09', subject: "Модуль социально-политических знаний (Культурология/Психология), 'КЧ'", teacher: 'Абдрахманова Б.Ж.', location: 'Основной корпус, 202', color: '#FFE07D' },

  // СБ
  { semester: 1, day: 'СБ', start: '08:00', end: '08:50', subject: "Казахский (русский) язык 1 (В2), 'КЧ'", teacher: 'Джубанова Г.Д.', location: 'Основной корпус, A403', color: '#E8C3F3' },
  { semester: 1, day: 'СБ', start: '09:00', end: '09:50', subject: "Казахский (русский) язык 1 (В2), 'КЧ'", teacher: 'Джубанова Г.Д.', location: 'Основной корпус, A403', color: '#E8C3F3' },
  { semester: 1, day: 'СБ', start: '10:00', end: '10:50', subject: "Казахский (русский) язык 1 (В2), 'КЧ'", teacher: 'Джубанова Г.Д.', location: 'Основной корпус, A403', color: '#E8C3F3' },
  { semester: 1, day: 'СБ', start: '11:10', end: '12:00', subject: "Анализ данных в Excel, 'КЧ'", teacher: 'Төрахмет М.Ғ.', location: 'Основной корпус, A201', color: '#D7E9C3' },
  { semester: 1, day: 'СБ', start: '12:10', end: '13:00', subject: "Анализ данных в Excel, 'КЧ'", teacher: 'Төрахмет М.Ғ.', location: 'Основной корпус, A201', color: '#D7E9C3' },
  { semester: 1, day: 'СБ', start: '14:00', end: '14:50', subject: "Модуль социально-политических знаний (Культурология/Психология), 'КЧ'", teacher: 'Абдрахманова Б.Ж.', location: 'Основной корпус, 203', color: '#FFE07D' },
  { semester: 1, day: 'СБ', start: '15:00', end: '15:50', subject: "Модуль социально-политических знаний (Культурология/Психология), 'КЧ'", teacher: 'Абдрахманова Б.Ж.', location: 'Основной корпус, 203', color: '#FFE07D' },
];

export default function ScheduleScreen() {
  const [activeSemester, setActiveSemester] = useState(1);
  const [activeDay, setActiveDay] = useState('ПН');
  const [schedule, setSchedule] = useState<any[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchSchedule().then(setSchedule);
  }, []);

  // Фильтрация и сортировка занятий по времени
  const lessons = schedule
    .filter(l => l.semester === activeSemester && l.day === activeDay)
    .sort((a, b) => {
      const [ah, am] = a.start.split(':').map(Number);
      const [bh, bm] = b.start.split(':').map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      
      {/* Основной контент */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Фиксированная панель с днями недели и семестрами */}
        <View style={{ width: 56, backgroundColor: '#22223B', borderTopRightRadius: 24, borderBottomRightRadius: 24, marginVertical: 16, marginLeft: 0, marginRight: 8 }}>
          <ScrollView 
            style={{ flex: 1 }} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center', paddingVertical: 16 }}
          >
            {/* Дни недели сверху */}
            {DAYS.map((d, i) => (
              <TouchableOpacity
                key={d}
                onPress={() => setActiveDay(d)}
                style={{
                  width: 40,
                  height: 40,
                  marginVertical: 2,
                  borderRadius: 12,
                  backgroundColor: activeDay === d ? '#F3B3D3' : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{d[0]}</Text>
              </TouchableOpacity>
            ))}
            
            {/* Разделитель */}
            <View style={{ width: 30, height: 2, backgroundColor: '#F3B3D3', marginVertical: 8, borderRadius: 1 }} />
            
            {/* Семестры снизу */}
            {SEMESTERS.map((semester) => (
              <TouchableOpacity
                key={semester.id}
                onPress={() => setActiveSemester(semester.id)}
                style={{
                  width: 40,
                  height: 40,
                  marginVertical: 2,
                  borderRadius: 12,
                  backgroundColor: activeSemester === semester.id ? '#F3B3D3' : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                  {semester.id}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Список занятий с временем */}
        <ScrollView style={{ flex: 1, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Заголовок с информацией о семестре и дне */}
          <View style={tw`mb-4 px-4`}>
            <Text style={tw`text-lg font-bold text-[#0A0A0A] mb-1`}>
              {SEMESTERS.find(s => s.id === activeSemester)?.name} • {activeDay}
            </Text>
            <Text style={tw`text-sm text-gray-500`}>
              {lessons.length} занятий
            </Text>
          </View>

          {lessons.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 64 }}>
              <Text style={{ color: '#aaa', fontSize: 18 }}>Нет занятий</Text>
            </View>
          ) : (
            lessons.map((l, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                {/* Время */}
                <View style={{ width: 56, alignItems: 'flex-end', justifyContent: 'center', height: 68 }}>
                  <Text style={{ color: '#888', fontSize: 15, fontWeight: 'bold' }}>{l.start}</Text>
                </View>
                {/* Карточка */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: l.color,
                    borderRadius: 16,
                    padding: 16,
                    minHeight: 68,
                    justifyContent: 'center',
                    marginLeft: 8,
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1C1C1E', flexWrap: 'wrap' }}>{l.subject}</Text>
                  <Text style={{ color: '#1C1C1E', fontSize: 13, marginTop: 2, flexWrap: 'wrap' }}>{l.location}</Text>
                  <Text style={{ color: '#1C1C1E', fontSize: 12, marginTop: 2 }}>{l.start} — {l.end}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
} 