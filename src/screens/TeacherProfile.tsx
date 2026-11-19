import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';

const TeacherProfileScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const teacher = route?.params?.teacher || 'Преподаватель';
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between h-16 px-4`}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1C1C1E' }}>{teacher}</Text>
      </View>
      <View style={tw`items-center mt-8`}>
        <Icon name="person-circle-outline" size={80} color="#2176FF" />
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8, color: '#1C1C1E' }}>{teacher}</Text>
        <Text style={{ color: '#888' }}>Преподаватель AlmaU</Text>
        <Text style={{ marginTop: 16, color: '#1C1C1E' }}>Информация о преподавателе, научные интересы, контакты и расписание консультаций.</Text>
      </View>
    </View>
  );
};

export default TeacherProfileScreen; 