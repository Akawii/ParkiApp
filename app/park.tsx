import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Park() {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isUnlocking) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isUnlocking]);

  // -------------------------
  // OPEN DOOR
  // -------------------------
  const unlockDoor = async () => {
    if (isUnlocking) return;
    setIsUnlocking(true);

    try {
      const response = await fetch("http://192.168.137.110/unlock", {
        method: "POST",
      });

      const text = await response.text();
      console.log("ESP32:", text);

      if (text.includes("Locker Occupied")) {
        setIsUnlocking(false);

        Alert.alert(
          "Cacifo Ocupado ❌",
          "Não é possível abrir porque já está a ser utilizado.",
          [{ text: "OK", style: "cancel" }]
        );

        return;
      }

      if (text.includes("Locker Opening")) {
        setDoorOpen(true);

        Alert.alert(
          "Sucesso! 🎉",
          "O cacifo abriu. Deposita o teu bem e fecha a porta quando terminares.",
          [
            { 
              text: "OK", 
              style: "default",
              onPress: () => {
                // Auto-close after 30 seconds if user forgets
                setTimeout(() => {
                  setDoorOpen(false);
                }, 30000);
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error("Unlock error:", error);
      Alert.alert(
        "Erro de Conexão 📡",
        "Verifica a ligação à internet e a proximidade do cacifo.",
        [{ text: "OK", style: "cancel" }]
      );
    } finally {
      setTimeout(() => setIsUnlocking(false), 3000);
    }
  };

  // -------------------------
  // CLOSE DOOR
  // -------------------------
  const closeDoor = async () => {
    if (isUnlocking) return;
    setIsUnlocking(true);

    try {
      const response = await fetch("http://192.168.137.110/close", {
        method: "POST",
      });

      const text = await response.text();
      console.log("ESP32 Close:", text);

      if (response.ok && text.includes("Locker Closed")) {
        setDoorOpen(false);
        Alert.alert(
          "Fechado 🔒", 
          "O cacifo foi fechado com sucesso.",
          [{ text: "OK", style: "default" }]
        );
      } else {
        Alert.alert(
          "Erro ⚠️", 
          "Não foi possível fechar o cacifo. Tenta novamente.",
          [{ text: "OK", style: "cancel" }]
        );
      }
    } catch (error) {
      console.error("Close error:", error);
      Alert.alert(
        "Erro de Conexão 📡", 
        "Verifica a ligação à internet.",
        [{ text: "OK", style: "cancel" }]
      );
    } finally {
      setTimeout(() => setIsUnlocking(false), 3000);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          isUnlocking
            ? ["#FF9800", "#FFB74D", "#FFA726"]
            : doorOpen
            ? ["#1a1fc9", "#0208C7", "#0208C7"]
            : ["#0208C7", "#1a1fc9", "#e95049"]
        }
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View
        style={[
          styles.decorCircle1,
          { opacity: fadeAnim, transform: [{ scale: pulseAnim }] },
        ]}
      />
      <Animated.View
        style={[styles.decorCircle2, { opacity: fadeAnim }]}
      />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>
            {isUnlocking ? "⚡" : doorOpen ? "🔓" : "🔒"}
          </Text>

          <Text style={styles.headerTitle}>
            {isUnlocking
              ? "A Desbloquear..."
              : doorOpen
              ? "Cacifo Aberto"
              : "Unlock Imediato"}
          </Text>

          <Text style={styles.headerSubtitle}>
            {isUnlocking
              ? "A estabelecer ligação segura"
              : doorOpen
              ? "Fecha o cacifo quando terminares"
              : "Abre o teu cacifo por aproximação"}
          </Text>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.mainCard,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={["#ffffff", "#f8f9fa"]}
          style={styles.cardGradient}
        >
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isUnlocking
                    ? "#FF9800"
                    : doorOpen
                    ? "#1a1fc9"
                    : "#4CAF50",
                },
              ]}
            />
            <Text style={styles.statusBadgeText}>
              {isUnlocking
                ? "PROCESSANDO"
                : doorOpen
                ? "ABERTO"
                : "PRONTO"}
            </Text>
          </View>

          <Text style={styles.cardTitle}>
            {isUnlocking
              ? "Aguarda um momento"
              : doorOpen
              ? "Cacifo Aberto"
              : "Pronto para Estacionar"}
          </Text>

          <Text style={styles.cardSubtitle}>
            {isUnlocking
              ? "Estabelecendo ligação segura..."
              : doorOpen
              ? "Fecha o cacifo quando terminares."
              : "Certifica-te que estás em frente ao cacifo e prime o botão."}
          </Text>

          {/* BUTTON */}
          <TouchableOpacity
            style={styles.unlockButtonWrapper}
            onPress={doorOpen ? closeDoor : unlockDoor}
            disabled={isUnlocking}
            activeOpacity={0.9}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={
                  isUnlocking
                    ? ["#FF9800", "#FFB74D"]
                    : doorOpen
                    ? ["#1a1fc9", "#0208C7"]
                    : ["#e95049", "#ff6b63"]
                }
                style={styles.unlockGradient}
              >
                <View style={styles.outerRing} />

                {isUnlocking ? (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="sync" size={56} color="#fff" />
                  </Animated.View>
                ) : doorOpen ? (
                  <View style={styles.unlockContent}>
                    <Ionicons name="lock-closed" size={56} color="#fff" />
                    <Text style={styles.unlockButtonText}>FECHAR</Text>
                    <Text style={styles.unlockButtonSubtext}>TOCA AQUI</Text>
                  </View>
                ) : (
                  <View style={styles.unlockContent}>
                    <Ionicons name="lock-open" size={56} color="#fff" />
                    <Text style={styles.unlockButtonText}>ABRIR</Text>
                    <Text style={styles.unlockButtonSubtext}>TOCA AQUI</Text>
                  </View>
                )}
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: "#e4f967" },
                ]}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color="#0208C7"
                />
              </View>
              <Text style={styles.featureLabel}>Seguro</Text>
            </View>

            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: "#b2d6f0" },
                ]}
              >
                <Ionicons name="flash" size={20} color="#0208C7" />
              </View>
              <Text style={styles.featureLabel}>Instantâneo</Text>
            </View>

            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: "#ffcdd2" },
                ]}
              >
                <Ionicons name="wifi" size={20} color="#e95049" />
              </View>
              <Text style={styles.featureLabel}>ESP32</Text>
            </View>
          </View>

          <View
            style={[
              styles.statusRow,
              {
                backgroundColor: isUnlocking
                  ? "#FFF3E0"
                  : doorOpen
                  ? "#E3F2FD"
                  : "#E8F5E9",
              },
            ]}
          >
            <Ionicons
              name={
                isUnlocking
                  ? "hourglass"
                  : doorOpen
                  ? "alert-circle"
                  : "checkmark-circle"
              }
              size={22}
              color={
                isUnlocking
                  ? "#FF9800"
                  : doorOpen
                  ? "#1a1fc9"
                  : "#4CAF50"
              }
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: isUnlocking
                    ? "#FF9800"
                    : doorOpen
                    ? "#1a1fc9"
                    : "#4CAF50",
                },
              ]}
            >
              {isUnlocking
                ? "Comunicação em curso..."
                : doorOpen
                ? "Cacifo aberto - Não te esqueças de fechar!"
                : "Sistema pronto, pode abrir"}
            </Text>
          </View>

          <View style={styles.infoFooter}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#999"
            />
            <Text style={styles.infoText}>
              Mantém-te a menos de 5m do cacifo
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {!isUnlocking && !doorOpen && (
        <Animated.View
          style={[styles.tipsContainer, { opacity: fadeAnim }]}
        >
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={18} color="#e4f967" />
            <Text style={styles.tipText}>
              Primeiro uso? O cacifo abre em 2-3 segundos
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0208C7",
  },

  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  decorCircle1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(228, 249, 103, 0.1)",
  },

  decorCircle2: {
    position: "absolute",
    bottom: -150,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
    alignItems: "center",
  },

  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  headerContent: {
    alignItems: "center",
    gap: 8,
  },

  headerEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
    textAlign: "center",
  },

  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    fontWeight: "500",
    paddingHorizontal: 20,
  },

  mainCard: {
    marginHorizontal: 20,
    marginTop: 5,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },

  cardGradient: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignItems: "center",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(2, 8, 199, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0208C7",
    letterSpacing: 1,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
    marginBottom: 32,
    fontWeight: "500",
  },

  unlockButtonWrapper: {
    marginBottom: 32,
  },

  unlockGradient: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#e95049",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    position: "relative",
  },

  outerRing: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  unlockContent: {
    alignItems: "center",
    gap: 8,
  },

  unlockButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
  },

  unlockButtonSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  featuresGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },

  featureItem: {
    alignItems: "center",
    gap: 8,
  },

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  featureLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    width: "100%",
  },

  statusText: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },

  infoFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  
  infoText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },

  tipsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    lineHeight: 18,
  },
});