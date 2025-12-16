// firebase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBMc-_GOA9UnvCYMsGLYa7UT6YvTkP_CnI",
  authDomain: "parki-app-c1cc8.firebaseapp.com",
  projectId: "parki-app-c1cc8",
  storageBucket: "parki-app-c1cc8.firebasestorage.app",
  messagingSenderId: "388771049260",
  appId: "1:388771049260:web:bb520da4211e7efd99c689",
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Auth com persistência do AsyncStorage (não perde login)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore
export const db = getFirestore(app);

// Storage (para guardar imagens)
export const storage = getStorage(app);
