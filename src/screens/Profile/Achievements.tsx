import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AchievementsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon name="trophy-outline" size={28} color="#F3B3D3" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Достижения</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.achievementCard}>
          <Icon name="trophy" size={32} color="#F3B3D3" style={{ marginBottom: 8 }} />
          <Text style={styles.achievementTitle}>Государственная стипендия</Text>
          <Text style={styles.achievementDate}>2024-2025 учебный год</Text>
          <Text style={styles.achievementDesc}>Назначена за отличную академическую успеваемость и активное участие в жизни университета.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  content: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 24 },
  achievementCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#F3B3D3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 18,
  },
  achievementTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 4, textAlign: 'center' },
  achievementDate: { fontSize: 14, color: '#B3B3B3', marginBottom: 8, textAlign: 'center' },
  achievementDesc: { fontSize: 15, color: '#666', textAlign: 'center' },
}); 