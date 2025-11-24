// app/park.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Park() {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const router = useRouter();

  const unlockDoor = async () => {
    setIsUnlocking(true);

    try {
      // Replace with your ESP32 IP & endpoint
      const response = await fetch("http://192.168.137.165/unlock", {
        method: "POST",
      });

      if (response.ok) {
        Alert.alert("Desbloqueado!", "O cacifo abriu com sucesso!");
      } else {
        Alert.alert("Erro", "Não foi possível abrir o cacifo.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Verifica a ligação ao dispositivo.");
    } finally {
      setTimeout(() => {
        setIsUnlocking(false);
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ParkiApp</Text>
      <Text style={styles.subtitle}>O teu cacifo inteligente</Text>

      <TouchableOpacity style={styles.unlockButton} onPress={unlockDoor} disabled={isUnlocking}>
        {isUnlocking ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <>
            <Ionicons name="lock-open" size={40} color="#fff" />
            <Text style={styles.buttonText}>ABRIR CACIFO</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.info}>
        {isUnlocking ? "A desbloquear..." : "Toca no botão para abrir"}
      </Text>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0066ff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginBottom: 60,
  },
  unlockButton: {
    backgroundColor: "#0066ff",
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
  },
  info: {
    marginTop: 40,
    fontSize: 16,
    color: "#666",
  },
  backButton: {
    marginTop: 50,
    padding: 15,
  },
  backText: {
    color: "#0066ff",
    fontSize: 16,
    fontWeight: "600",
  },
});
