import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';

const ExchangeScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between h-16 px-4`}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1C1C1E' }}>Учёба по обмену</Text>
      </View>
      <View style={tw`px-4 mt-6`}>
        <Text style={{ fontSize: 16, color: '#222', marginBottom: 8 }}>AlmaU предоставляет студентам возможность участвовать в программах академического обмена с ведущими университетами мира.</Text>
        <Text style={{ fontSize: 16, color: '#222' }}>Узнайте больше на сайте AlmaU или обратитесь в международный отдел.</Text>
      </View>
    </View>
  );
};

export default ExchangeScreen; 