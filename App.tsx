import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Modal, Dimensions, Pressable, Platform, useColorScheme, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeacherProfileScreen from './src/screens/TeacherProfile';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CalendarProvider, useCalendar } from './src/contexts/CalendarContext';
import { GradeBookProvider } from './src/contexts/GradeBookContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

import CalendarScreen from './src/screens/Calendar';
import HomeScreen from './src/screens/Home';

import ProfileScreen from './src/screens/Profile';
import NewsDetail from './src/screens/Home/NewsDetail';
import GpaCalculatorScreen from './src/screens/GpaCalculator';
import MaterialsScreen from './src/screens/Materials';
import ExchangeScreen from './src/screens/Exchange';
import GradeBookScreen from './src/screens/GradeBook';
import GradeDetailScreen from './src/screens/GradeDetail';
import GradeStatisticsScreen from './src/screens/GradeStatistics';
import AddGradeScreen from './src/screens/AddGrade';
import TranscriptScreen from './src/screens/Transcript';
import CentralMenu from './src/components/CentralMenu';
import LoginScreen from './src/screens/Login';
import * as SecureStore from 'expo-secure-store';
import PersonalDataScreen from './src/screens/Profile/PersonalData';
import AchievementsScreen from './src/screens/Profile/Achievements';
import DebtsScreen from './src/screens/Profile/Debts';
import SettingsScreen from './src/screens/Profile/Settings';
import HelpScreen from './src/screens/Profile/Help';
import MessageScreen from './src/screens/Chat/MessageScreen';
import ChatRoomScreen from './src/screens/Chat/ChatRoomScreen';
import NotificationsScreen from './src/screens/Notifications';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const EmptyScreen = () => null;
const { width } = Dimensions.get('window');

// Заглушки для FileView и StatementDetails
const FileViewScreen = () => <View style={tw`flex-1 items-center justify-center bg-white dark:bg-black`}><Text style={tw`text-black dark:text-white`}>FileView</Text></View>;
const StatementDetailsScreen = () => <View style={tw`flex-1 items-center justify-center bg-white dark:bg-black`}><Text style={tw`text-black dark:text-white`}>StatementDetails</Text></View>;

function TabsScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const colorScheme = useColorScheme();

  const openMenu = () => {
    setIsMenuOpen(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  };
  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 100, duration: 250, useNativeDriver: true }),
    ]).start(() => setIsMenuOpen(false));
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }: { route: any }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            height: 80,
            backgroundColor: colorScheme === 'dark' ? '#111' : '#000',
            borderTopWidth: 0,
            borderColor: colorScheme === 'dark' ? '#222' : '#000',
            elevation: 20,
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowOffset: { width: 0, height: -4 },
            shadowRadius: 16,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            zIndex: 10,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          },
        })}
        tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} isMenuOpen={isMenuOpen} openMenu={openMenu} closeMenu={closeMenu} colorScheme={colorScheme} />}
      >
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="CentralMenu" component={EmptyScreen} />
        <Tab.Screen
          name="Messages"
          component={MessageScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="chatbubble-ellipses-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <CentralMenu
        visible={isMenuOpen}
        onClose={closeMenu}
      />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <CalendarProvider>
          <GradeBookProvider>
            <NotificationProvider>
              <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Tabs" component={TabsScreen} />
                  <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} />
                  <Stack.Screen name="FileView" component={FileViewScreen} />
                  <Stack.Screen name="StatementDetails" component={StatementDetailsScreen} />
                  <Stack.Screen name="NewsDetail" component={NewsDetail} />
                  <Stack.Screen name="GpaCalculator" component={GpaCalculatorScreen} />
                  <Stack.Screen name="Materials" component={MaterialsScreen} />
                  <Stack.Screen name="Exchange" component={ExchangeScreen} />
                  <Stack.Screen name="GradeBook" component={GradeBookScreen} />
                  <Stack.Screen name="GradeDetail" component={GradeDetailScreen} />
                  <Stack.Screen name="GradeStatistics" component={GradeStatisticsScreen} />
                  <Stack.Screen name="AddGrade" component={AddGradeScreen} />
                  <Stack.Screen name="Transcript" component={TranscriptScreen} />
                  <Stack.Screen name="PersonalData" component={PersonalDataScreen} />
                  <Stack.Screen name="Achievements" component={AchievementsScreen} />
                  <Stack.Screen name="Debts" component={DebtsScreen} />
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                  <Stack.Screen name="Help" component={HelpScreen} />
                  <Stack.Screen name="MessageScreen" component={MessageScreen} />
                  <Stack.Screen name="ChatRoomScreen" component={ChatRoomScreen} />
                  <Stack.Screen name="Notifications" component={NotificationsScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </NotificationProvider>
          </GradeBookProvider>
        </CalendarProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

interface CustomTabBarProps extends BottomTabBarProps {
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  colorScheme: string | null | undefined;
}

const CustomTabBar = ({ state, descriptors, navigation, isMenuOpen, openMenu, closeMenu, colorScheme }: CustomTabBarProps) => {
  return (
    <View style={[tw`flex-row items-center justify-between`, {
      backgroundColor: colorScheme === 'dark' ? '#111' : '#000',
      height: 80,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      elevation: 20,
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: -4 },
      shadowRadius: 16,
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
    }]}> 
      {state.routes.map((route: any, index: number) => {
        if (route.name === 'CentralMenu') {
          // Центральная кнопка
          return (
            <View key={route.key} style={{ flex: 1, alignItems: 'center', top: -24, zIndex: 20 }}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={isMenuOpen ? closeMenu : openMenu}
                style={[
                  tw`items-center justify-center`,
                  {
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: '#F3B3D3',
                    borderWidth: 4,
                    borderColor: '#fff',
                    shadowColor: '#000',
                    shadowOpacity: 0.18,
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 8,
                    elevation: 12,
                  },
                ]}
              >
                <Icon name={isMenuOpen ? 'close-outline' : 'add'} size={36} color={colorScheme === 'dark' ? '#222' : '#fff'} />
              </TouchableOpacity>
            </View>
          );
        }
        // Обычные вкладки
        const isFocused = state.index === index;
        let iconName = '';
        if (route.name === 'Calendar') iconName = 'calendar-outline';
        if (route.name === 'Home') iconName = 'home-outline';
        if (route.name === 'Messages') iconName = 'chatbubble-ellipses-outline';
        if (route.name === 'Profile') iconName = 'person-outline';
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={descriptors[route.key]?.options.tabBarAccessibilityLabel}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name={iconName} size={28} color={isFocused ? '#F3B3D3' : '#fff'} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
