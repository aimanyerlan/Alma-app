import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Пример данных (в реальном приложении можно получать по id)
const NEWS = [
  {
    id: 1,
    title: 'Тема - Рубежный контроль 2',
    description: `Уважаемые студенты, обучающиеся на платформе online.almau.edu.kz!

График Рубежного Контроля 2:

📅 Рубежный контроль 2 — с 8 по 13 июля 2025 г.

точные даты, время и платформа проведения указаны в приложенном файле.

Во время проведения РК2 будет использоваться прокторинг OES с использованием второй камеры (смартфон), просьба ознакомиться заранее.

Что важно сделать?

✔ Подготовьтесь к рубежному контролю – повторите материалы модуля.
✔ Проверьте расписание экзаменов в личном кабинете online.almau.edu.kz, Platonus и в приложенном файле.
✔ Убедитесь, что у вас нет долгов по заданиям и тестам.

В случае технических проблем пожалуйста заполните форму или обратитесь в поддержку.

💡Если сбой произошел во время или после тестирования, заполните пожалуйста форму https://forms.cloud.microsoft/r/jhFT1AbVnn

В случае подтверждения технической проблемы, вам будет открыта повторная попытка 11 июля 2025 года в Moodle (https://online.almau.edu.kz)

💡Если вы не смогли авторизоваться в Platonus, обратитесь пожалуйста в IT Отдел (329 кабинет) или по контакту ниже:

Милованова Наталья: 
📧 n.milovanova@almau.edu.kz

💡Если вы не смогли зайти в тестирование в Platonus (после авторизации) или в LMS Moodle обратитесь пожалуйста по контактам ниже:

Тимур Акаев: +7 702 777 3724
📧 t.akayev@almau.edu.kz

Артём Евтифеев: +7 747 449 47 38
📧 a.evtifeev@almau.edu.kz

Не откладывайте подготовку на последний момент! Желаем успешной сдачи! 🚀

С уважением,

Управления онлайн-образования AlmaU`,
  },
  {
    id: 2,
    title: 'AlmaU вошел в топ-10 вузов страны',
    description: 'AlmaU занял 7 место в национальном рейтинге вузов Казахстана. Это результат совместной работы студентов, преподавателей и администрации.',
  },
  {
    id: 3,
    title: 'Открытие нового корпуса',
    description: 'В кампусе AlmaU открыт современный корпус для IT-специальностей. Здесь будут проходить занятия, мастер-классы и хакатоны.',
  },
  {
    id: 4,
    title: 'День открытых дверей',
    date: '20 июня, 10:00',
    description: 'Приглашаем абитуриентов и родителей познакомиться с AlmaU. Вас ждут экскурсии, презентации и консультации.',
  },
  {
    id: 5,
    title: 'Концерт студентов',
    date: '25 июня, 18:00',
    description: 'Творческий вечер и выступления лучших коллективов. Не пропустите главное событие июня!',
  },
];

const EVENTS = [
  {
    id: 1,
    title: 'День открытых дверей',
    date: '20 июня, 10:00',
    description: 'Приглашаем абитуриентов и родителей познакомиться с AlmaU. В программе: презентация специальностей, экскурсия по кампусу, встреча с преподавателями.',
    color: '#F0F0F0',
  },
  {
    id: 2,
    title: 'Концерт студентов',
    date: '25 июня, 18:00',
    description: 'Творческий вечер и выступления лучших коллективов. Приглашаем всех желающих на яркое музыкальное представление.',
    color: '#F0F0F0',
  },
];

// Функция для рендера текста с копируемыми ссылками и email
function renderDescription(text: string) {
  // Регулярки для ссылок и email
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

  // Сначала разбиваем по ссылкам
  const parts = text.split(urlRegex);
  let final: (string | { type: 'url', value: string } | { type: 'email', value: string })[] = [];
  parts.forEach(part => {
    if (urlRegex.test(part)) {
      final.push({ type: 'url', value: part });
    } else {
      // Внутри обычного текста ищем email
      const subparts = part.split(emailRegex);
      subparts.forEach(sub => {
        if (emailRegex.test(sub)) {
          final.push({ type: 'email', value: sub });
        } else if (sub) {
          final.push(sub);
        }
      });
    }
  });

  return final.map((part, idx) => {
    if (typeof part === 'string') {
      return <Text key={idx} selectable style={tw`text-base text-[#1C1C1E]`}>{part}</Text>;
    }
    if (part.type === 'url') {
      return (
        <Text
          key={idx}
          selectable
          style={[tw`text-base`, { color: '#2176FF', textDecorationLine: 'underline' }]}
          onPress={() => Linking.openURL(part.value)}
        >
          {part.value}
        </Text>
      );
    }
    if (part.type === 'email') {
      return (
        <Text
          key={idx}
          selectable
          style={[tw`text-base`, { color: '#2176FF', textDecorationLine: 'underline' }]}
          onPress={() => Linking.openURL(`mailto:${part.value}`)}
        >
          {part.value}
        </Text>
      );
    }
    return null;
  });
}

export default function NewsDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: number };
  const item = NEWS.find(n => n.id === id) || EVENTS.find(e => e.id === id);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-lg text-gray-500`}>Новость не найдена</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, flexDirection: 'row', alignItems: 'center', height: 56 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#F3B3D3" />
        </TouchableOpacity>
      </View>
      {/* Card с прокруткой */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[tw`m-4 p-6 rounded-2xl shadow`, { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, marginTop: 0 }]}> 
          <Text style={tw`font-bold text-2xl text-[#1C1C1E] mb-2`}>{item.title}</Text>
          {'date' in item && (
            <Text style={tw`text-xs text-gray-700 mb-2`}>{item.date}</Text>
          )}
          <Text style={tw`text-base text-[#1C1C1E]`}>
            {renderDescription(item.description)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 