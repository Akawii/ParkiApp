// firebase.ts ou firebase.js (na raiz do projeto)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMc-_GOA9UnvCYMsGLYa7UT6YvTkP_CnI",
  authDomain: "parki-app-c1cc8.firebaseapp.com",
  projectId: "parki-app-c1cc8",
  storageBucket: "parki-app-c1cc8.firebasestorage.app",
  messagingSenderId: "388771049260",
  appId: "1:388771049260:web:bb520da4211e7efd99c689"
};

const app = initializeApp(firebaseConfig);

// Auth com persistência (não perde login ao fechar o app)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);