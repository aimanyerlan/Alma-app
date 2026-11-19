import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNotifications, NotificationItem } from '../contexts/NotificationContext';
import Icon from 'react-native-vector-icons/Ionicons';

const NotificationScreen = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return 'calendar-outline';
      case 'grade':
        return 'school-outline';
      case 'absence':
        return 'warning-outline';
      case 'performance':
        return 'alert-circle-outline';
      case 'schedule':
        return 'time-outline';
      case 'survey':
        return 'document-text-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'exam':
        return '#FF6B6B';
      case 'grade':
        return '#4ECDC4';
      case 'absence':
        return '#FFE66D';
      case 'performance':
        return '#FF8E8E';
      case 'schedule':
        return '#A8E6CF';
      case 'survey':
        return '#FFB3BA';
      default:
        return '#007AFF';
    }
  };

  const handleNotificationPress = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // Здесь можно добавить навигацию к соответствующему экрану
    Alert.alert(notification.title, notification.message);
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Отметить все как прочитанные',
      'Вы уверены, что хотите отметить все уведомления как прочитанные?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Да', onPress: markAllAsRead }
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Очистить все уведомления',
      'Вы уверены, что хотите удалить все уведомления?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', onPress: clearNotifications, style: 'destructive' }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      {/* Header */}
      <View style={{
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1C1C1E' }}>
            Уведомления
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <View style={{
                backgroundColor: '#FF3B30',
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                  {unreadCount}
                </Text>
              </View>
            )}
            <TouchableOpacity onPress={handleMarkAllAsRead} style={{ marginRight: 8 }}>
              <Icon name="checkmark-done-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearAll}>
              <Icon name="trash-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {notifications.length === 0 ? (
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 100,
          }}>
            <Icon name="notifications-off-outline" size={64} color="#C7C7CC" />
            <Text style={{ fontSize: 18, color: '#8E8E93', marginTop: 16, textAlign: 'center' }}>
              Нет уведомлений
            </Text>
            <Text style={{ fontSize: 14, color: '#C7C7CC', marginTop: 8, textAlign: 'center' }}>
              Новые уведомления появятся здесь
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => handleNotificationPress(notification)}
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                borderLeftWidth: 4,
                borderLeftColor: notification.isRead ? '#E5E7EB' : getNotificationColor(notification.type),
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: getNotificationColor(notification.type),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Icon name={getNotificationIcon(notification.type)} size={20} color="white" />
                </View>
                
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: notification.isRead ? '500' : 'bold',
                      color: notification.isRead ? '#8E8E93' : '#1C1C1E',
                      flex: 1,
                    }}>
                      {notification.title}
                    </Text>
                    {!notification.isRead && (
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#007AFF',
                        marginLeft: 8,
                      }} />
                    )}
                  </View>
                  
                  <Text style={{
                    fontSize: 14,
                    color: notification.isRead ? '#8E8E93' : '#666',
                    lineHeight: 20,
                    marginBottom: 8,
                  }}>
                    {notification.message}
                  </Text>
                  
                  <Text style={{
                    fontSize: 12,
                    color: '#C7C7CC',
                  }}>
                    {notification.date}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default NotificationScreen;