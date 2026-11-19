import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, ScrollView, Modal, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import DayView from './DayView';
import { useCalendar, CalendarEvent } from '../../contexts/CalendarContext';
import ScheduleScreen from '../Schedule';
import { useNotifications } from '../../contexts/NotificationContext';
dayjs.locale('ru');

const TABS = [
  { key: 'month', label: 'Месяц' },
  { key: 'day', label: 'День' },
  { key: 'schedule', label: 'Расписание' },
];

// Пример расписания и задач (можно заменить на реальные данные)
const demoSchedule = [
  { id: 1, date: '2024-06-10', subject: 'Математика', timeStart: '09:00', timeEnd: '10:30', teacher: 'Иванова' },
  { id: 2, date: '2024-06-10', subject: 'История', timeStart: '11:00', timeEnd: '12:30', teacher: 'Сидоров' },
];

const eventTypes = [
  { key: 'study', label: 'Учёба', color: '#D7E9C3', icon: 'book-outline' },
  { key: 'work', label: 'Работа', color: '#F3B3D3', icon: 'briefcase-outline' },
  { key: 'rk', label: 'РК', color: '#D7C3E9', icon: 'create-outline' },
  { key: 'exam', label: 'Экзамены', color: '#C3E9E8', icon: 'school-outline' },
  { key: 'holiday', label: 'Праздники / Выходные', color: '#FFE07D', icon: 'sunny-outline' },
  { key: 'meeting', label: 'Встречи / Консультации', color: '#A3D8F4', icon: 'people-outline' },
  { key: 'personal', label: 'Личное', color: '#E8C3F3', icon: 'person-outline' },
];

type EventCategory = typeof eventTypes[number]['key'];

const EVENT_COLORS: Record<EventCategory, string> = eventTypes.reduce((acc, c) => { acc[c.key] = c.color; return acc; }, {} as Record<EventCategory, string>);
const EVENT_ICONS: Record<EventCategory, string> = eventTypes.reduce((acc, c) => { acc[c.key] = c.icon; return acc; }, {} as Record<EventCategory, string>);
const CATEGORY_LABELS: Record<EventCategory, string> = eventTypes.reduce((acc, c) => { acc[c.key] = c.label; return acc; }, {} as Record<EventCategory, string>);

// Функции для получения цвета и названия категории
const getCardColor = (type: string) => {
  const eventType = eventTypes.find(et => et.key === type);
  return eventType ? eventType.color : '#F5F5F7'; // Цвет по умолчанию
};

const getCategoryLabel = (type: string): string => {
  if (type in CATEGORY_LABELS) {
    return CATEGORY_LABELS[type as EventCategory];
  }
  return 'Без категории'; // Название по умолчанию
};

function getMonthMatrix(year: number, month: number) {
  // month: 0-based (0=Jan)
  const firstDay = dayjs(`${year}-${month + 1}-01`);
  const startDay = firstDay.day() === 0 ? 6 : firstDay.day() - 1; // ПН=0, ВС=6
  const daysInMonth = firstDay.daysInMonth();
  const prevMonthDays = startDay;
  const totalCells = Math.ceil((daysInMonth + prevMonthDays) / 7) * 7;
  const matrix = [];
  let day = 1 - prevMonthDays;
  for (let i = 0; i < totalCells / 7; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      week.push(day);
      day++;
    }
    matrix.push(week);
  }
  return matrix;
}

const CalendarScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  console.log('CalendarScreen route.params:', route.params);
  console.log('CalendarScreen route.name:', route.name);
  console.log('CalendarScreen route.key:', route.key);
  
  const colorScheme = useColorScheme();
  const today = dayjs().format('YYYY-MM-DD');
  
  // Используем контекст календаря
  const { events, selectedDate, onAddEvent, onUpdateEvent, onDeleteEvent, onDateChange, activeTab, setActiveTab } = useCalendar();
  const { unreadCount } = useNotifications();

  console.log('Current tab from context:', activeTab);

  // Обрабатываем изменения параметров маршрута
  useEffect(() => {
    console.log('useEffect triggered, route.params:', route.params);
    if (route.params?.initialTab && route.params.initialTab !== activeTab) {
      console.log('Updating tab from params:', route.params.initialTab);
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab, activeTab, setActiveTab]);

  // Проверяем, нужно ли автоматически переключиться на вкладку расписания
  useEffect(() => {
    // Проверяем, пришли ли мы из меню
    const isFromMenu = navigation.getState()?.routes?.some((route: any) => 
      route.name === 'Tabs' && route.params?.screen === 'Calendar'
    );
    
    if (isFromMenu && activeTab === 'month') {
      console.log('Auto-switching to schedule tab from menu');
      setActiveTab('schedule');
    }
  }, [navigation, activeTab, setActiveTab]);

  const current = dayjs(selectedDate);
  const year = current.year();
  const month = current.month();
  const monthMatrix = getMonthMatrix(year, month);
  const monthName = current.format('MMMM YYYY');

  // События на выбранный день
  const dayEvents = events.filter((e: CalendarEvent) => e.date === selectedDate);

  // Для режима "День"
  const weekStart = current.startOf('week').add(1, 'day'); // ПН
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
  const scheduleForDay = demoSchedule.filter(s => s.date === selectedDate);

  return (
    <SafeAreaView style={tw`flex-1 ${colorScheme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between h-16 px-4`}>
        <Text style={tw`text-xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'}`}>Календарь</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ position: 'relative' }}>
          <Icon name="notifications-outline" size={28} color={colorScheme === 'dark' ? '#fff' : '#0A0A0A'} />
          {unreadCount > 0 && (
            <View style={{
              position: 'absolute',
              top: -5,
              right: -5,
              backgroundColor: '#FF3B30',
              borderRadius: 10,
              minWidth: 18,
              height: 18,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: colorScheme === 'dark' ? '#1C1C1E' : '#fff',
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      {/* Tabs */}
      <View style={tw`flex-row justify-center mb-2`}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setActiveTab(t.key as any)}
            style={tw`${activeTab === t.key ? (colorScheme === 'dark' ? 'bg-[#333]' : 'bg-[#F3B3D3]') : ''} px-4 py-2 ${t.key === 'month' ? 'rounded-l' : t.key === 'schedule' ? 'rounded-r' : ''}`}
          >
            <Text style={tw`${activeTab === t.key ? (colorScheme === 'dark' ? 'text-white font-bold' : 'text-[#0A0A0A] font-bold') : (colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-700')}`}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Content */}
      <View style={tw`flex-1 px-2 pt-2`}> 
        {activeTab === 'month' && (
          <ScrollView 
            style={tw`flex-1`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-4`}
          >
            {/* Название месяца и стрелки */}
            <View style={tw`flex-row items-center justify-between mb-2 px-2`}>
              <TouchableOpacity onPress={() => onDateChange(current.subtract(1, 'month').date(1).format('YYYY-MM-DD'))}>
                <Icon name="chevron-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#0A0A0A'} />
              </TouchableOpacity>
              <Text style={tw`text-lg font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'}`}>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</Text>
              <TouchableOpacity onPress={() => onDateChange(current.add(1, 'month').date(1).format('YYYY-MM-DD'))}>
                <Icon name="chevron-forward" size={24} color={colorScheme === 'dark' ? '#fff' : '#0A0A0A'} />
              </TouchableOpacity>
            </View>
            {/* Дни недели */}
            <View style={tw`flex-row justify-between mb-1 px-1`}>
              {["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"].map(d => (
                <Text key={d} style={tw`text-xs font-bold text-center ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{d}</Text>
              ))}
            </View>
            {/* Сетка календаря */}
            <View>
              {monthMatrix.map((week, i) => (
                <View key={i} style={tw`flex-row justify-between mb-1`}>
                  {week.map((day, j) => {
                    const dateObj = dayjs(`${year}-${month + 1}-${day}`);
                    const dateStr = dateObj.format('YYYY-MM-DD');
                    const isCurrentMonth = day > 0 && day <= dayjs(`${year}-${month + 1}-01`).daysInMonth();
                    const isToday = dateStr === today && isCurrentMonth;
                    const isSelected = dateStr === selectedDate && isCurrentMonth;
                    const dayEvents = events.filter((e: CalendarEvent) => e.date === dateStr);
                    return (
                      <TouchableOpacity
                        key={j}
                        disabled={!isCurrentMonth}
                        onPress={() => {
                          onDateChange(dateStr);
                        }}
                        onLongPress={() => {/* TODO: open modal for custom event */}}
                        style={tw`flex-1 aspect-square items-center justify-center mx-0.5 rounded-lg ${isSelected ? (colorScheme === 'dark' ? 'bg-[#F3B3D3]' : 'bg-[#F3B3D3]') : isToday ? (colorScheme === 'dark' ? 'bg-[#333]' : 'bg-gray-200') : ''}`}
                      >
                        <Text style={tw`text-base font-bold ${isCurrentMonth ? (colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]') : 'text-gray-400'}`}>{isCurrentMonth ? day : ''}</Text>
                        {dayEvents.length > 0 && (
                          <View
                            style={[
                              tw`w-2 h-2 rounded-full absolute bottom-1 left-1/2`,
                              { 
                                backgroundColor: getCardColor(dayEvents[0].type),
                                transform: [{ translateX: -4 }] // центрируем точку (половина ширины точки)
                              }
                            ]}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
            {/* События на выбранный день */}
            <View style={tw`flex-row items-center justify-between mt-3 mb-1`}>
              <Text style={tw`text-base font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'}`}>События</Text>
            </View>
            <View style={tw`mb-2`}>
              {dayEvents.length === 0 ? (
                <Text style={tw`text-center text-gray-400`}>Нет событий</Text>
              ) : (
                <View style={tw`flex-row items-start`}>
                  {/* Карточки событий */}
                  <View style={tw`flex-1`}>
                    {dayEvents.map((ev: CalendarEvent) => (
                      <View key={ev.id} style={tw`flex-row items-center bg-[#F6F6F6] rounded-xl px-3 py-2 mb-2 shadow-sm`}>
                        <View style={[tw`w-8 h-8 rounded-full items-center justify-center mr-3`, { backgroundColor: getCardColor(ev.type) }]}>
                          <Icon
                            name={EVENT_ICONS[ev.type as EventCategory]}
                            size={20}
                            color={ev.type === 'holiday' ? '#fff' : '#1C1C1E'}
                          />
                        </View>
                        <View style={tw`flex-1`}>
                          <Text style={tw`font-bold text-base text-[#0A0A0A]`}>{ev.title}</Text>
                          <Text style={tw`text-xs text-gray-500`}>{ev.time}</Text>
                          <Text style={tw`text-xs text-gray-400 mt-1`}>{ev.category || getCategoryLabel(ev.type)}</Text>
                        </View>
                        {(ev.type === 'personal' || ev.type === 'custom') && (
                          <TouchableOpacity onPress={() => onDeleteEvent(ev.id)}>
                            <Icon name="trash-outline" size={20} color="#F87171" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        )}
        {activeTab === 'day' && (
          <DayView 
            events={events}
            selectedDate={selectedDate}
            onAddEvent={onAddEvent}
            onUpdateEvent={onUpdateEvent}
            onDeleteEvent={onDeleteEvent}
            onDateChange={onDateChange}
          />
        )}
        {activeTab === 'schedule' && (
          <ScheduleScreen />
        )}
      </View>
    </SafeAreaView>
  );
};

export default CalendarScreen;
