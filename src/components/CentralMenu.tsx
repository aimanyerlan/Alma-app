import React from 'react';
import { Modal, View, Text, Pressable, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useCalendar } from '../contexts/CalendarContext';
import { useNavigation } from '@react-navigation/native';

interface MenuItemProps {
  icon: string;
  label: string;
  colorScheme: string;
  onPress?: () => void;
}

const MenuItem = ({ icon, label, colorScheme, onPress }: MenuItemProps) => (
  <Pressable style={tw`flex-row items-center py-3 px-2 rounded mb-1`} onPress={onPress}>
    <Icon name={icon} size={26} color={colorScheme === 'dark' ? '#fff' : '#222'} style={tw`mr-4`} />
    <Text style={tw`${colorScheme === 'dark' ? 'text-white' : 'text-black'} text-lg`}>{label}</Text>
  </Pressable>
);

interface CentralMenuProps {
  visible: boolean;
  onClose: () => void;
}

const CentralMenu = ({ visible, onClose }: CentralMenuProps) => {
  const { setActiveTab } = useCalendar();
  const navigation = useNavigation<any>();
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const handleSchedulePress = () => {
    setActiveTab('schedule');
    navigation.navigate('Tabs', { screen: 'Calendar' });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={tw`flex-1`} onPress={onClose}>
        <Animated.View
          style={[
            tw`absolute left-0 right-0 items-center`,
            {
              bottom: 100,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              zIndex: 20,
            },
          ]}
        >
          <View style={[tw`rounded-3xl w-80 px-6 pt-6 pb-2`, { backgroundColor: '#B3D8EA' }]}> 
            <Text style={tw`text-xl font-bold mb-4 text-center`}>Меню</Text>
            <MenuItem 
              icon="calendar-outline" 
              label="Расписание" 
              colorScheme="light" 
              onPress={handleSchedulePress}
            />
            <MenuItem 
              icon="calculator-outline" 
              label="Калькулятор GPA" 
              colorScheme="light" 
              onPress={() => {
                navigation.navigate('GpaCalculator');
                onClose();
              }}
            />

            <MenuItem 
              icon="document-text-outline" 
              label="Транскрипт" 
              colorScheme="light" 
              onPress={() => {
                navigation.navigate('Transcript');
                onClose();
              }}
            />
            <MenuItem 
              icon="analytics-outline" 
              label="Журнал оценок" 
              colorScheme="light" 
              onPress={() => {
                navigation.navigate('GradeBook');
                onClose();
              }}
            />
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default CentralMenu; 