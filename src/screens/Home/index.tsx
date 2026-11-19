import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import bgImage from '../../../assets/91f03809711729fb54110b0274950352.jpg';

const NEWS = [
  {
    id: 1,
    title: 'Рубежный контроль 2',
    description: 'Уважаемые студенты, обучающиеся на платформе online.almau.edu.kz! График Рубежного Контроля 2: 📅 Рубежный контроль 2 — с 8 по 13 июля 2025 г.',
  },
  {
    id: 2,
    title: 'AlmaU вошел в топ-10 вузов страны',
    description: 'AlmaU занял 7 место в национальном рейтинге вузов Казахстана.',
  },
  {
    id: 3,
    title: 'Открытие нового корпуса',
    description: 'В кампусе AlmaU открыт современный корпус для IT-специальностей.',
  },
];

const EVENTS = [
  {
    id: 4,
    title: 'День открытых дверей',
    date: '20 июня, 10:00',
    description: 'Приглашаем абитуриентов и родителей познакомиться с AlmaU.',
  },
  {
    id: 5,
    title: 'Концерт студентов',
    date: '25 июня, 18:00',
    description: 'Творческий вечер и выступления лучших коллективов.',
  },
];

export default function HomeScreen() {
  const [tab, setTab] = useState<'news' | 'events'>('news');
  const navigation = useNavigation();
  const data = tab === 'news' ? NEWS : EVENTS;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* Градиентный фон */}
      <ImageBackground source={bgImage} style={{ width: '100%', height: 180 }} resizeMode="cover">
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={{
            position: 'absolute',
            top: 18,
            right: 24,
            zIndex: 10,
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderRadius: 18,
            padding: 6,
          }}
        >
          <Icon name="notifications-outline" size={24} color="#1C1C1E" />
        </TouchableOpacity>
      </ImageBackground>
      {/* Мини-карточка с переключателем */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 16,
        marginHorizontal: 70,
        marginTop: -32,
        marginBottom: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        
        <TouchableOpacity
          onPress={() => setTab('news')}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 18,
            borderRadius: 12,
            backgroundColor: tab === 'news' ? '#F3B3D3' : 'transparent',
            marginRight: 4,
          }}
        >
          <Text style={{ fontWeight: 'bold', color: tab === 'news' ? '#18181B' : '#666', fontSize: 15 }}>Новости</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('events')}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 18,
            borderRadius: 12,
            backgroundColor: tab === 'events' ? '#F3B3D3' : 'transparent',
            marginLeft: 4,
          }}
        >
          <Text style={{ fontWeight: 'bold', color: tab === 'events' ? '#18181B' : '#666', fontSize: 15 }}>Мероприятия</Text>
        </TouchableOpacity>
      </View>
      {/* Остальной контент */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Cards */}
        {data.map(item => (
          <TouchableOpacity
            key={item.id}
            style={{
              marginBottom: 16,
              padding: 16,
              borderRadius: 18,
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 3,
              borderWidth: 0,
              borderColor: 'transparent',
            }}
            onPress={() => (navigation as any).navigate('NewsDetail', { id: item.id })}
            activeOpacity={0.85}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#1C1C1E', marginBottom: 4 }}>{item.title}</Text>
            {'date' in item && typeof item.date === 'string' && (
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{item.date}</Text>
            )}
            <Text style={{ fontSize: 15, color: '#1C1C1E' }} numberOfLines={2}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
} 