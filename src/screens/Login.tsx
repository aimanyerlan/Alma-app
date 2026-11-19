import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
};

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigation.replace('Tabs');
    } catch (e) {
      setLoading(false);
      // Можно добавить Alert
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/2.png')}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ width: '100%', alignItems: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ width: 300, marginBottom: 18, marginTop: 220 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#e3e6f5cc', borderRadius: 24, paddingHorizontal: 16, marginBottom: 18, height: 44 }}>
            <Icon name="mail" size={22} color="#a09fc5" style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, fontSize: 16, color: '#333', letterSpacing: 1 }}
              placeholder="Email"
              placeholderTextColor="#7c7b9b"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#e3e6f5cc', borderRadius: 24, paddingHorizontal: 16, height: 44 }}>
            <Icon name="lock-closed" size={22} color="#a09fc5" style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, fontSize: 18, color: '#333', letterSpacing: 6 }}
              placeholder=". . . . . . . ."
              placeholderTextColor="#7c7b9b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
            />
          </View>
        </View>
        <TouchableOpacity
          style={{ backgroundColor: '#f3b3d3', borderRadius: 18, width: 220, height: 38, justifyContent: 'center', alignItems: 'center', marginTop: 8, shadowColor: '#f3b3d3', shadowOpacity: 0.2, shadowRadius: 8 }}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={{ color: '#222', fontSize: 17, fontWeight: '500' }}>{loading ? 'Log in...' : 'Log in'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
} 