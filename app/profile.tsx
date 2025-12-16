// app/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "./firebase";
import { logoutUser } from "./services/authService";

const { width } = Dimensions.get('window');

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [avatarKey, setAvatarKey] = useState(0);
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  // Animações de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animações de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!auth.currentUser) {
        router.replace("/login");
        return;
      }
      console.log("🔄 Profile ganhou foco - recarregando dados...");
      loadUserData();
    }, [])
  );

  useEffect(() => {
    if (imageLoading) {
      setShowSlowWarning(false);
      const timer = setTimeout(() => {
        if (imageLoading) {
          setShowSlowWarning(true);
          console.log("⚠️ Imagem está demorando...");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [imageLoading, avatarKey]);

  const loadUserData = async () => {
    setLoading(true);
    setImageLoading(true);
    setShowSlowWarning(false);

    try {
      const snap = await getDoc(doc(db, "users", auth.currentUser!.uid));
      if (snap.exists()) {
        console.log("✅ Dados carregados:", snap.data().username);
        const data = snap.data();
        setUserData(data);
        // Forçar reload do Image 
        setTimeout(() => {
          setAvatarKey(prev => prev + 1);
        }, 100);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do perfil");
    } finally {
      setLoading(false);
    }
  };


const logout = () => {
  Alert.alert("Sair", "Queres mesmo sair?", [
    { text: "Não" },
    { 
      text: "Sim", 
      onPress: async () => {
        try {
          // Mostra feedback visual opcional (poderias adicionar spinner)
          console.log("⏳ A terminar sessão...");

          await logoutUser(); // Espera que o Firebase Auth termine
          
          console.log("✅ Logout concluído, redirecionando...");
          router.replace("/login"); // Agora sim, já não há currentUser
        } catch (err) {
          console.error("Erro no logout:", err);
          Alert.alert("Erro", "Não foi possível terminar a sessão.");
        }
      }
    }
  ]);
};





  // 1. HANDLER PARA DEFINIÇÕES (ALERTA)
  const handleSettingsPress = () => {
    Alert.alert("Em Desenvolvimento", "Feature ainda em desenvolvimento.");
  };

  // 2. HANDLER PARA AJUDA (LINK EXTERNO)
  const handleHelpPress = async () => {
    const url = 'https://www.cicla.pt/help';
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Erro`, `Não foi possível abrir o link: ${url}`);
    }
  };


  if (loading && !userData) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0208C7', '#b2d6f0']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>A carregar perfil...</Text>
        </LinearGradient>
      </View>
    );
  }

  // --- LÓGICA DO AVATAR ---
  const avatarUri = (() => {
    if (!userData?.avatar) return null;

    let url = userData.avatar;

    if (url.startsWith("data:image")) {
      return url;
    } else {
      url = url.replace('/svg?', '/png?');
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}t=${avatarKey}`;
    }
  })();
  // --- FIM DA LÓGICA DO AVATAR ---

  return (
    <View style={styles.container}>
      
      {/* 1. HEADER FIXO (FORA DO SCROLLVIEW) */}
      <LinearGradient
        colors={['#0208C7', '#e95049']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Perfil</Text>
          
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push("/editProfile")}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Avatar Fixo (continua no header) */}
        <Animated.View 
          key={`avatar-container-${avatarKey}`}
          style={[
            styles.avatarContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.avatarWrapper}>
            {imageLoading && (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator size="large" color="#0208C7" />
                {showSlowWarning && (
                  <Text style={styles.slowWarning}>A decodificar...</Text>
                )}
              </View>
            )}
            
            {avatarUri ? (
              <Image 
                key={`avatar-${avatarKey}`}
                source={{ uri: avatarUri }}
                style={[styles.avatar, imageLoading && { opacity: 0 }]}
                onLoad={() => {
                  console.log("✅ Imagem de avatar carregada com sucesso.");
                  setImageLoading(false);
                  setShowSlowWarning(false);
                }}
                onError={(e) => {
                  console.error("❌ Erro ao carregar imagem de avatar:", e.nativeEvent.error);
                  setImageLoading(false);
                  setShowSlowWarning(false);
                }}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-circle" size={120} color="#ccc" />
              </View>
            )}
          </View>
        </Animated.View>
      </LinearGradient>

      {/* 2. SCROLLVIEW PARA O CONTEÚDO RESTANTE */}
      <ScrollView 
        style={styles.scrollView} // Usei o estilo original, mas agora fora do header
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            // Adicionado marginTop negativo para que o conteúdo suba por cima do header/avatar
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Card principal de info */}
          <View style={styles.infoCard}>
            <Text style={styles.username}>@{userData?.username || "..."}</Text>
            <Text style={styles.name}>
              {userData?.firstName || "..."} {userData?.lastName || "..."}
            </Text>
            <View style={styles.emailContainer}>
              <Ionicons name="mail-outline" size={16} color="#666" />
              <Text style={styles.email}>{userData?.email || "..."}</Text>
            </View>
          </View>

          {/* Cards de estatísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#e4f967', '#d4e957']}
                style={styles.statGradient}
              >
                <Ionicons name="leaf" size={32} color="#0208C7" />
                <Text style={styles.statValue}>12.5 kg</Text>
                <Text style={styles.statLabel}>CO₂ Poupado</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#b2d6f0', '#a2c6e0']}
                style={styles.statGradient}
              >
                <Ionicons name="bicycle" size={32} color="#0208C7" />
                <Text style={styles.statValue}>47</Text>
                <Text style={styles.statLabel}>Viagens</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#ffd4d2', '#ffc4c2']}
                style={styles.statGradient}
              >
                <Ionicons name="time" size={32} color="#e95049" />
                <Text style={styles.statValue}>23h</Text>
                <Text style={styles.statLabel}>Tempo Total</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Menu de opções */}
          <View style={styles.menuContainer}>
            
            {/* 1. EDITAR PERFIL */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push("/editProfile")}
            >
              <View style={styles.menuIconContainer}>
                <LinearGradient
                  colors={['#0208C7', '#0308d7']}
                  style={styles.menuIconGradient}
                >
                  <Ionicons name="person-outline" size={24} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Editar Perfil</Text>
                <Text style={styles.menuSubtitle}>Alterar dados pessoais</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* 2. CONQUISTAS (REWARDS) */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push("/rewards")} // 👈 MUDANÇA AQUI
            >
              <View style={styles.menuIconContainer}>
                <LinearGradient
                  colors={['#e4f967', '#d4e957']}
                  style={styles.menuIconGradient}
                >
                  <Ionicons name="trophy-outline" size={24} color="#0208C7" />
                </LinearGradient>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Conquistas</Text>
                <Text style={styles.menuSubtitle}>Ver badges e recompensas</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* 3. DEFINIÇÕES (ALERTA) */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleSettingsPress} // 👈 MUDANÇA AQUI
            >
              <View style={styles.menuIconContainer}>
                <LinearGradient
                  colors={['#b2d6f0', '#a2c6e0']}
                  style={styles.menuIconGradient}
                >
                  <Ionicons name="settings-outline" size={24} color="#0208C7" />
                </LinearGradient>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Definições</Text>
                <Text style={styles.menuSubtitle}>Preferências e privacidade</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* 4. AJUDA & SUPORTE (LINK EXTERNO) */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleHelpPress} // 👈 MUDANÇA AQUI
            >
              <View style={styles.menuIconContainer}>
                <LinearGradient
                  colors={['#ffd4d2', '#ffc4c2']}
                  style={styles.menuIconGradient}
                >
                  <Ionicons name="help-circle-outline" size={24} color="#e95049" />
                </LinearGradient>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Ajuda & Suporte</Text>
                <Text style={styles.menuSubtitle}>FAQ e contacto</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>

          {/* Botão de logout */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={logout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff4444', '#ff6666']}
              style={styles.logoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="log-out-outline" size={24} color="#fff" />
              <Text style={styles.logoutText}>Terminar Sessão</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Versão do app */}
          <Text style={styles.versionText}>Parkey v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// --- Styles (Não alterados, apenas omitidos para brevidade) ---
const styles = StyleSheet.create({
// ... (mantenha seus estilos originais aqui)
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  loadingContainer: { flex: 1 },
  loadingGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#fff", fontWeight: "600" },
  
  // O Header agora é fixo no topo, fora do ScrollView
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 80,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10, // Garante que fique acima do ScrollView
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255, 255, 255, 0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  settingsButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255, 255, 255, 0.2)", justifyContent: "center", alignItems: "center" },
  
  avatarContainer: { alignItems: "center", marginTop: -20, zIndex: 11 }, // zIndex mais alto para o avatar
  avatarWrapper: { position: "relative" },
  avatarPlaceholder: { position: "absolute", width: 140, height: 140, borderRadius: 70, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", borderWidth: 6, borderColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8, zIndex: 1 },
  slowWarning: { marginTop: 8, fontSize: 10, color: "#666", textAlign: "center" },
  avatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 6, borderColor: "#fff", backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  
  // O ScrollView ocupa o resto da tela
  scrollView: { 
    flex: 1, 
    // Isso garante que o ScrollView comece logo após o header
    // e permite que o conteúdo suba por cima do avatar
    marginTop: -80, 
    zIndex: 1, // ZIndex mais baixo que o header
  },
  contentContainer: { 
    paddingHorizontal: 20, 
    paddingTop: 80, // Adiciona um padding para que o conteúdo não comece no avatar
    paddingBottom: 40 
  },
  
  infoCard: { backgroundColor: "#fff", borderRadius: 24, padding: 24, alignItems: "center", marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  username: { fontSize: 28, fontWeight: "800", color: "#0208C7", marginBottom: 8 },
  name: { fontSize: 18, color: "#333", fontWeight: "600", marginBottom: 12 },
  emailContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  email: { fontSize: 15, color: "#666" },
  statsContainer: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  statGradient: { padding: 16, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800", color: "#000", marginTop: 8 },
  statLabel: { fontSize: 11, color: "#666", marginTop: 4, textAlign: "center" },
  menuContainer: { backgroundColor: "#fff", borderRadius: 24, padding: 8, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  menuIconContainer: { borderRadius: 14, overflow: "hidden" },
  menuIconGradient: { width: 48, height: 48, justifyContent: "center", alignItems: "center" },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: "700", color: "#000" },
  menuSubtitle: { fontSize: 13, color: "#666", marginTop: 2 },
  menuDivider: { height: 1, backgroundColor: "#f0f0f0", marginHorizontal: 16 },
  logoutButton: { borderRadius: 20, overflow: "hidden", marginBottom: 16, shadowColor: "#ff4444", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  logoutGradient: { flexDirection: "row", padding: 18, alignItems: "center", justifyContent: "center", gap: 10 },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  versionText: { textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 8 },
});