// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAuxhw1JZmMKi4WiuXCBEQD1Db2f6JSwkU",
  authDomain: "almauapp-c26cb.firebaseapp.com",
  projectId: "almauapp-c26cb",
  storageBucket: "almauapp-c26cb.firebasestorage.app",
  messagingSenderId: "559698111504",
  appId: "1:559698111504:web:bbb04524d32ef625c62e95",
  measurementId: "G-CTLCJC5CW0"
};

// В Expo/React Native не используем getAnalytics
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const storage = getStorage(app);

export { app, firebaseConfig, db, auth, storage }; 