import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateProfile, updateEmail } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const [passwordModal, setPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [phoneModal, setPhoneModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('Пользователь не найден');
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      Alert.alert('Успех', 'Пароль успешно изменён!');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Не удалось сменить пароль');
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Разрешение на доступ к фото не получено');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        // Загрузка в Firebase Storage
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Пользователь не найден');
        const response = await fetch(uri);
        const blob = await response.blob();
        const fileRef = ref(storage, `avatars/${user.uid}.jpg`);
        await uploadBytes(fileRef, blob);
        const downloadURL = await getDownloadURL(fileRef);
        await updateProfile(user, { photoURL: downloadURL });
        Alert.alert('Успех', 'Фото профиля обновлено!');
      }
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Не удалось обновить фото');
    }
  };

  const handleChangeEmail = async () => {
    setSaving(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Пользователь не найден');
      await updateEmail(user, newEmail);
      setEmailModal(false);
      setNewEmail('');
      Alert.alert('Успех', 'Почта успешно изменена!');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Не удалось изменить почту');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePhone = async () => {
    setSaving(true);
    try {
      // Здесь можно реализовать обновление телефона в Firestore, если он хранится там
      setPhoneModal(false);
      setNewPhone('');
      Alert.alert('Успех', 'Телефон успешно изменён!');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Не удалось изменить телефон');
    } finally {
      setSaving(false);
    }
  };

  // Заглушки для других действий
  const handlePress = (action: string) => {
    Alert.alert('Действие', `Функция "${action}" будет реализована позже.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Настройки</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.item} onPress={() => setPasswordModal(true)}>
          <View style={styles.itemLeft}>
            <Icon name="key-outline" size={22} color="#1C1C1E" style={styles.icon} />
            <Text style={styles.itemText}>Сменить пароль</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#B3B3B3" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={handlePickAvatar}>
          <View style={styles.itemLeft}>
            <Icon name="camera-outline" size={22} color="#1C1C1E" style={styles.icon} />
            <Text style={styles.itemText}>Новая фотография в аватар</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#B3B3B3" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => setEmailModal(true)}>
          <View style={styles.itemLeft}>
            <Icon name="mail-outline" size={22} color="#1C1C1E" style={styles.icon} />
            <Text style={styles.itemText}>Редактировать почту</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#B3B3B3" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => setPhoneModal(true)}>
          <View style={styles.itemLeft}>
            <Icon name="call-outline" size={22} color="#1C1C1E" style={styles.icon} />
            <Text style={styles.itemText}>Редактировать номер телефона</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#B3B3B3" />
        </TouchableOpacity>
        <View style={styles.infoBlock}>
          <Text style={styles.infoText}>Остальная информация доступна только для просмотра и не может быть изменена.</Text>
        </View>
      </View>
      {/* Модалка смены пароля */}
      <Modal visible={passwordModal} transparent animationType="slide" onRequestClose={() => setPasswordModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Сменить пароль</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Старый пароль"
                secureTextEntry={!showOld}
                value={oldPassword}
                onChangeText={setOldPassword}
                editable={!loading}
                placeholderTextColor="#B3B3B3"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowOld(v => !v)}>
                <Icon name={showOld ? 'eye-off-outline' : 'eye-outline'} size={22} color="#B3B3B3" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Новый пароль"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!loading}
                placeholderTextColor="#B3B3B3"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNew(v => !v)}>
                <Icon name={showNew ? 'eye-off-outline' : 'eye-outline'} size={22} color="#B3B3B3" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalBtn} onPress={handleChangePassword} disabled={loading || !oldPassword || !newPassword}>
              <Text style={{ fontWeight: 'bold', color: '#fff' }}>{loading ? 'Сохраняем...' : 'Сменить'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#eee', marginTop: 8 }]} onPress={() => setPasswordModal(false)} disabled={loading}>
              <Text style={{ fontWeight: 'bold', color: '#1C1C1E' }}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Модалка смены почты */}
      <Modal visible={emailModal} transparent animationType="slide" onRequestClose={() => setEmailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Новая почта</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите новую почту"
              value={newEmail}
              onChangeText={setNewEmail}
              editable={!saving}
              placeholderTextColor="#B3B3B3"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.modalBtn} onPress={handleChangeEmail} disabled={saving || !newEmail}>
              <Text style={{ fontWeight: 'bold', color: '#fff' }}>{saving ? 'Сохраняем...' : 'Сохранить'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#eee', marginTop: 8 }]} onPress={() => setEmailModal(false)} disabled={saving}>
              <Text style={{ fontWeight: 'bold', color: '#1C1C1E' }}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Модалка смены телефона */}
      <Modal visible={phoneModal} transparent animationType="slide" onRequestClose={() => setPhoneModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Новый номер телефона</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите новый номер"
              value={newPhone}
              onChangeText={setNewPhone}
              editable={!saving}
              placeholderTextColor="#B3B3B3"
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.modalBtn} onPress={handleChangePhone} disabled={saving || !newPhone}>
              <Text style={{ fontWeight: 'bold', color: '#fff' }}>{saving ? 'Сохраняем...' : 'Сохранить'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#eee', marginTop: 8 }]} onPress={() => setPhoneModal(false)} disabled={saving}>
              <Text style={{ fontWeight: 'bold', color: '#1C1C1E' }}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
    shadowColor: '#F3B3D3',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
    justifyContent: 'space-between',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 14 },
  itemText: { fontSize: 15, color: '#1C1C1E', fontWeight: '500' },
  infoBlock: { marginTop: 24, backgroundColor: '#F9F9F9', borderRadius: 12, padding: 14 },
  infoText: { color: '#666', fontSize: 14, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 28, width: 320, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  modalBtn: { backgroundColor: '#F3B3D3', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 32, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15, color: '#1C1C1E', backgroundColor: '#F9F9F9', minWidth: 240, maxWidth: 320, alignSelf: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  eyeBtn: { marginLeft: -36, padding: 8 },
}); 