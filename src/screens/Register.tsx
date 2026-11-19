import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import almaLogo from '../assets/alma_logo.png';

const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    // Implement the register logic here
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3B3D3' }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Image
            source={almaLogo}
            style={{ width: 200, height: 80, resizeMode: 'contain', marginBottom: 20 }}
          />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1C1C1E', textAlign: 'center' }}>
            Регистрация в AlmaU
          </Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginTop: 8 }}>
            Создайте свой аккаунт
          </Text>
        </View>

        <View style={{ marginBottom: 20 }}>
          <TextInput
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 16,
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#E5E5E5',
              color: '#1C1C1E',
            }}
            placeholder="Имя"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <TextInput
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 16,
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#E5E5E5',
              color: '#1C1C1E',
            }}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <TextInput
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 16,
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#E5E5E5',
              color: '#1C1C1E',
            }}
            placeholder="Пароль"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={{ marginBottom: 30 }}>
          <TextInput
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 16,
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#E5E5E5',
              color: '#1C1C1E',
            }}
            placeholder="Подтвердите пароль"
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: '#F3B3D3',
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 16,
          }}
          onPress={handleRegister}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
            Зарегистрироваться
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Login')}
          style={{ alignItems: 'center' }}
        >
          <Text style={{ color: '#F3B3D3', fontSize: 16 }}>
            Уже есть аккаунт? Войти
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen; 