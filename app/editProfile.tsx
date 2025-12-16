// app/editProfile.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
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
// REMOVIDO: import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
// REMOVIDO: import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { auth, db } from "./firebase"; // REMOVIDO: 'storage'

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
  // REMOVIDO: const [uploadProgress, setUploadProgress] = useState(0);

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  /**
   * NOVA FUNÇÃO: Obtém a imagem da galeria e a salva no Firestore como Base64.
   * AVISO: Esta abordagem é limitada a imagens pequenas (menos de ~800KB) devido ao limite de 1MB do documento do Firestore.
   */
  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para escolher uma foto');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true, // 💡 PEDE O CONTEÚDO DA IMAGEM EM BASE64
      });

      if (!result.canceled && result.assets[0].base64) {
        await saveBase64Image(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Erro ao escolher imagem:', error);
      Alert.alert('Erro', 'Não foi possível escolher a imagem');
    }
  };

  // REMOVIDA: A função uploadImageToFirebase (Não é mais necessária)

  const saveBase64Image = async (base64String: string) => {
    // 800000 bytes é uma margem segura para o limite de 1MB do Firestore (depois da codificação Base64)
    if (base64String.length > 800000) {
      Alert.alert(
        "Aviso de Limite", 
        "A imagem é muito grande. O Firestore tem um limite de 1MB por documento. Por favor, escolha uma imagem menor."
      );
      return;
    }
    
    // Converte Base64 para Data URI para que o componente <Image> possa renderizar.
    const base64Url = `data:image/jpeg;base64,${base64String}`;
    
    setSaving(true);
    try {
      const userId = auth.currentUser!.uid;

      // Salva a string Base64 completa no campo 'avatar' do Firestore
      await updateDoc(doc(db, "users", userId), { avatar: base64Url });

      setAvatar(base64Url);
      setShowAvatarPicker(false);
      Alert.alert("Sucesso", "Foto de perfil atualizada!");
      
    } catch (error) {
      console.error('Erro ao salvar Base64:', error);
      Alert.alert('Erro', 'Não foi possível salvar a imagem no banco de dados. Tente uma imagem menor.');
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
      const cleanSeed = newAvatarSeed.split('-')[0].trim().toLowerCase();
      const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${cleanSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
      await updateDoc(doc(db, "users", auth.currentUser!.uid), { avatar: newAvatarUrl });
      setAvatar(newAvatarUrl);
      setShowAvatarPicker(false);
      Alert.alert("Sucesso", "Avatar atualizado!");
    } catch (error) {
      console.error("Erro ao trocar avatar:", error);
      Alert.alert("Erro", "Não foi possível trocar o avatar");
    } finally {
      setSaving(false);
    }
  };

  // ... (Restante das funções de salvar dados e trocar senha) ...
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
        { text: "OK", onPress: () => router.back() }
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
      const credential = EmailAuthProvider.credential(auth.currentUser!.email!, currentPassword);
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
      if (error.code === "auth/wrong-password") message = "Senha atual incorreta";
      Alert.alert("Erro", message);
    } finally {
      setSaving(false);
    }
  };
  // ... (Fim das funções) ...


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0208C7', '#b2d6f0']} style={styles.loadingGradient}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>A carregar...</Text>
        </LinearGradient>
      </View>
    );
  }

  const displayAvatar = showAvatarPicker
    ? `https://api.dicebear.com/7.x/avataaars/png?seed=${newAvatarSeed.trim().toLowerCase()}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
    : avatar.replace('/svg?', '/png?');

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0208C7', '#e95049']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                {/* 💡 REMOVIDO: Condição de uploadProgress */}
                {saving && !showAvatarPicker ? (
                  // Usar um ActivityIndicator simples durante o salvamento Base64
                  <View style={styles.avatarPlaceholder}>
                    <ActivityIndicator size="large" color="#0208C7" />
                    <Text style={styles.uploadText}>A salvar...</Text>
                  </View>
                ) : (
                  <Image source={{ uri: displayAvatar }} style={styles.avatar} />
                )}
              </View>

              <View style={styles.avatarButtons}>
                <TouchableOpacity style={styles.avatarOption} onPress={pickImageFromGallery} disabled={saving}>
                  <LinearGradient colors={['#0208C7', '#0308d7']} style={styles.avatarOptionGradient}>
                    <Ionicons name="images" size={24} color="#fff" />
                    <Text style={styles.avatarOptionText}>Da Galeria</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.avatarOption} onPress={() => setShowAvatarPicker(!showAvatarPicker)} disabled={saving}>
                  <LinearGradient colors={['#e95049', '#ff6b63']} style={styles.avatarOptionGradient}>
                    <Ionicons name="color-palette" size={24} color="#fff" />
                    <Text style={styles.avatarOptionText}>Avatar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Avatar Generator */}
            {showAvatarPicker && (
              <View style={styles.card}>
                <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.cardGradient}>
                  <Text style={styles.cardTitle}>Gerar Avatar</Text>
                  <Text style={styles.cardSubtitle}>Clica no botão para gerar um avatar aleatório</Text>

                  <TouchableOpacity style={styles.generateButton} onPress={() => {
                    const words = ['cool', 'happy', 'star', 'moon', 'sun', 'sky', 'ocean', 'fire', 'ice', 'wind', 'storm', 'cloud', 'rain', 'snow'];
                    const randomWord = words[Math.floor(Math.random() * words.length)];
                    const randomNum = Math.floor(Math.random() * 9999);
                    setNewAvatarSeed(`${randomWord}${randomNum}`);
                  }} disabled={saving}>
                    <LinearGradient colors={['#e4f967', '#d4e957']} style={styles.buttonGradient}>
                      <Ionicons name="refresh" size={20} color="#0208C7" />
                      <Text style={styles.generateButtonText}>Gerar Novo</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.confirmButton} onPress={changeAvatar} disabled={saving || !newAvatarSeed}>
                    <LinearGradient colors={['#0208C7', '#0308d7']} style={styles.buttonGradient}>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                      <Text style={styles.confirmButtonText}>{saving ? "A guardar..." : "Confirmar"}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}

            {/* Personal Data Card */}
            <View style={styles.card}>
              <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.cardGradient}>
                <Text style={styles.cardTitle}>Dados Pessoais</Text>

                {/* Nome */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#666" />
                    <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Primeiro nome" placeholderTextColor="#999" />
                  </View>
                </View>

                {/* Apelido */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Apelido</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#666" />
                    <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Último nome" placeholderTextColor="#999" />
                  </View>
                </View>

                {/* Username */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Username</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="at" size={20} color="#666" />
                    <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Username" autoCapitalize="none" placeholderTextColor="#999" />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#666" />
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@exemplo.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#999" />
                  </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={saveChanges} disabled={saving}>
                  <LinearGradient colors={['#0208C7', '#0308d7']} style={styles.buttonGradient}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>{saving ? "A guardar..." : "Guardar Alterações"}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Password Card */}
            <View style={styles.card}>
              <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.cardGradient}>
                <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPasswordSection(!showPasswordSection)}>
                  <View style={styles.passwordToggleContent}>
                    <Ionicons name={showPasswordSection ? "lock-open" : "lock-closed"} size={24} color="#0208C7" />
                    <Text style={styles.passwordToggleText}>{showPasswordSection ? "Cancelar" : "Alterar Senha"}</Text>
                  </View>
                  <Ionicons name={showPasswordSection ? "chevron-up" : "chevron-down"} size={24} color="#666" />
                </TouchableOpacity>

                {showPasswordSection && (
                  <View style={styles.passwordSection}>
                    {/* Senha Atual */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Senha Atual</Text>
                      <View style={styles.inputContainer}>
                        <Ionicons name="key-outline" size={20} color="#666" />
                        <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} placeholder="Senha atual" secureTextEntry placeholderTextColor="#999" />
                      </View>
                    </View>

                    {/* Nova Senha */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Nova Senha</Text>
                      <View style={styles.inputContainer}>
                        <Ionicons name="key-outline" size={20} color="#666" />
                        <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="Nova senha (mínimo 6)" secureTextEntry placeholderTextColor="#999" />
                      </View>
                    </View>

                    {/* Confirmar Senha */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Confirmar Senha</Text>
                      <View style={styles.inputContainer}>
                        <Ionicons name="key-outline" size={20} color="#666" />
                        <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirma a nova senha" secureTextEntry placeholderTextColor="#999" />
                      </View>
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={changePassword} disabled={saving}>
                      <LinearGradient colors={['#e95049', '#ff6b63']} style={styles.buttonGradient}>
                        <Ionicons name="shield-checkmark" size={20} color="#fff" />
                        <Text style={styles.saveButtonText}>{saving ? "A alterar..." : "Confirmar Nova Senha"}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </LinearGradient>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1 },
  loadingGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#fff", fontWeight: "600" },
  headerGradient: { paddingTop: 50, paddingBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255, 255, 255, 0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  keyboardView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  content: { padding: 20 },
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatarWrapper: { marginBottom: 20 },
  // 💡 ESTILOS ATUALIZADOS para o indicador de salvamento Base64
  avatarPlaceholder: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8, borderWidth: 6, borderColor: "#0208C7" },
  uploadText: { position: "absolute", fontSize: 14, fontWeight: "700", color: "#0208C7", bottom: 10 },
  // FIM DA ATUALIZAÇÃO DE ESTILOS
  avatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 6, borderColor: "#fff", backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  avatarButtons: { flexDirection: "row", gap: 12 },
  avatarOption: { borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  avatarOptionGradient: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 20 },
  avatarOptionText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  card: { borderRadius: 24, overflow: "hidden", marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  cardGradient: { padding: 20 },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#000", marginBottom: 8 },
  cardSubtitle: { fontSize: 14, color: "#666", marginBottom: 16, textAlign: "center" },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", color: "#000", marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 16, borderWidth: 2, borderColor: "#e0e0e0", gap: 12 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: "#000" },
  generateButton: { borderRadius: 14, overflow: "hidden", marginBottom: 12 },
  confirmButton: { borderRadius: 14, overflow: "hidden" },
  saveButton: { borderRadius: 14, overflow: "hidden", marginTop: 8 },
  buttonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  generateButtonText: { color: "#0208C7", fontSize: 16, fontWeight: "800" },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  passwordToggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  passwordToggleContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  passwordToggleText: { fontSize: 16, fontWeight: "700", color: "#0208C7" },
  passwordSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#e0e0e0" },
});