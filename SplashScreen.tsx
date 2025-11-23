// SplashScreen.tsx  ← na RAIZ do projeto!!
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withTiming(1, { duration: 1000 });

    setTimeout(() => router.replace("/login"), 2200);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Image
          source={require("assets/images/Cicla.png")}   // ← Caminho correto da raiz!
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>PARKI</Text>
        <Text style={styles.subtitle}>Estacionamento Inteligente</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0066ff", justifyContent: "center", alignItems: "center" },
  logo: { width: 160, height: 160, marginBottom: 20 },
  title: { fontSize: 58, fontWeight: "900", color: "#fff", letterSpacing: 5 },
  subtitle: { fontSize: 19, color: "#fff", marginTop: 10 },
});