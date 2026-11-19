import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const FAQ = [
  {
    q: 'Как восстановить пароль?',
    a: 'Перейдите в раздел "Настройки" и выберите "Сменить пароль". Следуйте инструкциям.'
  },
  {
    q: 'Как связаться с эдвайзером?',
    a: 'Контакт эдвайзера указан в разделе "Личные данные". Вы также можете написать ему на университетскую почту.'
  },
  {
    q: 'Как посмотреть расписание?',
    a: 'Откройте вкладку "Календарь" в нижнем меню приложения.'
  },
  {
    q: 'Как подать заявление на пересдачу?',
    a: 'Обратитесь в учебный офис или воспользуйтесь разделом "Задолженности".'
  },
];

export default function HelpScreen() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigation = useNavigation<any>();

  const handleContact = (type: 'email' | 'phone' | 'telegram') => {
    if (type === 'email') Linking.openURL('mailto:support@almau.edu.kz');
    if (type === 'phone') Linking.openURL('tel:+77273334455');
    if (type === 'telegram') Linking.openURL('https://t.me/almau_support');
  };

  const handleFeedback = () => {
    navigation.navigate('ChatRoomScreen', { chatId: 'support', name: 'Техподдержка AlmaU', initials: 'AL' });
  };

  const handlePolicy = () => {
    Linking.openURL('https://almau.edu.kz/privacy-policy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <Icon name="help-circle-outline" size={28} color="#1C1C1E" style={{ marginRight: 10 }} />
          <Text style={styles.title}>Помощь</Text>
        </View>

        {/* FAQ */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>FAQ</Text>
          {FAQ.map((item, i) => (
            <View key={i} style={styles.faqItem}>
              <TouchableOpacity style={styles.faqQ} onPress={() => setOpenFaq(openFaq === i ? null : i)}>
                <Text style={styles.faqQText}>{item.q}</Text>
                <Icon name={openFaq === i ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color="#B3B3B3" />
              </TouchableOpacity>
              {openFaq === i && <Text style={styles.faqA}>{item.a}</Text>}
            </View>
          ))}
        </View>

        {/* Контакты */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Контакты поддержки</Text>
          <TouchableOpacity style={styles.contactRow} onPress={() => handleContact('email')}>
            <Icon name="mail-outline" size={20} color="#1C1C1E" style={styles.contactIcon} />
            <Text style={styles.contactText}>support@almau.edu.kz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactRow} onPress={() => handleContact('phone')}>
            <Icon name="call-outline" size={20} color="#1C1C1E" style={styles.contactIcon} />
            <Text style={styles.contactText}>+7 (727) 333-44-55</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactRow} onPress={() => handleContact('telegram')}>
            <Icon name="paper-plane-outline" size={20} color="#1C1C1E" style={styles.contactIcon} />
            <Text style={styles.contactText}>@almau_support</Text>
          </TouchableOpacity>
        </View>

        {/* Инструкция */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Инструкция по использованию</Text>
          <View style={styles.guideRow}><Icon name="calendar-outline" size={20} color="#1C1C1E" style={styles.guideIcon} /><Text style={styles.guideText}>Календарь — расписание занятий и событий</Text></View>
          <View style={styles.guideRow}><Icon name="book-outline" size={20} color="#1C1C1E" style={styles.guideIcon} /><Text style={styles.guideText}>Журнал оценок — все ваши оценки по предметам</Text></View>
          <View style={styles.guideRow}><Icon name="person-outline" size={20} color="#1C1C1E" style={styles.guideIcon} /><Text style={styles.guideText}>Профиль — личные и академические данные</Text></View>
          <View style={styles.guideRow}><Icon name="settings-outline" size={20} color="#1C1C1E" style={styles.guideIcon} /><Text style={styles.guideText}>Настройки — смена пароля, почты, телефона</Text></View>
        </View>

        {/* Обратная связь */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Обратная связь</Text>
          <TouchableOpacity style={styles.feedbackBtn} onPress={handleFeedback}>
            <Icon name="chatbubble-ellipses-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.feedbackText}>Сообщить о проблеме</Text>
          </TouchableOpacity>
        </View>

        {/* Политика конфиденциальности */}
        <View style={styles.block}>
          <TouchableOpacity style={styles.policyRow} onPress={handlePolicy}>
            <Icon name="document-text-outline" size={20} color="#1C1C1E" style={styles.contactIcon} />
            <Text style={styles.policyText}>Политика конфиденциальности</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  block: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 18, shadowColor: '#1C1C1E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 2 },
  blockTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 10 },
  faqItem: { marginBottom: 10 },
  faqQ: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQText: { fontSize: 15, color: '#1C1C1E', fontWeight: '500' },
  faqA: { fontSize: 14, color: '#666', marginTop: 6, marginLeft: 4 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  contactIcon: { marginRight: 10 },
  contactText: { fontSize: 15, color: '#1C1C1E' },
  guideRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  guideIcon: { marginRight: 10 },
  guideText: { fontSize: 15, color: '#1C1C1E' },
  feedbackBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, justifyContent: 'center', marginTop: 6 },
  feedbackText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  policyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  policyText: { fontSize: 15, color: '#1C1C1E', textDecorationLine: 'underline', marginLeft: 4 },
}); 