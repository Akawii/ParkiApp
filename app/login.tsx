// app/login.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { loginUser, onAuthChange } from "./services/authService";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação panorâmica do background
    const panAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -50,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );
    panAnimation.start();

    return () => panAnimation.stop();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        console.log("✅ Usuário autenticado, redirecionando...");
        router.replace("/home");
      } else {
        console.log("❌ Nenhum usuário autenticado");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!identifier || !password) {
      return Alert.alert("Erro", "Preenche todos os campos");
    }

    setLoading(true);
    try {
      await loginUser(identifier.trim(), password);
      console.log("✅ Login bem-sucedido");
    } catch (err: any) {
      console.error("❌ Erro no login:", err);
      const message = err?.message || err?.error || "Não foi possível entrar";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.animatedBackground,
          {
            transform: [{ translateX }],
          }
        ]}
      >
        <ImageBackground 
          source={require('../assets/images/lisbon.png')} 
          style={styles.backgroundImage}
          blurRadius={2}
          resizeMode="cover"
        />
      </Animated.View>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              {/* Logo Area */}
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../assets/images/logo.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.subtitle}>Tranca e Descansa</Text>
              </View>

              {/* Form Card */}
              <View style={styles.card}>
                <Text style={styles.welcomeText}>Iniciar Sessão</Text>
                
                <TextInput
                  placeholder="Email ou Username"
                  placeholderTextColor="#999"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />

                <TextInput
                  placeholder="Senha"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                />

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#e95049', '#ff6b63']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? "A entrar..." : "Entrar"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/register")}
                  style={styles.linkContainer}
                >
                  <Text style={styles.linkText}>
                    Ainda não tens conta?{" "}
                    <Text style={styles.linkBold}>Regista-te agora</Text>
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Decorative Elements */}
              <View style={styles.bottomDecor}>
                <View style={styles.decorCircle1} />
                <View style={styles.decorCircle2} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  animatedBackground: {
    position: 'absolute',
    width: '120%',
    height: '100%',
    left: 0,
    top: 0,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: '#0209c744',
  },
  keyboardView: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoImage: {
    width: 280,
    height: 80,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    color: "#000000",
    marginTop: 4,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f8f9fa",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#000",
    color: "#000",
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: "#e95049",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    padding: 18,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  linkText: {
    fontSize: 15,
    color: "#666",
  },
  linkBold: {
    color: "#e95049",
    fontWeight: "bold",
  },
  bottomDecor: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  decorCircle1: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(228, 249, 103, 0.15)',
    position: 'absolute',
    left: -30,
    bottom: -20,
  },
  decorCircle2: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(233, 80, 73, 0.15)',
    position: 'absolute',
    right: 20,
    bottom: -40,
  },
});
