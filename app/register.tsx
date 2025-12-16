// app/register.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { registerUser } from "./services/authService";

export default function Register() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Animações wild! 🎪 (mantidas exceto logo)
  const translateX = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Background panorâmico
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -50,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotação sutil dos círculos decorativos
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Floating animations para os elementos decorativos
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: -20,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 15,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim3, {
          toValue: -25,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim3, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleRegister = async () => {
    if (!username || !firstName || !lastName || !email || !password) {
      return Alert.alert("Erro", "Preenche todos os campos");
    }
    if (password.length < 6) {
      return Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
    }

    setLoading(true);
    const result = await registerUser(
      username,
      firstName,
      lastName,
      email.trim().toLowerCase(),
      password
    );
    setLoading(false);

    if (result.success) {
      Alert.alert("Sucesso!", "Conta criada com sucesso", [
        { text: "Continuar", onPress: () => router.replace("/home") },
      ]);
    } else {
      Alert.alert("Erro", result.error || "Não foi possível criar conta");
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background animado */}
      <Animated.View 
        style={[
          styles.animatedBackground,
          { transform: [{ translateX }] }
        ]}
      >
        <ImageBackground 
          source={require('../assets/images/lisbon.png')} 
          style={styles.backgroundImage}
          blurRadius={3}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Gradient overlay */}
      <LinearGradient
        colors={[
          'rgba(2, 8, 199, 0.7)',
          'rgba(178, 214, 240, 0.5)',
          'rgba(233, 80, 73, 0.6)'
        ]}
        style={styles.gradientOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Elementos decorativos flutuantes */}
      <Animated.View 
        style={[
          styles.floatingCircle1,
          { 
            transform: [
              { translateY: floatAnim1 },
              { rotate }
            ]
          }
        ]}
      />
      <Animated.View 
        style={[
          styles.floatingCircle2,
          { transform: [{ translateY: floatAnim2 }] }
        ]}
      />
      <Animated.View 
        style={[
          styles.floatingCircle3,
          { transform: [{ translateY: floatAnim3 }] }
        ]}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo estático */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>Junta-te à Revolução!</Text>
          </View>

          {/* Card principal */}
          <View style={styles.card}>
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.cardGradient}
            >
              <Text style={styles.welcomeText}>Criar Conta</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  placeholder="Username"
                  placeholderTextColor="#999"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Text style={styles.inputLabel}>Nome</Text>
                  <TextInput
                    placeholder="Nome"
                    placeholderTextColor="#999"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.input}
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Text style={styles.inputLabel}>Apelido</Text>
                  <TextInput
                    placeholder="Apelido"
                    placeholderTextColor="#999"
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  placeholder="teu@email.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Senha</Text>
                <TextInput
                  placeholder="mínimo 6 caracteres"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#e95049', '#ff6b63', '#e95049']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "A criar..." : "Criar Conta"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push("/login")} 
                style={styles.linkContainer}
              >
                <Text style={styles.linkText}>
                  Já tens conta?{" "}
                  <Text style={styles.linkBold}>Faz login aqui</Text>
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.funFact}>
            <Text style={styles.funFactText}>
              Sabias que pedalar 10km poupa 1.5kg de CO₂?
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoImage: {
    width: 260,
    height: 75,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  card: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  cardGradient: {
    padding: 24,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000000ff",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000ff",
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#000000",
    color: "#000",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 12,
    shadowColor: "#e95049",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    padding: 20,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    fontSize: 15,
    color: "#666",
  },
  linkBold: {
    color: "#0208C7",
    fontWeight: "bold",
  },
  funFact: {
    marginTop: 24,
    backgroundColor: '#b2d6f0',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  funFactText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0208C7',
    textAlign: 'center',
  },
  floatingCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: 100,
    right: -50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  floatingCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(235, 150, 145, 0.25)',
    bottom: 150,
    left: -30,
  },
  floatingCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(178, 214, 240, 0.3)',
    top: 300,
    left: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});
