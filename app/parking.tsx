// app/parking.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "./firebase";
import { createBooking, getActiveBooking } from "./services/bookingService";

// BLUETOOTH (funciona em iOS + Android)
import { BleManager } from "react-native-ble-plx";
const bleManager = new BleManager();

// NFC (Android) — a biblioteca certa em 2025
import NfcManager, { Ndef, NfcTech } from "react-native-nfc-manager";

// Inicia o NFC Manager ao carregar a tela
useEffect(() => {
  NfcManager.start();
  return () => NfcManager.cancelTechnologyRequest();
}, []);

export default function Parking() {
  const router = useRouter();
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [userNfcId, setUserNfcId] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [hceActive, setHceActive] = useState(false);

  useEffect(() => {
    loadBooking();
    loadUserNfcId();
  }, []);

  const loadUserNfcId = async () => {
    if (!auth.currentUser) return;
    try {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists()) {
        const id = snap.data()?.nfcID || snap.data()?.nfcId;
        setUserNfcId(id || "");
      }
    } catch (e) {
      console.error("Erro ao carregar NFC ID:", e);
    }
  };

  const loadBooking = async () => {
    const booking = await getActiveBooking();
    setActiveBooking(booking);
    if (booking?.endTime) startCountdown(booking.endTime);
  };

  const startCountdown = (endTime: any) => {
    const end = endTime.toDate ? endTime.toDate().getTime() : new Date(endTime).getTime();
    const interval = setInterval(() => {
      const diff = end - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expirada");
        clearInterval(interval);
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, "0")}`);
    }, 1000);
  };

  const reservar = async () => {
    const result = await createBooking("main-storage-01");
    if (!result.success) {
      Alert.alert("Erro", result.error || "Erro ao reservar");
      return;
    }
    loadBooking();
  };

  // ANDROID: Emulação NFC (encostar telemóvel)
  const enableNfcCardEmulation = async () => {
    if (Platform.OS !== "android") {
      Alert.alert("Só Android", "Esta função é exclusiva para Android");
      return;
    }
    if (!userNfcId) {
      Alert.alert("Erro", "NFC ID não carregado");
      return;
    }

    try {
      const supported = await NfcManager.isSupported();
      if (!supported) return Alert.alert("NFC não suportado neste dispositivo");

      const enabled = await NfcManager.isEnabled();
      if (!enabled) return Alert.alert("Ativa o NFC nas definições");

      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();

      if (tag?.ndefMessage) {
        const textRecord = tag.ndefMessage[0];
        const payload = Ndef.text.decodePayload(textRecord.payload);
        if (payload === userNfcId) {
          Alert.alert("Desbloqueado!", "Cacifo aberto com NFC!");
        } else {
          Alert.alert("Acesso Negado", "Cartão não autorizado");
        }
      } else {
        Alert.alert("Modo NFC Ativo", "Encosta o telemóvel ao sensor");
        setHceActive(true);
      }
    } catch (e: any) {
      Alert.alert("Erro NFC", e.message || "Falha ao ler cartão");
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  // BLUETOOTH: Funciona em iOS + Android
  const unlockViaBluetooth = async () => {
    if (!userNfcId) return Alert.alert("Erro", "ID não carregado");

    setIsConnecting(true);
    try {
      const state = await bleManager.state();
      if (state !== "PoweredOn") {
        Alert.alert("Bluetooth desligado", "Ativa o Bluetooth");
        return;
      }

      Alert.alert("A procurar...", "Procurando Parki_Locker...");

      const device = await new Promise<any>((resolve) => {
        let found = false;
        bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
          if (error) {
            bleManager.stopDeviceScan();
            resolve(null);
            return;
          }
          if (scannedDevice?.name === "Parki_Locker") {
            bleManager.stopDeviceScan();
            found = true;
            resolve(scannedDevice);
          }
        });

        setTimeout(() => {
          if (!found) {
            bleManager.stopDeviceScan();
            resolve(null);
          }
        }, 8000);
      });

      if (!device) {
        Alert.alert("Não encontrado", "Aproxima-te do cacifo");
        return;
      }

      await device.connect();
      await device.discoverAllServicesAndCharacteristics();

      const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
      const CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

      const base64 = btoa(userNfcId);
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHAR_UUID,
        base64
      );

      Alert.alert("Desbloqueado!", "Cacifo aberto com Bluetooth!");

      setTimeout(() => device.cancelConnection(), 2000);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao conectar");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estacionamento</Text>

      {activeBooking ? (
        <TouchableOpacity style={styles.bookingBox} onPress={() => router.push("/booking")}>
          <Text style={styles.boxTitle}>Tempo restante</Text>
          <Text style={styles.timer}>{timeLeft}</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Em breve", "Estacionamento instantâneo")}>
            <Text style={styles.buttonText}>Estacionar Agora</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonYellow} onPress={reservar}>
            <Text style={styles.buttonTextDark}>Reservar 15 Min</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.unlockSection}>
        <Text style={styles.sectionTitle}>Desbloquear Cacifo</Text>

        {userNfcId ? (
          <Text style={styles.nfcIdText}>ID: {userNfcId.substring(0, 12)}...</Text>
        ) : (
          <ActivityIndicator color="#0066ff" />
        )}

        {/* BLUETOOTH (iOS + Android) */}
        <TouchableOpacity
          style={[styles.unlockButton, styles.bluetoothButton]}
          onPress={unlockViaBluetooth}
          disabled={isConnecting || !userNfcId}
        >
          {isConnecting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="bluetooth" size={24} color="#fff" />
              <Text style={styles.unlockButtonText}>Bluetooth (iOS & Android)</Text>
            </>
          )}
        </TouchableOpacity>

        {/* NFC (Android apenas) */}
        {Platform.OS === "android" && (
          <TouchableOpacity
            style={[styles.unlockButton, hceActive ? styles.nfcActive : styles.nfcButton]}
            onPress={enableNfcCardEmulation}
            disabled={!userNfcId}
          >
            <Ionicons name={hceActive ? "checkmark-circle" : "phone-portrait"} size={24} color="#fff" />
            <Text style={styles.unlockButtonText}>
              {hceActive ? "NFC Ativo" : "NFC (encostar telemóvel)"}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.infoText}>
          {Platform.OS === "ios"
            ? "iPhone: Usa Bluetooth"
            : "Android: Usa NFC (encostar) ou Bluetooth"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", color: "#0066ff", marginBottom: 20, textAlign: "center" },
  button: { backgroundColor: "#0066ff", padding: 18, borderRadius: 14, marginBottom: 15 },
  buttonYellow: { backgroundColor: "#ffdd55", padding: 18, borderRadius: 14, marginBottom: 30 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  buttonTextDark: { color: "#333", textAlign: "center", fontWeight: "bold" },
  bookingBox: { backgroundColor: "#f0f8ff", padding: 25, borderRadius: 16, alignItems: "center", marginBottom: 30 },
  boxTitle: { fontSize: 16, color: "#0066ff" },
  timer: { fontSize: 48, fontWeight: "bold", marginVertical: 10 },
  unlockSection: { backgroundColor: "#f8f9fa", padding: 20, borderRadius: 16, marginTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  nfcIdText: { fontSize: 13, color: "#666", textAlign: "center", marginBottom: 15, fontFamily: "monospace" },
  unlockButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16, borderRadius: 12, marginBottom: 12, gap: 10 },
  bluetoothButton: { backgroundColor: "#0066ff" },
  nfcButton: { backgroundColor: "#34c759" },
  nfcActive: { backgroundColor: "#30a14e" },
  unlockButtonText: { color: "#fff", fontWeight: "600" },
  infoText: { fontSize: 13, color: "#666", textAlign: "center", marginTop: 15, lineHeight: 18 },
});