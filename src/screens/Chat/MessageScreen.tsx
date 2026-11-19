import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, SafeAreaView, ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../firebase';
import { collection, getDocs, setDoc, doc, onSnapshot, serverTimestamp, query, where } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import bgImage from '../../../assets/alma-logo.jpg';

function formatTime(ts: any) {
  if (!ts) return '';
  if (typeof ts === 'object' && ts.seconds) {
    const date = new Date(ts.seconds * 1000);
    const now = Date.now();
    const diff = Math.floor((now - date.getTime()) / 60000);
    if (diff < 1) return 'только что';
    if (diff < 60) return `${diff} мин назад`;
    return date.toLocaleTimeString().slice(0, 5);
  }
  if (typeof ts === 'string') return ts;
  return '';
}

type Chat = {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string | { seconds: number; nanoseconds: number };
  unread: boolean;
  unreadCount: number;
  initials: string;
  avatar: null | string;
  type?: 'teacher' | 'advisor' | 'support';
  subject?: string;
};

const chatsInitial: Chat[] = [
  {
    id: 'advisor',
    name: 'Эдвайзер Г.Ж.',
    lastMessage: 'Здравствуйте! Как дела с курсовой?',
    lastMessageTime: '2 мин назад',
    unread: true,
    unreadCount: 1,
    initials: 'ГЖ',
    avatar: null,
  },
  {
    id: 'teacher',
    name: 'Преподаватель А.М.',
    lastMessage: 'Жду ваш отчёт до пятницы.',
    lastMessageTime: '10 мин назад',
    unread: false,
    unreadCount: 0,
    initials: 'АМ',
    avatar: null,
  },
  {
    id: 'support',
    name: 'Техподдержка AlmaU',
    lastMessage: 'Ваш запрос принят в работу.',
    lastMessageTime: '1 ч назад',
    unread: true,
    unreadCount: 2,
    initials: 'AL',
    avatar: null,
  },
];

const MessageScreen = () => {
  const navigation = useNavigation<any>();
  const [chats, setChats] = useState<Chat[]>(chatsInitial);
  const [unreadCounts, setUnreadCounts] = useState<{ [chatId: string]: number }>({});

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chatsCol = collection(db, 'chats');
        const snapshot = await getDocs(chatsCol);
        if (snapshot.empty) {
          for (const chat of chatsInitial) {
            await setDoc(doc(db, 'chats', chat.id), {
              ...chat,
              lastMessage: chat.lastMessage,
              lastMessageTime: serverTimestamp(),
              unread: chat.unread,
              unreadCount: chat.unreadCount,
            });
          }
          setChats(chatsInitial);
        } else {
          const loaded = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Chat));
          setChats(loaded);
        }
      } catch (e) {
        setChats(chatsInitial);
      }
    };
    fetchChats();
    const unsub = onSnapshot(collection(db, 'chats'), (snapshot) => {
      const loaded = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Chat));
      setChats(loaded.length ? loaded : chatsInitial);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Подписка на непрочитанные входящие сообщения для каждого чата
    const unsub = onSnapshot(collection(db, 'messages'), (snapshot) => {
      const counts: { [chatId: string]: number } = {};
      snapshot.docs.forEach(docSnap => {
        const msg = docSnap.data();
        if (!msg.isRead && msg.sender !== 'student' && msg.chatId) {
          counts[msg.chatId] = (counts[msg.chatId] || 0) + 1;
        }
      });
      setUnreadCounts(counts);
    });
    return () => unsub();
  }, []);

  const renderItem: ListRenderItem<Chat> = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.chatCard,
        item.type === 'teacher' && styles.teacherChatCard
      ]}
      onPress={() => navigation.navigate('ChatRoomScreen', { 
        chatId: item.id, 
        name: item.name, 
        initials: item.initials,
        subject: item.subject
      } as { chatId: string; name: string; initials: string; subject?: string })}
      activeOpacity={0.85}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatarImg} />
      ) : (
        <View style={[
          styles.avatar,
          item.type === 'teacher' && styles.teacherAvatar
        ]}>
          <Text style={styles.avatarText}>{item.initials}</Text>
        </View>
      )}
      <View style={styles.chatInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text style={styles.name}>{item.name}</Text>
          {item.type === 'teacher' && (
            <Icon name="school-outline" size={14} color="#2563EB" style={{ marginLeft: 4 }} />
          )}
          {unreadCounts[item.id] > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCounts[item.id]}</Text>
            </View>
          )}
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <Text style={styles.time}>{formatTime(item.lastMessageTime)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBgWrap}>
        <Image source={bgImage} style={styles.headerBg} resizeMode="cover" />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Чат</Text>
        </View>
      </View>
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F7FB' },
  headerBgWrap: { height: 180, position: 'relative', marginBottom: 12 },
  headerBg: { position: 'absolute', width: '100%', height: 180, top: 0, left: 0 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 24, paddingTop: 48, height: 180 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111', letterSpacing: 0.5 },
  profileBtn: { padding: 4 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 16 },
  chatCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0e7ef', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarImg: { width: 48, height: 48, borderRadius: 24, marginRight: 14 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#3b3b3b' },
  chatInfo: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#222', marginRight: 8 },
  lastMessage: { fontSize: 14, color: '#666', marginTop: 2 },
  time: { fontSize: 12, color: '#888', marginLeft: 8, alignSelf: 'flex-start' },
  unreadBadge: { backgroundColor: '#F35B5B', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 6, paddingHorizontal: 5 },
  unreadBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  teacherChatCard: { borderLeftWidth: 3, borderLeftColor: '#2563EB' },
  teacherAvatar: { backgroundColor: '#DBEAFE' },
});

export default MessageScreen; 