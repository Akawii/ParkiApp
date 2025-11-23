import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "./firebase";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Conta criada!");
      setScreen("login");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logado com sucesso!");
      // Aqui você pode navegar para outra tela
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{screen === "login" ? "Login" : "Registrar Conta"}</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Senha"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {screen === "login" ? (
        <>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen("register")}>
            <Text style={styles.link}>Criar conta</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen("login")}>
            <Text style={styles.link}>Já tem conta? Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, marginBottom: 20 },
  input: { width: "100%", padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
  button: { width: "100%", padding: 15, backgroundColor: "#4A6741", borderRadius: 8, alignItems: "center", marginBottom: 10 },
  buttonText: { color: "white", fontWeight: "bold" },
  link: { color: "#FF6B6B", marginTop: 5 }
});
