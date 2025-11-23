// app/services/bookingService.ts
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

// ======================================================
// 1️⃣ VERIFICA RESERVA ATIVA
// ======================================================
export const getActiveBooking = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  const q = query(
    collection(db, "bookings"),
    where("userId", "==", user.uid),
    where("expired", "==", false)
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

// ======================================================
// 2️⃣ CRIAR RESERVA (15 MINUTOS)
// ======================================================
export const createBooking = async (storageId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "User not logged in" };

    // IMPEDIR RESERVAS DUPLICADAS
    const active = await getActiveBooking();
    if (active) {
      return { success: false, error: "Já tens uma reserva ativa." };
    }

    const duration = 15; // 15 minutos
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60000);

    await addDoc(collection(db, "bookings"), {
      userId: user.uid,
      storageId,
      duration: "15 Minutes",
      startTime,
      endTime,
      expired: false,
      paid: false,
      paymentMethod: "none",
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao criar reserva" };
  }
};

// ======================================================
// 3️⃣ MARCAR RESERVA COMO EXPIRADA
// ======================================================
export const expireBooking = async (bookingId: string) => {
  try {
    const ref = doc(db, "bookings", bookingId);

    await updateDoc(ref, {
      expired: true,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao expirar reserva" };
  }
};

// ======================================================
// 4️⃣ OUVIR RESERVA ATIVA EM TEMPO REAL (OPCIONAL)
// Ideal para contador decrescente no app
// ======================================================
export const listenActiveBooking = (callback: any) => {
  const user = auth.currentUser;
  if (!user) return null;

  const q = query(
    collection(db, "bookings"),
    where("userId", "==", user.uid),
    where("expired", "==", false)
  );

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
    } else {
      callback({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    }
  });
};
