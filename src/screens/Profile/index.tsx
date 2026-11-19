import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, StyleSheet, Image, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import CentralMenu from '../../components/CentralMenu';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import bgImage from '../../../assets/906646f9dfd28f52595beddc4925d17d.jpg';
import avatarImg from '../../../assets/b47d46c352f28a06157e4a9dbcd688f8.jpg';

const formatFio = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length < 2) return name;
  const [last, first, middle] = parts;
  let fio = last;
  if (first) fio += ` ${first[0]}.`;
  if (middle) fio += `${middle[0]}.`;
  return fio;
};

const academicCards = [
  {
    key: 'transcript',
    label: 'Транскрипт',
    icon: 'document-text-outline',
    screen: 'Transcript',
  },
  {
    key: 'gradebook',
    label: 'Журнал оценок',
    icon: 'book-outline',
    screen: 'GradeBook',
  },
  {
    key: 'gpa',
    label: 'Калькулятор GPA',
    icon: 'calculator-outline',
    screen: 'GpaCalculator',
  },
  {
    key: 'achievements',
    label: 'Достижения',
    icon: 'trophy-outline',
    screen: 'Achievements', // новый экран
  },
  {
    key: 'debts',
    label: 'Задолженности',
    icon: 'alert-circle-outline',
    screen: 'Debts', // новый экран
  },
];

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAcademicOpen, setIsAcademicOpen] = useState(false);
  const [isPersonalOpen, setIsPersonalOpen] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    async function fetchCalendar() {
      setCalendarLoading(true);
      try {
        const docRef = doc(db, 'academicPeriods', '2024-2025');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setCalendarData(docSnap.data());
      } catch (e) {}
      setCalendarLoading(false);
    }
    if (isCalendarOpen && !calendarData) fetchCalendar();
  }, [isCalendarOpen]);

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#F3B3D3" /></View>;
  }

  const iconColor = '#1C1C1E';

  const styles = StyleSheet.create({
    avatarWrap: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#F3B3D3',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    avatarImg: {
      width: '100%',
      height: '100%',
      borderRadius: 50,
    },
    fio: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1C1C1E',
      marginBottom: 8,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      marginHorizontal: 10,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      shadowColor: '#1C1C1E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTitleRowAligned: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    cardTitleBlackAligned: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1C1C1E',
    },
    cardBlockIcon: {
      marginRight: 10,
    },
    cardRow: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    cardLabelGray: {
      fontSize: 14,
      color: '#666',
    },
    cardValueBlack: {
      fontSize: 14,
      fontWeight: '500',
      color: '#1C1C1E',
      marginTop: 2,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
    },
    modalBtn: {
      backgroundColor: '#F3B3D3',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Верхний фон с иконками */}
      <ImageBackground source={bgImage} style={{ width: '100%', height: 240 }} resizeMode="cover">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12 }}>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Icon name="log-out-outline" size={28} color="#fff" />
          </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Icon name="settings-outline" size={28} color="#fff" />
        </TouchableOpacity>
        </View>
      </ImageBackground>
      {/* Белая карточка профиля */}
      <View style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: -120, // было -60
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        marginBottom: 32,
      }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#e0e7ef', justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden' }}>
          <Image source={avatarImg} style={{ width: 80, height: 80, borderRadius: 40 }} />
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 }}>{formatFio(userData?.name)}</Text>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 4 }}>{userData?.schoolShort ? userData.schoolShort : ''}{userData?.year ? `, ${userData.year} курс` : ''}</Text>
      </View>
      {/* Остальной профиль (достижения, меню и т.д.) */}
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Личные данные — сворачиваемый раздел */}
        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 18, marginHorizontal: 18, shadowColor: '#F3B3D3', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 2 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: isPersonalOpen ? 14 : 0 }}
            onPress={() => setIsPersonalOpen(open => !open)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="person-outline" size={24} color="#1C1C1E" style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 16, color: '#1C1C1E', flex: 1 }}>Личные данные</Text>
            </View>
            <Icon name={isPersonalOpen ? 'chevron-up-outline' : 'chevron-down-outline'} size={22} color="#B3B3B3" />
          </TouchableOpacity>
          {isPersonalOpen && (
            <>
              {/* Образование */}
              <View style={{ backgroundColor: 'transparent', padding: 14, borderRadius: 12, marginBottom: 14 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 10 }}>Образование</Text>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Программа обучения:</Text><Text style={styles.cardValueBlack}>{userData?.specialty}</Text></View>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Курс:</Text><Text style={styles.cardValueBlack}>{userData?.year} курс</Text></View>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Группа:</Text><Text style={styles.cardValueBlack}>{userData?.group}</Text></View>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Школа:</Text><Text style={styles.cardValueBlack}>{userData?.school}</Text></View>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Эдвайзер:</Text><Text style={styles.cardValueBlack}>{userData?.adviser}</Text></View>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Форма обучения:</Text><Text style={styles.cardValueBlack}>{userData?.educationType}</Text></View>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Год поступления:</Text><Text style={styles.cardValueBlack}>{userData?.yearStart}</Text></View>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Ожидаемый выпуск:</Text><Text style={styles.cardValueBlack}>{userData?.graduationYear}</Text></View>
              </View>
              {/* Контактные данные */}
              <View style={{ backgroundColor: 'transparent', padding: 14, borderRadius: 12, marginBottom: 14 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 10 }}>Контактные данные</Text>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Университетская почта:</Text><Text style={styles.cardValueBlack}>{userData?.email}</Text></View>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Личный телефон:</Text><Text style={styles.cardValueBlack}>{userData?.phone}</Text></View>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Адрес проживания:</Text><Text style={styles.cardValueBlack}>{userData?.address || 'г Алматы'}</Text></View>
              </View>
              {/* Дополнительно */}
              <View style={{ backgroundColor: 'transparent', padding: 14, borderRadius: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 10 }}>Дополнительно</Text>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Дата рождения:</Text><Text style={styles.cardValueBlack}>{userData?.birthDate ? userData.birthDate.split('-').reverse().join('.') : ''}</Text></View>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Гражданство:</Text><Text style={styles.cardValueBlack}>{userData?.citizenship}</Text></View>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Язык обучения:</Text><Text style={styles.cardValueBlack}>{userData?.language}</Text></View>
                <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}><Text style={styles.cardLabelGray}>Стипендия:</Text><Text style={styles.cardValueBlack}>{userData?.scholarship}</Text></View>
              </View>
            </>
          )}
          {/* Модальное окно редактирования (заглушка) */}
          <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Редактирование данных</Text>
                <Text style={{ color: '#666', marginBottom: 24 }}>Редактирование профиля будет доступно в будущих версиях.</Text>
                <TouchableOpacity style={styles.modalBtn} onPress={() => setEditVisible(false)}>
                  <Text style={{ fontWeight: 'bold', color: '#fff' }}>Закрыть</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {/* Академический календарь — новый аккордеон */}
        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 18, marginHorizontal: 18, shadowColor: '#F3B3D3', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 2 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: isCalendarOpen ? 14 : 0 }}
            onPress={() => setIsCalendarOpen(open => !open)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="calendar-outline" size={24} color="#1C1C1E" style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 16, color: '#1C1C1E', flex: 1 }}>Академический календарь</Text>
            </View>
            <Icon name={isCalendarOpen ? 'chevron-up-outline' : 'chevron-down-outline'} size={22} color="#B3B3B3" />
          </TouchableOpacity>
          {isCalendarOpen && (
            <>
              {calendarLoading && <Text style={{ color: '#888', textAlign: 'center', marginVertical: 12 }}>Загрузка...</Text>}
              {calendarData && calendarData.semesters && calendarData.semesters.map((sem: any, idx: number) => (
                <View key={sem.semester} style={{ backgroundColor: 'transparent', padding: 14, borderRadius: 12, marginBottom: 14 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 10 }}>{sem.name}</Text>
                  <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}>
                    <Text style={styles.cardLabelGray}>Семестр:</Text>
                    <Text style={styles.cardValueBlack}>{sem.semester}</Text>
                  </View>
                  <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}>
                    <Text style={styles.cardLabelGray}>Даты:</Text>
                    <Text style={styles.cardValueBlack}>{sem.start} — {sem.end}</Text>
                  </View>
                  <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}>
                    <Text style={styles.cardLabelGray}>Недели:</Text>
                    <Text style={styles.cardValueBlack}>{sem.weeks}</Text>
                  </View>
                  {sem.midterms && sem.midterms.length > 0 && (
                    <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}>
                      <Text style={styles.cardLabelGray}>Рубежные контроли:</Text>
                      {sem.midterms.map((mt: any, i: number) => (
                        <Text key={i} style={styles.cardValueBlack}>• {mt.name}: {mt.start} — {mt.end}</Text>
                      ))}
                    </View>
                  )}
                  {sem.exam_session && (
                    <View style={{ borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 }}>
                      <Text style={styles.cardLabelGray}>Экзаменационная сессия:</Text>
                      <Text style={styles.cardValueBlack}>{sem.exam_session.start} — {sem.exam_session.end}</Text>
                    </View>
                  )}
                  {sem.holidays && (
                    <View style={{ borderBottomWidth: 0, borderColor: '#E5E7EB', marginBottom: 0 }}>
                      <Text style={styles.cardLabelGray}>Каникулы:</Text>
                      <Text style={styles.cardValueBlack}>{sem.holidays.start} — {sem.holidays.end}</Text>
                    </View>
                  )}
                </View>
              ))}
              {!calendarLoading && (!calendarData || !calendarData.semesters) && <Text style={{ color: '#888', textAlign: 'center', marginVertical: 12 }}>Нет данных</Text>}
            </>
          )}
        </View>

        {/* Menu Items */}
        <View style={{ paddingHorizontal: 20 }}>
          {/* Удалить кнопку перехода на отдельный экран PersonalData */}
          {/* Академическая успеваемость — карточки */}
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 18, shadowColor: '#F3B3D3', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 2 }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: isAcademicOpen ? 14 : 0 }}
              onPress={() => setIsAcademicOpen(open => !open)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="school-outline" size={24} color="#1C1C1E" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 16, color: '#1C1C1E', flex: 1 }}>Академическая успеваемость</Text>
              </View>
              <Icon name={isAcademicOpen ? 'chevron-up-outline' : 'chevron-down-outline'} size={22} color="#B3B3B3" />
            </TouchableOpacity>
            {isAcademicOpen && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {academicCards.map(card => (
                  <View key={card.key} style={{ width: '27%', alignItems: 'center', marginBottom: 10 }}>
                    <TouchableOpacity
                      style={{ width: '100%', aspectRatio: 1.2, backgroundColor: '#B3D5E1', borderRadius: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#F3B3D3', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 }}
                      onPress={() => navigation.navigate(card.screen)}
                      activeOpacity={0.8}
                    >
                      <Icon name={card.icon} size={30} color="#1C1C1E" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 13, color: '#1C1C1E', fontWeight: '500', textAlign: 'center', marginTop: 4 }}>{card.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12 }} onPress={() => navigation.navigate('Help')}>
            <Icon name="help-circle-outline" size={24} color="#222" style={{ marginRight: 16 }} />
            <Text style={{ fontSize: 16, color: '#1C1C1E', flex: 1 }}>Помощь</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen; 