// app/register.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
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

  const handleRegister = async () => {
    if (!username || !firstName || !lastName || !email || !password) {
      return Alert.alert("Erro", "Preenche todos os campos");
    }
    if (password.length < 6) return Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");

    setLoading(true);
    const result = await registerUser(username, firstName, lastName, email.trim().toLowerCase(), password);
    setLoading(false);

    if (result.success) {
      Alert.alert("Sucesso!", "Conta criada com sucesso", [
        { text: "OK", onPress: () => router.replace("/home") },
      ]);
    } else {
      Alert.alert("Erro", result.error || "Não foi possível criar conta");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <Text style={styles.title}>PARKI</Text>

      <TextInput placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Nome" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput placeholder="Apelido" value={lastName} onChangeText={setLastName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Senha (mín. 6)" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "A criar..." : "Criar conta"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")} style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Já tens conta? <Text style={styles.bold}>Faz login</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 30, justifyContent: "center" },
  title: { fontSize: 52, fontWeight: "900", color: "#0066ff", textAlign: "center", marginBottom: 60 },
  input: { backgroundColor: "#f5f5f5", padding: 18, borderRadius: 14, marginBottom: 16, fontSize: 17 },
  button: { backgroundColor: "#0066ff", padding: 18, borderRadius: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkContainer: { marginTop: 30, alignItems: "center" },
  linkText: { fontSize: 16, color: "#666" },
  bold: { color: "#0066ff", fontWeight: "bold" },
});