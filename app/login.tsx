// app/login.tsx
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { loginUser, onAuthChange } from "./services/authService";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      // O onAuthChange já vai redirecionar para /home
    } catch (err: any) {
      console.error("❌ Erro no login:", err);
      const message = err?.message || err?.error || "Não foi possível entrar";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>PARKI</Text>

        <TextInput
          placeholder="Email ou Username"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "A entrar..." : "Entrar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            Ainda não tens conta?{" "}
            <Text style={styles.bold}>Regista-te agora</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  inner: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
  },
  title: {
    fontSize: 52,
    fontWeight: "900",
    color: "#0066ff",
    textAlign: "center",
    marginBottom: 60,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 17,
  },
  button: {
    backgroundColor: "#0066ff",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  linkText: {
    fontSize: 16,
    color: "#666",
  },
  bold: {
    color: "#0066ff",
    fontWeight: "bold",
  },
});