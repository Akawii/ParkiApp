// app/editProfile.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "./firebase";

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [newAvatarSeed, setNewAvatarSeed] = useState("");

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace("/login");
      return;
    }
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDoc = await getDocs(
        query(collection(db, "users"), where("__name__", "==", auth.currentUser!.uid))
      );
      
      if (!userDoc.empty) {
        const data = userDoc.docs[0].data();
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setUsername(data.username || "");
        setEmail(data.email || "");
        setAvatar(data.avatar || "");
        setNewAvatarSeed(data.username || "");
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados");
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim()) {
      return Alert.alert("Erro", "Preenche todos os campos obrigatórios");
    }

    setSaving(true);
    try {
      const userId = auth.currentUser!.uid;
      
      const currentUserDoc = await getDocs(
        query(collection(db, "users"), where("__name__", "==", userId))
      );
      const currentUsername = currentUserDoc.docs[0].data().username;
      
      if (username.toLowerCase() !== currentUsername) {
        const usernameQuery = await getDocs(
          query(collection(db, "users"), where("username", "==", username.toLowerCase().trim()))
        );
        if (!usernameQuery.empty) {
          setSaving(false);
          return Alert.alert("Erro", "Este username já está em uso");
        }
      }

      await updateDoc(doc(db, "users", userId), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
      });

      if (email.toLowerCase().trim() !== auth.currentUser!.email) {
        await updateEmail(auth.currentUser!, email.toLowerCase().trim());
      }

      Alert.alert("Sucesso", "Dados atualizados!", [
        { 
          text: "OK", 
          onPress: () => router.back()
        }
      ]);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      let message = "Não foi possível salvar as alterações";
      if (error.code === "auth/requires-recent-login") {
        message = "Por segurança, faz login novamente para alterar o email";
      }
      Alert.alert("Erro", message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert("Erro", "Preenche todos os campos de senha");
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert("Erro", "As senhas não coincidem");
    }

    if (newPassword.length < 6) {
      return Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres");
    }

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser!.email!,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser!, credential);

      await updatePassword(auth.currentUser!, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);

      Alert.alert("Sucesso", "Senha alterada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao trocar senha:", error);
      let message = "Não foi possível alterar a senha";
      if (error.code === "auth/wrong-password") {
        message = "Senha atual incorreta";
      }
      Alert.alert("Erro", message);
    } finally {
      setSaving(false);
    }
  };

  const changeAvatar = async () => {
    if (!newAvatarSeed.trim()) {
      return Alert.alert("Erro", "Gera um avatar primeiro");
    }

    setSaving(true);
    try {
      // Remove qualquer timestamp do seed para guardar limpo
      const cleanSeed = newAvatarSeed.split('-')[0].trim().toLowerCase();
      
      // Guarda URL limpa no Firebase (SEM timestamp)
      const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${cleanSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
      
      await updateDoc(doc(db, "users", auth.currentUser!.uid), {
        avatar: newAvatarUrl,
      });

      setAvatar(newAvatarUrl);
      setShowAvatarPicker(false);
      
      Alert.alert("Sucesso", "Avatar atualizado!", [
        { 
          text: "OK", 
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error("Erro ao trocar avatar:", error);
      Alert.alert("Erro", "Não foi possível trocar o avatar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066ff" />
      </View>
    );
  }

  const displayAvatar = showAvatarPicker 
    ? `https://api.dicebear.com/7.x/avataaars/png?seed=${newAvatarSeed.trim().toLowerCase()}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
    : avatar.replace('/svg?', '/png?');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0066ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.avatarSection}>
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          <TouchableOpacity 
            style={styles.avatarButton}
            onPress={() => setShowAvatarPicker(!showAvatarPicker)}
          >
            <Text style={styles.avatarButtonText}>
              {showAvatarPicker ? "Cancelar" : "Alterar Imagem"}
            </Text>
          </TouchableOpacity>
        </View>

        {showAvatarPicker && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Alterar Avatar</Text>
            <Text style={styles.subtitle}>
              Clica no botão para gerar um novo avatar aleatório
            </Text>
            <TouchableOpacity 
              style={styles.btnPrimary}
              onPress={() => {
                // Gera seed aleatória com palavras + número
                const words = ['cool', 'happy', 'star', 'moon', 'sun', 'sky', 'ocean', 'fire', 'ice', 'wind', 'storm', 'cloud', 'rain', 'snow'];
                const randomWord = words[Math.floor(Math.random() * words.length)];
                const randomNum = Math.floor(Math.random() * 9999);
                setNewAvatarSeed(`${randomWord}${randomNum}`);
              }}
              disabled={saving}
            >
              <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnPrimaryText}>Gerar Nova Imagem</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.btnPrimary, { backgroundColor: "#28a745", marginTop: 12 }]}
              onPress={changeAvatar}
              disabled={saving || !newAvatarSeed}
            >
              <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnPrimaryText}>
                {saving ? "A guardar..." : "Confirmar Avatar"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Primeiro nome"
          />

          <Text style={styles.label}>Apelido</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Último nome"
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity 
            style={styles.btnPrimary}
            onPress={saveChanges}
            disabled={saving}
          >
            <Text style={styles.btnPrimaryText}>
              {saving ? "A guardar..." : "Guardar Alterações"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.btnSecondary}
            onPress={() => setShowPasswordSection(!showPasswordSection)}
          >
            <Text style={styles.btnSecondaryText}>
              {showPasswordSection ? "Cancelar Troca de Senha" : "Alterar Senha"}
            </Text>
          </TouchableOpacity>

          {showPasswordSection && (
            <View style={styles.passwordSection}>
              <Text style={styles.label}>Senha Atual</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Senha atual"
                secureTextEntry
              />

              <Text style={styles.label}>Nova Senha</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nova senha (mínimo 6 caracteres)"
                secureTextEntry
              />

              <Text style={styles.label}>Confirmar Nova Senha</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirma a nova senha"
                secureTextEntry
              />

              <TouchableOpacity 
                style={styles.btnPrimary}
                onPress={changePassword}
                disabled={saving}
              >
                <Text style={styles.btnPrimaryText}>
                  {saving ? "A alterar..." : "Confirmar Nova Senha"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#fff",
  },
  avatarButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#0066ff",
  },
  avatarButtonText: {
    color: "#0066ff",
    fontSize: 15,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  btnPrimary: {
    backgroundColor: "#0066ff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  btnSecondary: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0066ff",
  },
  btnSecondaryText: {
    color: "#0066ff",
    fontSize: 16,
    fontWeight: "bold",
  },
  passwordSection: {
    marginTop: 16,
  },
});