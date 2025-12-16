import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// Dados mockup de histórico
const HISTORY_DATA = [
  { id: "1", location: "Parque Parki - Campo Pequeno", locker: "C-42", date: "16 Dez 2024", time: "14:30 - 16:45", duration: "2h 15min", price: "2.50€", status: "completed", co2Saved: "1.2 kg" },
  { id: "2", location: "Parque Parki - Saldanha", locker: "A-15", date: "15 Dez 2024", time: "09:00 - 12:30", duration: "3h 30min", price: "3.50€", status: "completed", co2Saved: "1.8 kg" },
  { id: "3", location: "Parque Parki - Marquês de Pombal", locker: "B-28", date: "14 Dez 2024", time: "18:00 - 19:15", duration: "1h 15min", price: "1.50€", status: "completed", co2Saved: "0.8 kg" },
  { id: "4", location: "Parque Parki - Campo Pequeno", locker: "C-33", date: "13 Dez 2024", time: "11:20 - 14:00", duration: "2h 40min", price: "3.00€", status: "completed", co2Saved: "1.5 kg" },
  { id: "5", location: "Parque Parki - Saldanha", locker: "A-07", date: "12 Dez 2024", time: "08:30 - 09:45", duration: "1h 15min", price: "1.50€", status: "completed", co2Saved: "0.7 kg" },
  { id: "6", location: "Parque Parki - Campo Pequeno", locker: "C-19", date: "11 Dez 2024", time: "16:00 - 18:30", duration: "2h 30min", price: "2.75€", status: "completed", co2Saved: "1.3 kg" },
  { id: "7", location: "Parque Parki - Marquês de Pombal", locker: "B-51", date: "10 Dez 2024", time: "10:15 - 13:45", duration: "3h 30min", price: "3.50€", status: "completed", co2Saved: "1.9 kg" },
];

// Individual history item as a separate component
const HistoryItem = ({ item, index }: { item: any; index: number }) => {
  const itemAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(itemAnim, {
      toValue: 1,
      delay: index * 50,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.historyCard,
        {
          opacity: itemAnim,
          transform: [
            {
              translateY: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={["#ffffff", "#f8f9fa"]}
        style={styles.historyGradient}
      >
        {/* Header do Card */}
        <View style={styles.historyHeader}>
          <View style={styles.lockerBadge}>
            <Ionicons name="cube" size={16} color="#fff" />
            <Text style={styles.lockerText}>{item.locker}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Concluída</Text>
          </View>
        </View>

        {/* Location */}
        <Text style={styles.locationText}>{item.location}</Text>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoLabel}>{item.date}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoLabel}>{item.time}</Text>
          </View>
        </View>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <View style={styles.leftInfo}>
            <View style={styles.durationBadge}>
              <Ionicons name="hourglass-outline" size={14} color="#0208C7" />
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
            <View style={styles.co2Badge}>
              <Ionicons name="leaf" size={14} color="#4CAF50" />
              <Text style={styles.co2Text}>{item.co2Saved}</Text>
            </View>
          </View>
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default function History() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calcula estatísticas totais
  const totalBookings = HISTORY_DATA.length;
  const totalSpent = HISTORY_DATA.reduce(
    (sum, item) => sum + parseFloat(item.price.replace("€", "")),
    0
  ).toFixed(2);
  const totalCO2 = HISTORY_DATA.reduce(
    (sum, item) => sum + parseFloat(item.co2Saved.replace(" kg", "")),
    0
  ).toFixed(1);

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["#0208C7", "#1a1fc9"]}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <Animated.View
        style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>📋</Text>
          <Text style={styles.headerTitle}>Histórico</Text>
          <Text style={styles.headerSubtitle}>
            As tuas últimas {totalBookings} utilizações
          </Text>
        </View>
      </Animated.View>

      {/* Stats Cards */}
      <Animated.View
        style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinearGradient colors={["#e4f967", "#d4e857"]} style={styles.statGradient}>
              <Ionicons name="bicycle" size={24} color="#0208C7" />
              <Text style={styles.statValue}>{totalBookings}</Text>
              <Text style={styles.statLabel}>Viagens</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={["#b2d6f0", "#9ec8e8"]} style={styles.statGradient}>
              <Ionicons name="leaf" size={24} color="#0208C7" />
              <Text style={styles.statValue}>{totalCO2} kg</Text>
              <Text style={styles.statLabel}>CO₂ Poupado</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={["#ffcdd2", "#ef9a9a"]} style={styles.statGradient}>
              <Ionicons name="cash" size={24} color="#e95049" />
              <Text style={styles.statValue}>{totalSpent}€</Text>
              <Text style={styles.statLabel}>Total Gasto</Text>
            </LinearGradient>
          </View>
        </View>
      </Animated.View>

      {/* Filter Tabs */}
      <Animated.View style={[styles.filterContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === "all" && styles.filterTabActive]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text style={[styles.filterText, selectedFilter === "all" && styles.filterTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === "month" && styles.filterTabActive]}
          onPress={() => setSelectedFilter("month")}
        >
          <Text style={[styles.filterText, selectedFilter === "month" && styles.filterTextActive]}>
            Este Mês
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === "week" && styles.filterTabActive]}
          onPress={() => setSelectedFilter("week")}
        >
          <Text style={[styles.filterText, selectedFilter === "week" && styles.filterTextActive]}>
            Esta Semana
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* History List */}
      <FlatList
        data={HISTORY_DATA}
        renderItem={({ item, index }) => <HistoryItem item={item} index={index} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  backgroundGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 280 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, alignItems: "center" },
  backButton: { position: "absolute", top: 60, left: 24, width: 45, height: 45, borderRadius: 22.5, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  headerContent: { alignItems: "center", gap: 8 },
  headerEmoji: { fontSize: 40 },
  headerTitle: { fontSize: 32, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)", fontWeight: "500" },
  statsContainer: { paddingHorizontal: 20, marginBottom: 16 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  statGradient: { padding: 14, alignItems: "center", gap: 6 },
  statValue: { fontSize: 18, fontWeight: "900", color: "#000" },
  statLabel: { fontSize: 10, fontWeight: "700", color: "#666", textAlign: "center" },
  filterContainer: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 16, gap: 8 },
  filterTab: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.5)", alignItems: "center" },
  filterTabActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  filterText: { fontSize: 12, fontWeight: "600", color: "#666" },
  filterTextActive: { color: "#0208C7", fontWeight: "800" },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  historyCard: { borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  historyGradient: { padding: 16, gap: 12 },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lockerBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#0208C7", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  lockerText: { fontSize: 12, fontWeight: "900", color: "#fff", letterSpacing: 0.5 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(76, 175, 80, 0.15)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4CAF50" },
  statusText: { fontSize: 11, fontWeight: "700", color: "#4CAF50" },
  locationText: { fontSize: 16, fontWeight: "800", color: "#000" },
  infoGrid: { flexDirection: "row", gap: 16 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoLabel: { fontSize: 12, fontWeight: "600", color: "#666" },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e0e0e0" },
  leftInfo: { flexDirection: "row", gap: 10 },
  durationBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(2, 8, 199, 0.1)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  durationText: { fontSize: 11, fontWeight: "700", color: "#0208C7" },
  co2Badge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(76, 175, 80, 0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  co2Text: { fontSize: 11, fontWeight: "700", color: "#4CAF50" },
  priceText: { fontSize: 18, fontWeight: "900", color: "#0208C7" },
});
