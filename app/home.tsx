// app/home.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* MAPA DE LISBOA */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 38.7223,
          longitude: -9.1393,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        <Marker
          coordinate={{ latitude: 38.7223, longitude: -9.1393 }}
          title="Parque Parki"
          description="O teu estacionamento inteligente"
        />
      </MapView>

      {/* BARRA INFERIOR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="home" size={28} color="#0066ff" />
          <Text style={styles.tabTextActive}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => router.push("/parking")}>
          <Ionicons name="bicycle" size={28} color="#aaa" />
          <Text style={styles.tabText}>Estacionar</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="time-outline" size={28} color="#aaa" />
          <Text style={styles.tabText}>Histórico</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => router.push("/profile")}>
          <Ionicons name="person" size={28} color="#aaa" />
          <Text style={styles.tabText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { flex: 1 },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    justifyContent: "space-around",
  },
  tabButton: { alignItems: "center" },
  tabText: { marginTop: 4, fontSize: 12, color: "#aaa" },
  tabTextActive: { marginTop: 4, fontSize: 12, color: "#0066ff", fontWeight: "bold" },
});