import React, { createContext, useContext, useState } from 'react';
import dayjs from 'dayjs';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Интерфейс для событий календаря
export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  time: string;
  endTime?: string;
  type: 'lesson' | 'rk' | 'exam' | 'custom' | 'study' | 'homework' | 'holiday' | 'meeting' | 'personal';
  category?: string;
  done?: boolean;
  description?: string;
}

// Начальные события на текущую дату и ближайшие дни
const today = dayjs().format('YYYY-MM-DD');
const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
const dayAfterTomorrow = dayjs().add(2, 'day').format('YYYY-MM-DD');

const initialEvents: CalendarEvent[] = [
  { id: '1', date: today, type: 'lesson', title: 'Пара: Математика', time: '09:00' },
  { id: '2', date: today, type: 'rk', title: 'РК по истории', time: '14:00' },
  { id: '3', date: tomorrow, type: 'exam', title: 'Экзамен по физике', time: '11:00' },
  { id: '4', date: dayAfterTomorrow, type: 'personal', title: 'Купить тетрадь', time: '18:00', endTime: '19:00', done: false },
];

// Контекст для календаря
interface CalendarContextType {
  events: CalendarEvent[];
  selectedDate: string;
  activeTab: 'month' | 'day' | 'schedule';
  onAddEvent: (newEvent: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
  onDateChange: (date: string) => void;
  setActiveTab: (tab: 'month' | 'day' | 'schedule') => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

// Провайдер календаря
export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [activeTab, setActiveTab] = useState<'month' | 'day' | 'schedule'>('month');

  // Загрузка задач из Firestore при инициализации
  React.useEffect(() => {
    async function fetchEvents() {
      const snapshot = await getDocs(collection(db, 'calendarEvents'));
      const loaded: CalendarEvent[] = snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id }) as CalendarEvent);
      setEvents([...initialEvents, ...loaded]);
    }
    fetchEvents();
  }, []);

  // Добавление задачи в Firestore
  const onAddEvent = async (newEvent: Omit<CalendarEvent, 'id'>) => {
    const docRef = await addDoc(collection(db, 'calendarEvents'), newEvent);
    setEvents(prevEvents => [...prevEvents, { ...newEvent, id: docRef.id }]);
  };

  const onUpdateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === id ? { ...event, ...updates } : event
      )
    );
  };

  const onDeleteEvent = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
  };

  const onDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const value: CalendarContextType = {
    events,
    selectedDate,
    activeTab,
    onAddEvent,
    onUpdateEvent,
    onDeleteEvent,
    onDateChange,
    setActiveTab,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}; 