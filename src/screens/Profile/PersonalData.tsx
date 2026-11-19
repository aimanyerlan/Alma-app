import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const almaPink = '#F3B3D3';
const iconColor = '#1C1C1E';

export default function PersonalDataScreen({ route }: { route: any }) {
  const { userData } = route.params;
  const [editVisible, setEditVisible] = useState(false);

  // Для аватара: если нет фото, показываем иконку
  const avatar = userData?.photoUrl;
  const fio = userData?.name || '';
  const [last, first = '', middle = ''] = fio.split(' ');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Личные данные</Text>
        <TouchableOpacity onPress={() => setEditVisible(true)}>
          <Icon name="pencil-outline" size={26} color={iconColor} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0 }} showsVerticalScrollIndicator={false}>
        {/* Аватар + ФИО */}
        <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 28 }}>
          <View style={styles.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
            ) : (
              <Icon name="person" size={60} color="#fff" />
            )}
          </View>
          <Text style={styles.fio}>{fio}</Text>
        </View>

        {/* Образование */}
        <View style={styles.card}>
          <View style={styles.cardTitleRowAligned}>
            <Icon name="book-outline" size={22} color={iconColor} style={styles.cardBlockIcon} />
            <Text style={styles.cardTitleBlackAligned}>Образование</Text>
          </View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Программа обучения:</Text><Text style={styles.cardValueBlack}>{userData.specialty}</Text></View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Курс:</Text><Text style={styles.cardValueBlack}>{userData.year} курс</Text></View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Группа:</Text><Text style={styles.cardValueBlack}>{userData.group}</Text></View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Школа:</Text><Text style={styles.cardValueBlack}>{userData.school}</Text></View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Эдвайзер:</Text><Text style={styles.cardValueBlack}>{userData.adviser}</Text></View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Форма обучения:</Text><Text style={styles.cardValueBlack}>{userData.educationType}</Text></View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Год поступления:</Text><Text style={styles.cardValueBlack}>{userData.yearStart}</Text></View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Ожидаемый выпуск:</Text><Text style={styles.cardValueBlack}>{userData.graduationYear}</Text></View>
        </View>

        {/* Контактные данные */}
        <View style={styles.card}>
          <View style={styles.cardTitleRowAligned}>
            <Icon name="mail-outline" size={22} color={iconColor} style={styles.cardBlockIcon} />
            <Text style={styles.cardTitleBlackAligned}>Контактные данные</Text>
          </View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Университетская почта:</Text><Text style={styles.cardValueBlack}>{userData.email}</Text></View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Личный телефон:</Text><Text style={styles.cardValueBlack}>{userData.phone}</Text></View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Адрес проживания:</Text><Text style={styles.cardValueBlack}>{userData.address || 'г Алматы'}</Text></View>
        </View>

        {/* Дополнительно */}
        <View style={styles.card}>
          <View style={styles.cardTitleRowAligned}>
            <Icon name="ellipsis-horizontal-outline" size={22} color={iconColor} style={styles.cardBlockIcon} />
            <Text style={styles.cardTitleBlackAligned}>Дополнительно</Text>
          </View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Дата рождения:</Text><Text style={styles.cardValueBlack}>{userData.birthDate ? userData.birthDate.split('-').reverse().join('.') : ''}</Text></View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Гражданство:</Text><Text style={styles.cardValueBlack}>{userData.citizenship}</Text></View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Язык обучения:</Text><Text style={styles.cardValueBlack}>{userData.language}</Text></View>
          <View style={styles.cardRow}><Text style={styles.cardLabelGray}>Стипендия:</Text><Text style={styles.cardValueBlack}>{userData.scholarship}</Text></View>
        </View>
      </ScrollView>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  avatarWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: almaPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#F3B3D3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    resizeMode: 'cover',
  },
  fio: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#F3B3D3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: almaPink,
    marginBottom: 10,
  },
  cardTitleBlack: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 10,
    marginLeft: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardBlockIcon: {
    marginRight: 2,
  },
  cardTitleBlackAligned: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginLeft: 8,
    marginTop: -2,
    marginBottom: 0,
  },
  cardTitleRowAligned: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 7,
  },
  icon: {
    marginRight: 10,
    width: 26,
    textAlign: 'center',
  },
  cardLabel: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
    minWidth: 120,
  },
  cardLabelGray: {
    fontSize: 15,
    color: '#B3B3B3',
    fontWeight: '500',
    marginBottom: 0,
  },
  cardValue: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
    flexShrink: 1,
  },
  cardValueBlack: {
    fontSize: 15,
    color: '#1C1C1E',
    alignSelf: 'flex-start',
    width: '100%',
    marginLeft: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modalBtn: {
    backgroundColor: almaPink,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 8,
  },
}); 