import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Picker } from '@react-native-picker/picker';

const categories = [
  { key: '', label: 'Все категории', icon: 'apps-outline' },
  { key: 'силлабус', label: 'Силлабус', icon: 'document-text-outline' },
  { key: 'библиотека', label: 'Библиотека', icon: 'library-outline' },
  { key: 'презентации', label: 'Презентации', icon: 'easel-outline' },
  { key: 'ссылки', label: 'Ссылки', icon: 'link-outline' },
  { key: 'лекции', label: 'Лекции', icon: 'school-outline' },
];

const folders = [
  { id: '1', subject: 'Модуль социально-политических знаний', count: 7, type: 'силлабус', color: ['#B4C5F5', '#8EC5FC'] },
  { id: '2', subject: 'Введение в программирование и алгоритмы', count: 12, type: 'лекции', color: ['#F5B4B4', '#FFDEE9'] },
  { id: '3', subject: 'Анализ данных в Excel', count: 9, type: 'презентации', color: ['#B4F5D1', '#C2FFD8'] },
  { id: '4', subject: 'Введение в Web-разработку с помощью HTML, CSS, JavaScript', count: 8, type: 'лекции', color: ['#F5E3B4', '#FFF6B7'] },
  { id: '5', subject: 'ИТ-Стартап 1 (Идея/валидация)', count: 6, type: 'силлабус', color: ['#B4C5F5', '#8EC5FC'] },
  { id: '6', subject: 'Казахский (русский) язык 1 (B2)', count: 10, type: 'лекции', color: ['#F5B4B4', '#FFDEE9'] },
  { id: '7', subject: 'Прикладная линейная алгебра', count: 11, type: 'презентации', color: ['#B4F5D1', '#C2FFD8'] },
  { id: '8', subject: 'Дизайн жизни', count: 5, type: 'лекции', color: ['#F5E3B4', '#FFF6B7'] },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.92);
const CARD_HEIGHT = 140;

const TouchableScale = ({ children, onPress, style }: any) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={() => (scale.value = withSpring(0.97))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={onPress}
        style={{ flex: 1 }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const MaterialsScreen = ({ navigation }: { navigation: any }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // Получить уникальные дисциплины
  const subjects = folders.map(f => f.subject);

  // Корректная фильтрация по категории и дисциплине
  const filteredFolders = folders.filter(f =>
    (!selectedCategory || f.type === selectedCategory) &&
    (!selectedSubject || f.subject === selectedSubject)
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F8FC' }}>
      {/* Header */}
      <View style={{ paddingTop: 32, paddingBottom: 12, paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 8, letterSpacing: 0.5 }}>Учебные материалы</Text>
      </View>
      {/* Search */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
        <Icon name="search" size={22} color="#A0A0A0" style={{ marginRight: 8 }} />
        <TextInput
          style={{ flex: 1, fontSize: 16, color: '#222' }}
          placeholder="Поиск по материалам"
          placeholderTextColor="#A0A0A0"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 18, marginBottom: 10, paddingHorizontal: 10 }} contentContainerStyle={{ paddingRight: 8 }}>
        {categories.map((cat, idx) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => setSelectedCategory(cat.key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: selectedCategory === cat.key ? '#E5E7EB' : '#fff',
              borderRadius: 18,
              marginRight: idx === categories.length - 1 ? 0 : 8,
              paddingHorizontal: 12,
              paddingVertical: 7,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
              overflow: 'hidden',
              minWidth: 70,
            }}
          >
            <Icon name={cat.icon} size={15} color="#222" style={{ marginRight: 5 }} />
            <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 13 }}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Выберите дисциплину */}
      <View style={{ marginHorizontal: 20, marginBottom: 10 }}>
        <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>Выберите дисциплину</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' }}>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={setSelectedSubject}
            style={{ height: 44, color: '#222' }}
            dropdownIconColor="#222"
          >
            <Picker.Item label="Все дисциплины" value="" />
            {subjects.map(subj => (
              <Picker.Item key={subj} label={subj} value={subj} />
            ))}
          </Picker>
        </View>
      </View>
      {/* Folders vertical list */}
      <FlatList
        data={filteredFolders}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 8, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <TouchableScale
            onPress={() => {/* переход к материалам дисциплины */}}
            style={{ marginBottom: 26 }}
          >
            <View style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              borderRadius: 28,
              alignSelf: 'center',
              backgroundColor: item.color[0],
              shadowColor: '#000',
              shadowOpacity: 0.10,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
              overflow: 'visible',
              position: 'relative',
            }}>
              {/* Тип материала */}
              <View style={{ position: 'absolute', top: 16, left: 24, zIndex: 3, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                <Icon name="book-outline" size={15} color="#2563EB" style={{ marginRight: 4 }} />
                <Text style={{ color: '#2563EB', fontWeight: '600', fontSize: 13 }}>{item.type}</Text>
              </View>
              {/* QR-иконка */}
              <View style={{ position: 'absolute', top: 12, right: 24, zIndex: 3, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 12, padding: 4 }}>
                <Icon name="qr-code-outline" size={24} color="#2563EB" style={{ opacity: 0.7 }} />
              </View>
              {/* Название дисциплины */}
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', marginLeft: 24, marginRight: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 4, letterSpacing: 0.2 }}>{item.subject}</Text>
              </View>
              {/* Количество курсов/материалов */}
              <View style={{ position: 'absolute', bottom: 18, right: 28, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 2, flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="albums-outline" size={15} color="#2563EB" style={{ marginRight: 4 }} />
                <Text style={{ color: '#2563EB', fontWeight: 'bold', fontSize: 15 }}>{item.count < 10 ? `0${item.count}` : item.count} Courses</Text>
              </View>
          </View>
          </TouchableScale>
        )}
      />
    </SafeAreaView>
  );
};

export default MaterialsScreen; 