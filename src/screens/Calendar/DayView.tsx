import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  findNodeHandle,
  UIManager,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Checkbox, Portal, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, useAnimatedGestureHandler } from 'react-native-reanimated';
import { CalendarEvent } from '../../contexts/CalendarContext';
import SCHEDULE from '../../data/schedule';
dayjs.locale('ru');

const CATEGORY_LIST = [
  { key: 'study', label: 'Учёба', color: '#D7E9C3' },
  { key: 'homework', label: 'Домашние задания', color: '#F3B3D3' },
  { key: 'rk', label: 'РК', color: '#D7C3E9' },
  { key: 'exam', label: 'Экзамены', color: '#C3E9E8' },
  { key: 'holiday', label: 'Праздники', color: '#FFE07D' },
  { key: 'meeting', label: 'Встречи ', color: '#A3D8F4' },
  { key: 'personal', label: 'Личное', color: '#E8C3F3' },
] as const;

type TaskCategory = typeof CATEGORY_LIST[number]['key'];

const CARD_COLORS: Record<TaskCategory, string> = CATEGORY_LIST.reduce((acc, c) => { acc[c.key] = c.color; return acc; }, {} as Record<TaskCategory, string>);
const CATEGORY_LABELS: Record<TaskCategory, string> = CATEGORY_LIST.reduce((acc, c) => { acc[c.key] = c.label; return acc; }, {} as Record<TaskCategory, string>);

// Функции для получения цвета и названия категории
const getCardColor = (type: string): string => {
  if (type in CARD_COLORS) {
    return CARD_COLORS[type as TaskCategory];
  }
  return '#F5F5F7'; // Цвет по умолчанию
};

const getCategoryLabel = (type: string): string => {
  if (type in CATEGORY_LABELS) {
    return CATEGORY_LABELS[type as TaskCategory];
  }
  return 'Без категории'; // Название по умолчанию
};

// Проверка корректности типа
const isValidCategory = (type: string): type is TaskCategory => {
  return CATEGORY_LIST.some(cat => cat.key === type);
};

const WEEK_DAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

interface DayViewProps {
  events: CalendarEvent[];
  selectedDate: string;
  onAddEvent: (newEvent: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
  onDateChange: (date: string) => void;
}

type SortedEvent = {
  idx: number;
  type: 'task' | 'schedule';
  originalType: string;
  id: number | string;
  date: string;
  title: string;
  time: string;
  endTime?: string;
  category?: string;
  done?: boolean;
  description?: string;
};

const getSortedItems = (events: CalendarEvent[], date: string): SortedEvent[] => {
  const all = events.filter(e => e.date === date).map((item, idx) => ({ 
    ...item, 
    idx, 
    type: 'task' as 'task',
    originalType: item.type // Сохраняем оригинальный тип
  }));
  all.sort((a, b) => {
    const [ah, am] = a.time.split(':').map(Number);
    const [bh, bm] = b.time.split(':').map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });
  return all;
};

export default function DayView({ events, selectedDate, onAddEvent, onUpdateEvent, onDeleteEvent, onDateChange }: DayViewProps) {
  const today = dayjs();
  const [weekOffset, setWeekOffset] = useState(0); // смещение недели относительно текущей
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState<Omit<CalendarEvent, 'id'> & { endTime: string }>({
    title: '',
    date: selectedDate,
    time: '12:00',
    endTime: '13:00',
    type: 'personal',
  });
  // DateTimePicker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Для скроллеров даты и времени
  const currentYear = today.year();
  const years = [currentYear, currentYear + 1, currentYear + 2];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = (year: number, month: number) => Array.from({ length: dayjs(`${year}-${month}-01`).daysInMonth() }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Парсим дату и время для скроллеров
  const [selYear, selMonth, selDay] = newTask.date.split('-').map(Number);
  const [startHour, startMinute] = newTask.time.split(':').map(Number);
  const [endHour, endMinute] = newTask.endTime.split(':').map(Number);

  // Обновление даты через скроллеры
  const updateDate = (y: number, m: number, d: number) => {
    const newDate = dayjs(`${y}-${m}-${d}`).format('YYYY-MM-DD');
    setNewTask((nt: typeof newTask) => ({ ...nt, date: newDate }));
  };
  // Обновление времени через скроллеры
  const updateTime = (h: number, m: number, isEnd = false) => {
    const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    setNewTask((nt: typeof newTask) => isEnd ? { ...nt, endTime: val } : { ...nt, time: val });
  };

  // Горизонтальный список дней недели (от ПН до ВС для выбранной недели)
  const base = today.add(weekOffset, 'week');
  const weekStart = base.startOf('week').add(1, 'day'); // ПН
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));

  // Функция для получения дня недели
  const getWeekDay = (dateStr: string) => {
    const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    const d = dayjs(dateStr);
    return days[d.day()];
  };

  // Занятия из расписания для выбранного дня недели
  const scheduleLessons = SCHEDULE.filter(l => l.day === getWeekDay(selectedDate));

  // Список задач на выбранный день (сначала расписание, потом пользовательские задачи)
  const allCards = [
    ...scheduleLessons.map((item, idx) => ({
      id: `schedule-${item.start}`,
      type: 'schedule' as 'schedule',
      title: item.subject,
      time: item.start,
      endTime: item.end,
      category: undefined,
      done: false,
      description: undefined,
      originalType: 'schedule',
      idx,
      date: selectedDate,
    })),
    ...getSortedItems(events, selectedDate)
  ];

  // Добавление новой задачи
  const handleAddTask = () => {
    if (!newTask.title || !newTask.time || !newTask.endTime) {
      return;
    }
    
    // Проверяем корректность типа и устанавливаем 'personal' по умолчанию если тип некорректный
    const validType = isValidCategory(newTask.type) ? newTask.type : 'personal';
    
    const newEvent = {
      title: newTask.title,
      date: newTask.date,
      time: newTask.time,
      endTime: newTask.endTime,
      type: validType,
      category: getCategoryLabel(validType), // Добавляем категорию
      done: false,
    };
    
    onAddEvent(newEvent);
    setNewTask({ title: '', date: selectedDate, time: '12:00', endTime: '13:00', type: 'personal' });
    setModalVisible(false);
  };

  // Удаление задачи
  const handleDeleteTask = (idx: number) => {
    const event = allCards[idx];
    if (event && event.type === 'task' && typeof event.id === 'string') {
      onDeleteEvent(event.id);
    }
  };

  // Переключение чекбокса
  const handleToggleDone = (idx: number) => {
    const event = allCards[idx];
    if (event && event.type === 'task' && typeof event.id === 'string') {
      onUpdateEvent(event.id, { done: !event.done });
    }
  };

  // Date/time picker handlers
  const handleDateChange = (event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      setNewTask((nt: typeof newTask) => ({ ...nt, date: dayjs(selected).format('YYYY-MM-DD') }));
    }
  };
  const handleStartTimeChange = (event: any, selected?: Date) => {
    console.log('handleStartTimeChange', { 
      eventType: event?.type, 
      selected, 
      selectedISO: selected?.toISOString(),
      selectedTime: selected ? dayjs(selected).format('HH:mm') : null,
      nativeEvent: event?.nativeEvent
    });
    setShowStartTimePicker(false);
    
    // Проверяем, есть ли timestamp в nativeEvent
    if (event?.nativeEvent?.timestamp) {
      const timestamp = event.nativeEvent.timestamp;
      const date = new Date(timestamp);
      const timeString = dayjs(date).format('HH:mm');
      console.log('Using timestamp, setting start time to:', timeString);
      setNewTask((nt: typeof newTask) => ({ ...nt, time: timeString }));
    } else if (selected) {
      const timeString = dayjs(selected).format('HH:mm');
      console.log('Using selected date, setting start time to:', timeString);
      setNewTask((nt: typeof newTask) => ({ ...nt, time: timeString }));
    }
  };
  const handleEndTimeChange = (event: any, selected?: Date) => {
    console.log('handleEndTimeChange', { 
      eventType: event?.type, 
      selected, 
      selectedISO: selected?.toISOString(),
      selectedTime: selected ? dayjs(selected).format('HH:mm') : null,
      nativeEvent: event?.nativeEvent
    });
    setShowEndTimePicker(false);
    
    // Проверяем, есть ли timestamp в nativeEvent
    if (event?.nativeEvent?.timestamp) {
      const timestamp = event.nativeEvent.timestamp;
      const date = new Date(timestamp);
      const timeString = dayjs(date).format('HH:mm');
      console.log('Using timestamp, setting end time to:', timeString);
      setNewTask((nt: typeof newTask) => ({ ...nt, endTime: timeString }));
    } else if (selected) {
      const timeString = dayjs(selected).format('HH:mm');
      console.log('Using selected date, setting end time to:', timeString);
      setNewTask((nt: typeof newTask) => ({ ...nt, endTime: timeString }));
    }
  };

  const sheetTranslateY = useSharedValue(0);
  const MAX_TRANSLATE = 540;
  const CLOSE_THRESHOLD = 120;

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_: any, ctx: any) => {
      ctx.startY = sheetTranslateY.value;
    },
    onActive: (event: any, ctx: any) => {
      sheetTranslateY.value = Math.max(0, ctx.startY + event.translationY);
    },
    onEnd: (event: any) => {
      if (event.translationY > CLOSE_THRESHOLD) {
        runOnJS(setModalVisible)(false);
        sheetTranslateY.value = withSpring(0);
      } else {
        sheetTranslateY.value = withSpring(0);
      }
    },
  });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const descriptionInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const handleDescriptionFocus = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  return (
    <View style={styles.container}>
      {/* Горизонтальный список дней недели с прокруткой и стрелками */}
      <View style={styles.weekScrollRow}>
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={() => setWeekOffset(weekOffset - 1)}
        >
          <Icon name="chevron-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekScrollContainer}
        >
          {daysOfWeek.map((d, idx) => {
            const dStr = d.format('YYYY-MM-DD');
            const isSelected = dStr === selectedDate;
            return (
              <TouchableOpacity
                key={dStr}
                style={[styles.weekDay, isSelected && styles.selectedWeekDay, { marginHorizontal: 6 }]}
                onPress={() => {
                  onDateChange(dStr);
                  setNewTask((nt: typeof newTask) => ({ ...nt, date: dStr }));
                }}
              >
                <Text style={[styles.weekDayText, isSelected && styles.selectedWeekDayText]}>{WEEK_DAYS[d.day() === 0 ? 6 : d.day() - 1]}</Text>
                <Text style={[styles.weekDayNum, isSelected && styles.selectedWeekDayText]}>{d.format('D')}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={() => setWeekOffset(weekOffset + 1)}
        >
          <Icon name="chevron-right" size={28} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      {/* Список задач и расписания */}
      <ScrollView style={styles.listScroll} contentContainerStyle={{ paddingBottom: 100 }}>
        {allCards.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 32 }}>Нет задач и расписания на этот день</Text>
        )}
        {allCards.map((card: SortedEvent, i: number) => (
          <View key={`task-${card.id}`} style={styles.itemRow}>
            <View style={styles.timeCol}>
              <Text style={styles.timeText}>{card.time}</Text>
            </View>
            <View style={[
              styles.card,
              card.originalType === 'schedule' ? { backgroundColor: '#F5F5F7', borderLeftWidth: 4, borderLeftColor: '#A3D8F4' } : { backgroundColor: getCardColor(card.originalType) }
            ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {card.originalType !== 'schedule' && (
                  <View style={{ marginRight: 8 }}>
                    <Checkbox
                      status={card.done ? 'checked' : 'unchecked'}
                      onPress={() => handleToggleDone(i)}
                      color="#1C1C1E"
                      uncheckedColor="#1C1C1E"
                    />
                  </View>
                )}
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                  <Text style={[styles.cardTitle, { textAlign: 'left' }, card.done && { textDecorationLine: 'line-through', opacity: 0.5 }]}>{card.title}</Text>
                  {!!card.description && card.originalType !== 'schedule' && <Text style={[styles.cardSubtitle, { textAlign: 'left' }]}>{card.description}</Text>}
                  {card.originalType !== 'schedule' && <Text style={[styles.cardCategory, { alignSelf: 'flex-start', marginTop: 8 }]}>{card.category || getCategoryLabel(card.originalType)}</Text>}
                </View>
                {card.originalType !== 'schedule' && (
                  <TouchableOpacity onPress={() => handleDeleteTask(i)}>
                    <Icon name="delete-outline" size={22} color="#1C1C1E" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Task Button */}
      <TouchableOpacity style={styles.addButtonGreen} onPress={() => setModalVisible(true)}>
        <Icon name="plus" size={22} color="#1C1C1E" style={{ marginRight: 8 }} />
        <Text style={{ color: '#1C1C1E', fontWeight: 'bold', fontSize: 18 }}>Новая задача</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ width: '100%', flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
              >
                <PanGestureHandler onGestureEvent={gestureHandler}>
                  <Animated.View style={[styles.modalContent, { paddingHorizontal: 20, paddingBottom: 32 }]}> 
                    <View style={{ maxHeight: 540 }}>
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                      >
                        <Text style={{ fontWeight: '600', fontSize: 22, letterSpacing: 0.2, marginBottom: 18, color: '#1C1C1E', textAlign: 'center', marginTop: 24, fontFamily: 'System' }}>Новая задача</Text>
                        {/* Дата */}
                        <TouchableOpacity
                          style={[styles.inputBox, { marginBottom: 12 }]}
                          onPress={() => setShowDatePicker(true)}
                        >
                          <Icon name="calendar" size={20} color="#1C1C1E" style={{ marginRight: 8 }} />
                          <Text style={{ fontSize: 17, color: '#1C1C1E', fontFamily: 'System' }}>{dayjs(newTask.date).format('DD.MM.YYYY')}</Text>
                        </TouchableOpacity>
                        {/* Время начала и конца */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                          {/* Начало */}
                          <TouchableOpacity
                            style={[styles.inputBox, { flex: 1, marginRight: 8 }]}
                            onPress={() => setShowStartTimePicker(true)}
                          >
                            <Icon name="clock-outline" size={20} color="#1C1C1E" style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: 17, color: '#1C1C1E', fontFamily: 'System' }}>{newTask.time}</Text>
                          </TouchableOpacity>
                          {/* Конец */}
                          <TouchableOpacity
                            style={[styles.inputBox, { flex: 1 }]}
                            onPress={() => setShowEndTimePicker(true)}
                          >
                            <Icon name="clock-outline" size={20} color="#1C1C1E" style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: 17, color: '#1C1C1E', fontFamily: 'System' }}>{newTask.endTime}</Text>
                          </TouchableOpacity>
                        </View>
                        {/* Pickers */}
                        {showDatePicker && (
                          <DateTimePicker
                            value={dayjs(newTask.date).toDate()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                            maximumDate={dayjs().add(2, 'year').toDate()}
                          />
                        )}
                        {showStartTimePicker && (
                          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, margin: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>Выберите время начала</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                              <Picker
                                selectedValue={parseInt(newTask.time.split(':')[0])}
                                style={{ width: 100 }}
                                onValueChange={(itemValue: number) => {
                                  const [_, minutes] = newTask.time.split(':');
                                  const newTime = `${itemValue.toString().padStart(2, '0')}:${minutes}`;
                                  setNewTask((nt: typeof newTask) => ({ ...nt, time: newTime }));
                                }}
                              >
                                {Array.from({ length: 24 }, (_, i) => (
                                  <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                                ))}
                              </Picker>
                              <Text style={{ fontSize: 20, alignSelf: 'center' }}>:</Text>
                              <Picker
                                selectedValue={parseInt(newTask.time.split(':')[1])}
                                style={{ width: 100 }}
                                onValueChange={(itemValue: number) => {
                                  const [hours, _] = newTask.time.split(':');
                                  const newTime = `${hours}:${itemValue.toString().padStart(2, '0')}`;
                                  setNewTask((nt: typeof newTask) => ({ ...nt, time: newTime }));
                                }}
                              >
                                {Array.from({ length: 60 }, (_, i) => (
                                  <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                                ))}
                              </Picker>
                            </View>
                            <TouchableOpacity
                              style={{ backgroundColor: '#9FE88D', padding: 10, borderRadius: 8, marginTop: 10 }}
                              onPress={() => setShowStartTimePicker(false)}
                            >
                              <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Готово</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        {showEndTimePicker && (
                          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, margin: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>Выберите время окончания</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                              <Picker
                                selectedValue={parseInt(newTask.endTime.split(':')[0])}
                                style={{ width: 100 }}
                                onValueChange={(itemValue: number) => {
                                  const [_, minutes] = newTask.endTime.split(':');
                                  const newTime = `${itemValue.toString().padStart(2, '0')}:${minutes}`;
                                  setNewTask((nt: typeof newTask) => ({ ...nt, endTime: newTime }));
                                }}
                              >
                                {Array.from({ length: 24 }, (_, i) => (
                                  <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                                ))}
                              </Picker>
                              <Text style={{ fontSize: 20, alignSelf: 'center' }}>:</Text>
                              <Picker
                                selectedValue={parseInt(newTask.endTime.split(':')[1])}
                                style={{ width: 100 }}
                                onValueChange={(itemValue: number) => {
                                  const [hours, _] = newTask.endTime.split(':');
                                  const newTime = `${hours}:${itemValue.toString().padStart(2, '0')}`;
                                  setNewTask((nt: typeof newTask) => ({ ...nt, endTime: newTime }));
                                }}
                              >
                                {Array.from({ length: 60 }, (_, i) => (
                                  <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i} />
                                ))}
                              </Picker>
                            </View>
                            <TouchableOpacity
                              style={{ backgroundColor: '#9FE88D', padding: 10, borderRadius: 8, marginTop: 10 }}
                              onPress={() => setShowEndTimePicker(false)}
                            >
                              <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Готово</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        {/* Название */}
                        <View style={styles.inputBox}>
                          <Icon name="format-title" size={20} color="#1C1C1E" style={{ marginRight: 8 }} />
                          <TextInput
                            style={[styles.input, { fontSize: 17, fontFamily: 'System', textAlign: 'left' }]}
                            placeholder="Название задачи"
                            placeholderTextColor="#aaa"
                            value={newTask.title}
                            onChangeText={t => setNewTask({ ...newTask, title: t })}
                            onFocus={handleDescriptionFocus}
                          />
                        </View>
                        {/* Описание */}
                        <View style={styles.inputBox}>
                          <Icon name="text" size={20} color="#1C1C1E" style={{ marginRight: 8 }} />
                          <TextInput
                            style={[styles.input, { fontSize: 17, fontFamily: 'System', textAlign: 'left' }]}
                            placeholder="Описание (необязательно)"
                            placeholderTextColor="#aaa"
                            value={newTask.description || ''}
                            onChangeText={t => setNewTask({ ...newTask, description: t })}
                            onFocus={handleDescriptionFocus}
                            multiline
                          />
                        </View>
                        {/* Категории */}
                        <View style={{ marginVertical: 8 }}>
                          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#1C1C1E' }}>Категория:</Text>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 0, gap: 8 }}
                          >
                            {CATEGORY_LIST.map(cat => (
                              <TouchableOpacity
                                key={cat.key}
                                style={{
                                  backgroundColor: cat.color,
                                  borderWidth: newTask.type === cat.key ? 2 : 0,
                                  borderColor: '#1C1C1E',
                                  borderRadius: 22,
                                  minWidth: 90,
                                  height: 44,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  paddingHorizontal: 16,
                                  flexDirection: 'row',
                                  marginRight: 8,
                                }}
                                onPress={() => setNewTask({ ...newTask, type: cat.key as TaskCategory })}
                              >
                                <Text
                                  style={{ color: '#1C1C1E', fontSize: 16, fontWeight: 'bold', textAlign: 'center', flexShrink: 1 }}
                                  numberOfLines={1}
                                >
                                  {cat.label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                        {/* Кнопки */}
                        <Button
                          mode="contained"
                          onPress={handleAddTask}
                          style={[
                            styles.modalButton,
                                {
                                marginTop: 16,
                                width: '100%',
                                borderRadius: 24,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 12, // ← вместо фиксированной высоты
                                },
                            ]}
                          labelStyle={{ color: '#1C1C1E', fontWeight: 'bold', fontSize: 18 }}
                          buttonColor="#9FE88D"
                          disabled={!newTask.title}
                        >
                          <Icon name="plus" size={22} color="#1C1C1E" style={{ marginRight: 8 }} />
                          Добавить
                        </Button>
                        <Button
                          onPress={() => setModalVisible(false)}
                          style={{ marginTop: 8 }}
                          labelStyle={{ color: '#1C1C1E' }}
                          textColor="#1C1C1E"
                        >
                          Отмена
                        </Button>
                      </ScrollView>
                    </View>
                  </Animated.View>
                </PanGestureHandler>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  weekScrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  weekScrollContainer: {
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    gap: 12,
  },
  weekDay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'transparent',
    marginHorizontal: 6,
  },
  selectedWeekDay: {
    backgroundColor: '#F3B3D3',
  },
  selectedWeekDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  weekDayText: {
    color: '#1C1C1E',
    fontWeight: '500',
    fontSize: 15,
  },
  weekDayNum: {
    color: '#1C1C1E',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
  },
  listScroll: {
    flex: 1,
    paddingHorizontal: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  timeCol: {
    width: 54,
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingTop: 8,
  },
  timeText: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.7,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    color: '#1C1C1E',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'left',
  },
  cardSubtitle: {
    opacity: 0.7,
    fontSize: 13,
    marginTop: 2,
    textAlign: 'left',
  },
  addButtonGreen: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#F3B3D3',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxHeight: 540,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -2 },
    elevation: 12,
    alignSelf: 'center',
  },
  modalButton: {
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
    minHeight: 44,
  },
  input: {
    flex: 1,
    color: '#1C1C1E',
    fontWeight: '500',
    paddingVertical: 10,
    fontFamily: 'System',
  },
  categoryCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  cardCategory: {
    fontSize: 13,
    opacity: 0.7,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
}); 