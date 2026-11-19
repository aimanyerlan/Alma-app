import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'exam' | 'grade' | 'absence' | 'performance' | 'schedule' | 'survey' | 'general';
  date: string;
  isRead: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  sendExamReminder: (examName: string, date: string, time: string, platform?: string) => void;
  sendGradeNotification: (subject: string, grade: number, type: string) => void;
  sendAbsenceNotification: (subject: string, date: string) => void;
  sendLowPerformanceWarning: (subject: string, averageGrade: number) => void;
  sendScheduleChangeNotification: (subject: string, oldTime: string, newTime: string) => void;
  sendSurveyNotification: (surveyName: string) => void;
  requestPermissions: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
    // Загружаем начальные уведомления
    loadInitialNotifications();
  }, []);

  const loadInitialNotifications = () => {
    const initialNotifications: NotificationItem[] = [
      {
        id: '1',
        title: 'Экзамен по стартапу',
        message: '11.07.2025 вам назначен экзамен по стартапу',
        type: 'exam',
        date: '2024-12-10',
        isRead: false,
        data: { examDate: '2025-07-11', subject: 'Стартап' }
      },
      {
        id: '2',
        title: 'Экзамен по русскому языку',
        message: '14.07.2025 экзамен по русскому языку на платформе мудл',
        type: 'exam',
        date: '2024-12-09',
        isRead: false,
        data: { examDate: '2025-07-14', subject: 'Русский язык', platform: 'Мудл' }
      },
      {
        id: '3',
        title: 'Анкета',
        message: 'Вам назначена анкета',
        type: 'survey',
        date: '2024-12-08',
        isRead: false,
        data: { surveyName: 'Анкета студента' }
      },
      {
        id: '4',
        title: 'Новая оценка',
        message: 'Вам выставлена оценка по Анализу данных',
        type: 'grade',
        date: '2024-12-07',
        isRead: false,
        data: { subject: 'Анализ данных', grade: 85, type: 'midterm' }
      },
      {
        id: '5',
        title: 'Новое домашнее задание',
        message: 'Добавлено новое домашнее задание по Математике. Срок сдачи: 15.12.2024',
        type: 'general',
        date: '2024-12-06',
        isRead: false,
        data: { subject: 'Математика', deadline: '2024-12-15', type: 'homework' }
      }
    ];
    setNotifications(initialNotifications);
  };

  const addNotification = (notification: Omit<NotificationItem, 'id' | 'isRead'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const requestPermissions = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Необходимы разрешения для получения уведомлений!');
      return false;
    }
    
    return true;
  };

  const sendExamReminder = async (examName: string, date: string, time: string, platform?: string) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const message = platform 
      ? `${date} экзамен по ${examName} на платформе ${platform}`
      : `${date} вам назначен экзамен по ${examName}`;

    addNotification({
      title: `Экзамен по ${examName}`,
      message,
      type: 'exam',
      date: new Date().toISOString().split('T')[0],
      data: { examDate: date, subject: examName, platform }
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Напоминание об экзамене',
        body: message,
        data: { type: 'exam_reminder', examName, date, time, platform },
      },
      trigger: {
        seconds: 3600, // За 1 час до экзамена
      },
    });
  };

  const sendGradeNotification = async (subject: string, grade: number, type: string) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    addNotification({
      title: 'Новая оценка',
      message: `Вам выставлена оценка по ${subject}`,
      type: 'grade',
      date: new Date().toISOString().split('T')[0],
      data: { subject, grade, type }
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Новая оценка',
        body: `${subject}: ${grade}% (${type})`,
        data: { type: 'new_grade', subject, grade, gradeType: type },
      },
      trigger: null, // Немедленное уведомление
    });
  };

  const sendAbsenceNotification = async (subject: string, date: string) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    addNotification({
      title: 'Пропуск занятия',
      message: `Пропуск занятия по ${subject} - ${date}`,
      type: 'absence',
      date: new Date().toISOString().split('T')[0],
      data: { subject, date }
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Пропуск занятия',
        body: `${subject} - ${date}`,
        data: { type: 'absence', subject, date },
      },
      trigger: null,
    });
  };

  const sendLowPerformanceWarning = async (subject: string, averageGrade: number) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    addNotification({
      title: 'Низкая успеваемость',
      message: `${subject}: средний балл ${averageGrade}%`,
      type: 'performance',
      date: new Date().toISOString().split('T')[0],
      data: { subject, averageGrade }
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Низкая успеваемость',
        body: `${subject}: средний балл ${averageGrade}%`,
        data: { type: 'low_performance', subject, averageGrade },
      },
      trigger: null,
    });
  };

  const sendScheduleChangeNotification = async (subject: string, oldTime: string, newTime: string) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    addNotification({
      title: 'Изменение расписания',
      message: `${subject}: ${oldTime} → ${newTime}`,
      type: 'schedule',
      date: new Date().toISOString().split('T')[0],
      data: { subject, oldTime, newTime }
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Изменение расписания',
        body: `${subject}: ${oldTime} → ${newTime}`,
        data: { type: 'schedule_change', subject, oldTime, newTime },
      },
      trigger: null,
    });
  };

  const sendSurveyNotification = async (surveyName: string) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    addNotification({
      title: 'Анкета',
      message: `Вам назначена анкета: ${surveyName}`,
      type: 'survey',
      date: new Date().toISOString().split('T')[0],
      data: { surveyName }
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📋 Новая анкета',
        body: `Вам назначена анкета: ${surveyName}`,
        data: { type: 'survey', surveyName },
      },
      trigger: null,
    });
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    sendExamReminder,
    sendGradeNotification,
    sendAbsenceNotification,
    sendLowPerformanceWarning,
    sendScheduleChangeNotification,
    sendSurveyNotification,
    requestPermissions,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Необходимы разрешения для получения уведомлений!');
    return;
  }

  try {
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Замените на ваш projectId
    })).data;
  } catch (error) {
    console.log('Error getting push token:', error);
  }

  return token;
} 