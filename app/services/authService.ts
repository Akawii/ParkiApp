// app/services/authService.ts
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import "react-native-get-random-values";
import uuid from "react-native-uuid";
import { auth, db } from "../firebase";

// REALTIME DATABASE — para o ESP32 saber quem está logado
import { getDatabase, ref, remove, set } from "firebase/database";
const rtdb = getDatabase();

// ATIVA/DESATIVA O USER NO REALTIME DATABASE
const setActiveUser = async (uid: string, nfcID: string) => {
  try {
    await set(ref(rtdb, `activeSessions/${uid}`), {
      nfcID,
      lastSeen: Date.now(),
    });
    console.log("User ativo no RTDB:", uid);
  } catch (e) {
    console.log("Erro ao ativar no RTDB:", e);
  }
};

const clearActiveUser = async (uid: string) => {
  if (!uid) return;
  try {
    await remove(ref(rtdb, `activeSessions/${uid}`));
    console.log("User removido do RTDB");
  } catch (e) {
    console.log("Erro ao limpar RTDB:", e);
  }
};

// REGISTER
export const registerUser = async (
  username: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
  try {
    // Verifica se o username já existe
    const usernameQuery = await getDocs(
      query(collection(db, "users"), where("username", "==", username.trim().toLowerCase()))
    );
    if (!usernameQuery.empty) {
      return { success: false, error: "Este username já está em uso" };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;
    const nfcID = uuid.v4() as string;

    // Avatar automático único
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${username.trim().toLowerCase()}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

    await setDoc(doc(db, "users", user.uid), {
      username: username.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      nfcID,
      avatar: avatarUrl,
      createdAt: serverTimestamp(),
    });

    // Ativa no Realtime Database (para o ESP32)
    await setActiveUser(user.uid, nfcID);

    return { success: true, nfcID };
  } catch (error: any) {
    let message = "Erro ao criar conta";
    if (error.code === "auth/email-already-in-use") message = "Este email já está registado";
    if (error.code === "auth/weak-password") message = "A senha deve ter pelo menos 6 caracteres";
    if (error.code === "auth/invalid-email") message = "Email inválido";
    return { success: false, error: message };
  }
};

// LOGIN (com username ou email)
export const loginUser = async (identifier: string, password: string) => {
  try {
    let emailToUse = identifier.trim();

    // Se não for email → procura pelo username
    if (!identifier.includes("@")) {
      const q = await getDocs(
        query(collection(db, "users"), where("username", "==", identifier.toLowerCase().trim()))
      );
      if (q.empty) return { success: false, error: "Username ou senha incorretos" };
      emailToUse = q.docs[0].data().email;
    }

    await signInWithEmailAndPassword(auth, emailToUse, password);

    // Pega o nfcID e ativa no Realtime Database
    const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
    if (userDoc.exists()) {
      const nfcID = userDoc.data()?.nfcID;
      if (nfcID) await setActiveUser(auth.currentUser!.uid, nfcID);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Email/Username ou senha incorretos" };
  }
};

// LOGOUT
export const logoutUser = async () => {
  try {
    const uid = auth.currentUser?.uid;
    await signOut(auth);
    await clearActiveUser(uid || "");
    return { success: true };
  } catch (error) {
    console.error("Erro no logout:", error);
    return { success: false };
  }
};

// LISTENER DO ESTADO DE AUTENTICAÇÃO
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};