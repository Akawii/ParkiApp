// app/writeNfcCard.tsx
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
import NfcManager, { Ndef, NfcTech } from "react-native-nfc-manager";
import { auth, db } from "./firebase";

export default function WriteNfcCard() {
  const router = useRouter();
  const [userNfcId, setUserNfcId] = useState<string>("");
  const [nfcSupported, setNfcSupported] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [cardsProgrammed, setCardsProgrammed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Check NFC support
      await NfcManager.start();
      const supported = await NfcManager.isSupported();
      setNfcSupported(supported);

      if (!supported) {
        Alert.alert(
          "NFC Não Suportado",
          "O teu dispositivo não tem NFC. Usa o desbloqueio Bluetooth."
        );
      }

      // Load user's NFC ID from Firebase
      if (!auth.currentUser) {
        Alert.alert("Erro", "Precisas de iniciar sessão");
        router.back();
        return;
      }

      console.log("📱 A carregar NFC ID do utilizador:", auth.currentUser.uid);

      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      
      if (userDoc.exists()) {
        const nfcId = userDoc.data()?.nfcId;
        
        if (nfcId) {
          setUserNfcId(nfcId);
          console.log("✅ NFC ID carregado:", nfcId);
        } else {
          Alert.alert(
            "Erro",
            "NFC ID não encontrado na tua conta. Contacta o suporte."
          );
        }
      } else {
        Alert.alert("Erro", "Dados do utilizador não encontrados");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Erro", "Não foi possível carregar os teus dados");
    } finally {
      setLoading(false);
    }
  };

  const writeNfcCard = async () => {
    if (!userNfcId) {
      Alert.alert("Erro", "NFC ID não encontrado");
      return;
    }

    if (!nfcSupported) {
      Alert.alert(
        "Não Suportado",
        "O teu dispositivo não tem NFC. Contacta o suporte para obteres um cartão físico."
      );
      return;
    }

    setIsWriting(true);

    Alert.alert(
      "📱 Pronto para Escrever",
      "Encosta um cartão NFC vazio ao telemóvel agora.\n\n" +
        "⚠️ Certifica-te que o cartão está vazio ou que podes sobrescrever.",
      [
        {
          text: "Começar",
          onPress: async () => {
            try {
              // Request NFC technology
              await NfcManager.requestTechnology(NfcTech.Ndef);

              // Create NDEF message with user's UUID
              const bytes = Ndef.encodeMessage([Ndef.textRecord(userNfcId)]);

              // Write to card
              await NfcManager.ndefHandler.writeNdefMessage(bytes);

              setCardsProgrammed((prev) => prev + 1);

              Alert.alert(
                "✅ Sucesso!",
                `Cartão NFC programado com sucesso!\n\n` +
                  `Podes agora usar este cartão para desbloquear o cacifó.\n\n` +
                  `Cartões programados: ${cardsProgrammed + 1}`,
                [
                  {
                    text: "Programar Outro",
                    onPress: () => {
                      NfcManager.cancelTechnologyRequest();
                      setIsWriting(false);
                    },
                  },
                  {
                    text: "Concluir",
                    onPress: () => {
                      NfcManager.cancelTechnologyRequest();
                      setIsWriting(false);
                      router.back();
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error("Write error:", error);

              let errorMessage = "Não foi possível escrever no cartão.";

              if (error.message?.includes("cancelled")) {
                errorMessage = "Operação cancelada.";
              } else if (error.message?.includes("Tag was lost")) {
                errorMessage = "Cartão removido muito cedo. Tenta novamente.";
              } else if (error.message?.includes("not NDEF formatted")) {
                errorMessage = "Este cartão não está formatado para NDEF.";
              }

              Alert.alert("Erro", errorMessage);
              NfcManager.cancelTechnologyRequest();
              setIsWriting(false);
            }
          },
        },
        {
          text: "Cancelar",
          onPress: () => setIsWriting(false),
          style: "cancel",
        },
      ]
    );
  };

  const readExistingCard = async () => {
    try {
      await NfcManager.start();

      Alert.alert("Ler Cartão", "Encosta um cartão NFC ao telemóvel", [
        {
          text: "Começar",
          onPress: async () => {
            try {
              await NfcManager.requestTechnology(NfcTech.Ndef);

              const tag = await NfcManager.getTag();

              if (tag && tag.ndefMessage && tag.ndefMessage.length > 0) {
                const record = tag.ndefMessage[0];
                const payloadUint8 = new Uint8Array(record.payload);
                const text = Ndef.text.decodePayload(payloadUint8);

                Alert.alert(
                  "Cartão Lido ✅",
                  `ID no cartão: ${text}\n\n` +
                    `${
                      text === userNfcId
                        ? "✅ Este cartão está correto!"
                        : "⚠️ Este cartão tem um ID diferente"
                    }`
                );
              } else {
                Alert.alert("Cartão Vazio", "Este cartão não tem dados.");
              }

              await NfcManager.cancelTechnologyRequest();
            } catch (error) {
              console.error("Read error:", error);
              Alert.alert("Erro", "Não foi possível ler o cartão");
              await NfcManager.cancelTechnologyRequest();
            }
          },
        },
        { text: "Cancelar", style: "cancel" },
      ]);
    } catch (error) {
      console.error("Read error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066ff" />
        <Text style={styles.loadingText}>A carregar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0066ff" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>📇 Programar Cartão NFC</Text>
      <Text style={styles.subtitle}>
        Cria cartões físicos para desbloquear o cacifó sem usar o telemóvel
      </Text>

      {/* USER INFO */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>O teu NFC ID:</Text>
        <Text style={styles.infoValue}>{userNfcId || "Não encontrado"}</Text>
        <Text style={styles.infoSubtext}>
          (Carregado automaticamente da tua conta Firebase)
        </Text>
        {cardsProgrammed > 0 && (
          <Text style={styles.successText}>
            ✅ {cardsProgrammed} cartão(ões) programado(s)
          </Text>
        )}
      </View>

      {/* INSTRUCTIONS */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>📋 Como funciona:</Text>
        <Text style={styles.instructionStep}>
          1️⃣ Compra cartões NFC em branco (NTAG215/216)
        </Text>
        <Text style={styles.instructionStep}>
          2️⃣ Clica em "Programar Cartão" abaixo
        </Text>
        <Text style={styles.instructionStep}>
          3️⃣ Encosta o cartão ao telemóvel
        </Text>
        <Text style={styles.instructionStep}>
          4️⃣ Guarda o cartão na carteira
        </Text>
        <Text style={styles.instructionStep}>
          5️⃣ Usa para desbloquear o cacifó!
        </Text>
      </View>

      {/* ACTIONS */}
      {nfcSupported ? (
        <>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={writeNfcCard}
            disabled={isWriting || !userNfcId}
          >
            {isWriting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="create" size={24} color="#fff" />
                <Text style={styles.buttonText}>Programar Cartão</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={readExistingCard}
            disabled={isWriting}
          >
            <Ionicons name="scan" size={24} color="#0066ff" />
            <Text style={styles.secondaryButtonText}>Ler Cartão Existente</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.notSupportedCard}>
          <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.notSupportedText}>
            NFC não suportado neste dispositivo
          </Text>
          <Text style={styles.notSupportedSubtext}>
            Contacta o suporte para obteres um cartão pré-programado ou usa o
            desbloqueio Bluetooth.
          </Text>
        </View>
      )}

      {/* INFO */}
      <View style={styles.tipCard}>
        <Text style={styles.tipText}>
          💡 <Text style={styles.tipBold}>Dica:</Text> Podes programar vários
          cartões - um para a carteira, outro para o carro, etc.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    fontSize: 17,
    color: "#0066ff",
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#0066ff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  infoSubtext: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
  successText: {
    marginTop: 10,
    fontSize: 14,
    color: "#34c759",
    fontWeight: "600",
  },
  instructionsCard: {
    backgroundColor: "#e3f2fd",
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#0066ff",
  },
  instructionStep: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    lineHeight: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#0066ff",
    shadowColor: "#0066ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#0066ff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  secondaryButtonText: {
    color: "#0066ff",
    fontSize: 17,
    fontWeight: "bold",
  },
  notSupportedCard: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  notSupportedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginTop: 15,
    marginBottom: 10,
  },
  notSupportedSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: "#fff3cd",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  tipText: {
    fontSize: 13,
    color: "#856404",
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: "bold",
  },
});