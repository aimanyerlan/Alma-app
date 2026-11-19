import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DebtsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon name="alert-circle-outline" size={28} color="#F3B3D3" style={{ marginRight: 10 }} />
        <Text style={styles.title}>Задолженности</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.debtCard}>
          <Icon name="alert" size={32} color="#F87171" style={{ marginBottom: 8 }} />
          <Text style={styles.debtTitle}>Физкультура 1</Text>
          <Text style={styles.debtStatus}>Retake · 2024</Text>
          <Text style={styles.debtDesc}>Необходима пересдача по дисциплине "Физкультура 1". Пожалуйста, обратитесь в учебный офис для уточнения сроков пересдачи.</Text>
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
  debtCard: {
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
  debtTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 4, textAlign: 'center' },
  debtStatus: { fontSize: 14, color: '#F87171', marginBottom: 8, textAlign: 'center', fontWeight: 'bold' },
  debtDesc: { fontSize: 15, color: '#666', textAlign: 'center' },
}); 