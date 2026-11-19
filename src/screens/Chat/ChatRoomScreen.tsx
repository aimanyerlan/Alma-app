import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ListRenderItem, SafeAreaView, ImageBackground, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, FieldValue, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { RouteProp } from '@react-navigation/native';
import bgImage from '../../../assets/gradient.jpg';

type Message = {
  id: string;
  chatId: string;
  sender: string;
  type: 'text' | 'image' | 'file';
  content: string;
  createdAt: Date | { seconds: number; nanoseconds: number } | FieldValue;
  isRead: boolean;
  fileUrl?: string;
};

const mockMessages: Message[] = [
  { id: '1', chatId: 'advisor', sender: 'student', type: 'text', content: 'Здравствуйте!', createdAt: new Date(Date.now() - 1000 * 60 * 2), isRead: true },
  { id: '2', chatId: 'advisor', sender: 'advisor', type: 'text', content: 'Здравствуйте! Как дела с курсовой?', createdAt: new Date(Date.now() - 1000 * 60), isRead: false },
  { id: '3', chatId: 'advisor', sender: 'student', type: 'image', content: 'https://placekitten.com/200/200', createdAt: new Date(Date.now() - 1000 * 30), isRead: false },
  { id: '4', chatId: 'advisor', sender: 'advisor', type: 'file', content: 'Курсовая.pdf', fileUrl: '', createdAt: new Date(Date.now() - 1000 * 10), isRead: false },
];

const ChatRoomScreen = ({ route, navigation }: any) => {
  const { chatId, name, initials, subject } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    // Важно: для этого запроса нужен индекс Firestore по chatId + createdAt
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }) as Message)
        .filter(msg => msg.createdAt && typeof msg.createdAt === 'object' && 'seconds' in msg.createdAt);
      setMessages(loaded);
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    // Отметить все входящие сообщения как прочитанные при открытии чата
    const markAsRead = async () => {
      const unread = messages.filter(m => m.sender !== 'student' && !m.isRead);
      for (const msg of unread) {
        await updateDoc(doc(db, 'messages', msg.id), { isRead: true });
      }
    };
    if (messages.length > 0) markAsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleDeleteMessage = (id: string) => {
    Alert.alert(
      'Удалить сообщение?',
      'Вы действительно хотите удалить это сообщение?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => actuallyDeleteMessage(id) },
      ]
    );
  };

  const actuallyDeleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось удалить сообщение.');
    }
  };

  const sendMessage = async (type: 'text' | 'image' | 'file', content: string, fileUrl?: string) => {
    const newMsg: Omit<Message, 'id'> = {
      chatId,
      sender: 'student',
      type,
      content,
      fileUrl: fileUrl || '',
      createdAt: serverTimestamp(),
      isRead: false,
    };
    try {
      const docRef = await addDoc(collection(db, 'messages'), newMsg);
      // Обновляем превью чата
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: type === 'text' ? content : (type === 'image' ? 'Фото' : 'Файл'),
        lastMessageTime: serverTimestamp(),
        unread: true,
        unreadCount: 1, // можно доработать для подсчёта
      });
    } catch (e) {
      // Можно добавить обработку ошибки (например, Toast)
    }
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      sendMessage('image', result.assets[0].uri);
    }
  };

  const pickFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      sendMessage('file', result.assets[0].name, result.assets[0].uri);
    }
  };

  const renderMessage: ListRenderItem<Message> = ({ item, index }) => {
    const isMe = item.sender === 'student';
    let myUnreadCount = 0;
    if (isMe && !item.isRead) {
      myUnreadCount = messages
        .slice(0, index + 1)
        .filter(m => m.sender === 'student' && !m.isRead).length;
    }
    return (
      <TouchableOpacity
        onLongPress={() => isMe && handleDeleteMessage(item.id)}
        activeOpacity={0.8}
        style={[styles.messageRow, isMe ? styles.messageRight : styles.messageLeft]}
      >
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          {/* Индикатор только для моих сообщений */}
          {isMe && !item.isRead && (
            <View style={styles.unreadCircle}>
              <Text style={styles.unreadText}>{myUnreadCount}</Text>
            </View>
          )}
          {isMe && item.isRead && (
            <Ionicons name="checkmark-done" size={18} color="#4ade80" style={{ marginRight: 8 }} />
          )}
          {item.type === 'text' && <Text style={styles.messageText}>{item.content}</Text>}
          {item.type === 'image' && (
            <TouchableOpacity onPress={() => {}}>
              <View style={styles.imageMock}><Text>Фото</Text></View>
            </TouchableOpacity>
          )}
          {item.type === 'file' && (
            <TouchableOpacity onPress={() => {}}>
              <View style={styles.fileMock}><Text>{item.content}</Text></View>
            </TouchableOpacity>
          )}
          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  function formatTime(date: Date | { seconds: number; nanoseconds: number } | any): string {
    if (date && typeof date === 'object' && 'seconds' in date) {
      const d = new Date(date.seconds * 1000);
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    }
    if (date instanceof Date) {
      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    }
    // FieldValue (например, serverTimestamp) или неизвестный тип
    return '';
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={bgImage} style={{ flex: 1 }}>
        <View style={styles.headerCard}>
          <View style={styles.headerWrap}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color="#111" />
            </TouchableOpacity>
            <View style={styles.headerAvatar}><Text style={styles.headerAvatarText}>{initials}</Text></View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{name}</Text>
              {subject && (
                <Text style={styles.headerSubtitle}>{subject}</Text>
              )}
            </View>
          </View>
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.inputBarWrap}>
            <TouchableOpacity onPress={pickFile} style={styles.iconBtn}><MaterialIcons name="attach-file" size={26} color="#f59e42" /></TouchableOpacity>
            <TouchableOpacity onPress={pickImage} style={styles.iconBtn}><Ionicons name="image-outline" size={26} color="#2563eb" /></TouchableOpacity>
            <TextInput
              style={styles.inputField}
              value={input}
              onChangeText={setInput}
              placeholder="Сообщение..."
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={() => input.trim() && sendMessage('text', input)} style={styles.sendBtn}>
              <Ionicons name="send" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.75)',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  headerWrap: { flexDirection: 'row', alignItems: 'center', height: 70, paddingHorizontal: 16, backgroundColor: 'transparent' },
  backBtn: { marginRight: 8, padding: 4 },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e0e7ef', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerAvatarText: { fontSize: 18, fontWeight: 'bold', color: '#3b3b3b' },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  container: { flex: 1 },
  messageRow: { flexDirection: 'row', marginBottom: 12 },
  messageLeft: { justifyContent: 'flex-start' },
  messageRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  bubbleMe: { backgroundColor: '#dbeafe', alignSelf: 'flex-end', borderTopRightRadius: 4 },
  bubbleOther: { backgroundColor: '#fff', alignSelf: 'flex-start', borderTopLeftRadius: 4 },
  messageText: { fontSize: 15, color: '#222' },
  timeText: { fontSize: 11, color: '#888', marginTop: 4, alignSelf: 'flex-end' },
  inputBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 8, borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0', paddingHorizontal: 16, fontSize: 15, marginHorizontal: 8 },
  sendBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    padding: 8,
    marginLeft: 4,
  },
  iconBtn: { padding: 4 },
  imageMock: { width: 120, height: 120, backgroundColor: '#e0e7ef', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginVertical: 4 },
  fileMock: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 8, marginVertical: 4 },
  inputBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    marginHorizontal: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    backgroundColor: 'transparent',
    marginHorizontal: 8,
    paddingVertical: 6,
    color: '#222',
  },
  unreadCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F35B5B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  unreadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default ChatRoomScreen; 