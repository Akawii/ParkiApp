// app/services/authService.ts
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc, // <--- NOVO
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from "firebase/firestore";
import "react-native-get-random-values";
import uuid from "react-native-uuid";
import { auth, db } from "../firebase";

// NOVO: Realtime Database
import { getDatabase, ref, remove, set } from "firebase/database";
const rtdb = getDatabase();

// FUNÇÃO PARA ATUALIZAR USER ATIVO NO RTDB
const setActiveUser = async (uid: string, nfcID: string) => {
  try {
    await set(ref(rtdb, `activeSessions/${uid}`), {
      nfcID,
      lastSeen: Date.now()
    });
    console.log("User ativo no Realtime DB:", uid);
  } catch (e) {
    console.log("Erro ao atualizar RTDB:", e);
  }
};

const clearActiveUser = async (uid: string) => {
  if (!uid) return;
  try {
    await remove(ref(rtdb, `activeSessions/${uid}`));
    console.log("User removido do RTDB");
  } catch (e) {}
};

export const registerUser = async (
  username: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
  try {
    const usernameQuery = await getDocs(
      query(collection(db, "users"), where("username", "==", username.trim().toLowerCase()))
    );
    if (!usernameQuery.empty) {
      return { success: false, error: "Este username já está em uso" };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const nfcID = uuid.v4() as string;

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

    // ATIVA O USER NO REALTIME DATABASE
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

export const loginUser = async (identifier: string, password: string) => {
  try {
    let emailToUse = identifier;

    if (!identifier.includes("@")) {
      const usernameQuery = await getDocs(
        query(collection(db, "users"), where("username", "==", identifier.toLowerCase().trim()))
      );
      if (usernameQuery.empty) {
        return { success: false, error: "Username ou senha incorretos" };
      }
      emailToUse = usernameQuery.docs[0].data().email;
    }

    await signInWithEmailAndPassword(auth, emailToUse, password);

    // PEGA O nfcID DO FIRESTORE E ATIVA NO RTDB
    const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
    if (userDoc.exists()) {
      const nfcID = userDoc.data().nfcID;
      await setActiveUser(auth.currentUser!.uid, nfcID);
    }

    return { success: true };
  } catch (error: any) {
    let message = "Não foi possível entrar";
    if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
      message = "Email/Username ou senha incorretos";
    }
    return { success: false, error: message };
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const logoutUser = async () => {
  try {
    const uid = auth.currentUser?.uid;
    await signOut(auth);
    await clearActiveUser(uid || "");
    console.log("Logout completo + RTDB limpo");
    return { success: true };
  } catch (error) {
    console.error("Erro no logout:", error);
    return { success: false };
  }
};