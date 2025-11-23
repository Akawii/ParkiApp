// app/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "./firebase";
import { logoutUser } from "./services/authService";

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [avatarKey, setAvatarKey] = useState(0);
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  // Recarrega SEMPRE que a página ganhar foco
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

  // Timeout para avisar se a imagem demorar muito
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
        
        // Força reload da imagem DEPOIS de definir userData
        // Adiciona timestamp para forçar bypass do cache
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
          await logoutUser(); // <--- AGORA USA A FUNÇÃO DO AUTHSERVICE
          router.replace("/login");
        } catch (error) {
          Alert.alert("Erro", "Não foi possível sair");
        }
      }
    }
  ]);
};

  // Só mostra loading geral se não tiver dados ainda
  if (loading && !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066ff" />
        <Text style={styles.loadingText}>A carregar perfil...</Text>
      </View>
    );
  }

  const avatar = userData?.avatar?.replace('/svg?', '/png?');
  
  // Adiciona timestamp único para forçar reload e evitar cache ruim
  const avatarWithTimestamp = avatar ? `${avatar}&t=${avatarKey}` : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0066ff" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarBox}>
        {/* Mostra loading só no avatar */}
        {imageLoading && (
          <View style={styles.avatarPlaceholder}>
            <ActivityIndicator size="large" color="#0066ff" />
            {showSlowWarning && (
              <Text style={styles.slowWarning}>A carregar...</Text>
            )}
          </View>
        )}
        
        {avatar ? (
          <Image 
            key={`avatar-${avatarKey}`}
            source={avatarWithTimestamp ? { uri: avatarWithTimestamp } : undefined} 
            style={[styles.avatar, imageLoading && { opacity: 0 }]}
            onLoadStart={() => {
              console.log("🖼️ Começando a carregar imagem...", avatarWithTimestamp);
              setImageLoading(true);
            }}
            onLoad={() => {
              console.log("✅ Imagem carregada com sucesso!");
              setImageLoading(false);
              setShowSlowWarning(false);
            }}
            onError={(error) => {
              console.log('❌ Erro ao carregar avatar:', error.nativeEvent.error);
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

      {/* Dados aparecem mesmo se a imagem ainda não carregou */}
      <View style={styles.card}>
        <Text style={styles.username}>@{userData?.username || "..."}</Text>
        <Text style={styles.name}>
          {userData?.firstName || "..."} {userData?.lastName || "..."}
        </Text>
        <Text style={styles.email}>{userData?.email || "..."}</Text>
      </View>

      <TouchableOpacity 
        style={styles.btn}
        onPress={() => router.push("/editProfile")}
      >
        <Text style={styles.btnText}>Alterar Dados</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f8f9fa"
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666"
  },
  header: { 
    paddingTop: 50, 
    paddingHorizontal: 24,
    paddingBottom: 10
  },
  backButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8 
  },
  backText: { 
    fontSize: 17, 
    color: "#0066ff", 
    fontWeight: "600" 
  },
  avatarBox: { 
    alignItems: "center", 
    paddingTop: 20,
    position: "relative",
    minHeight: 196
  },
  avatarPlaceholder: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 8,
    borderColor: "#fff",
    zIndex: 1
  },
  slowWarning: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    textAlign: "center"
  },
  avatar: { 
    width: 180, 
    height: 180, 
    borderRadius: 90, 
    borderWidth: 8, 
    borderColor: "#fff",
    backgroundColor: "#fff"
  },
  card: { 
    backgroundColor: "#fff", 
    margin: 24, 
    padding: 32, 
    borderRadius: 24, 
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  username: { 
    fontSize: 32, 
    fontWeight: "bold", 
    color: "#0066ff" 
  },
  name: { 
    fontSize: 20, 
    marginTop: 8, 
    color: "#333" 
  },
  email: { 
    fontSize: 17, 
    marginTop: 8, 
    color: "#555" 
  },
  btn: { 
    backgroundColor: "#0066ff", 
    marginHorizontal: 24, 
    padding: 18, 
    borderRadius: 16, 
    alignItems: "center",
    shadowColor: "#0066ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  btnText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  logout: { 
    backgroundColor: "#fff", 
    marginHorizontal: 24, 
    marginTop: 16, 
    marginBottom: 60, 
    padding: 18, 
    borderRadius: 16, 
    alignItems: "center", 
    borderWidth: 2, 
    borderColor: "#ff4444" 
  },
  logoutText: { 
    color: "#ff4444", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
});