import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// --- Definição de Tipos (Interfaces) ---
interface Reward {
    id: string;
    title: string;
    description: string;
    icon: string;
    points: number;
    colors: readonly [string, string, ...string[]]; // Usar readonly string[] ou o tipo exato
    available: boolean;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    colors: readonly [string, string, ...string[]]; // Usar readonly string[] ou o tipo exato
    iconColor: string;
    points: number;
    unlocked: boolean;
    date?: string;
    progress?: number;
    total?: number;
}
// ----------------------------------------------------

// Dados mockup (MANTIDOS)
const ACHIEVEMENTS: Achievement[] = [
    { id: "1", title: "Primeiro Pedal", description: "Completaste a tua primeira reserva", icon: "bicycle", colors: ["#e4f967", "#d4e857"] as const, iconColor: "#0208C7", points: 50, unlocked: true, date: "10 Dez 2024" },
    { id: "2", title: "Eco Warrior", description: "Poupaste 10kg de CO₂", icon: "leaf", colors: ["#4CAF50", "#66BB6A"] as const, iconColor: "#fff", points: 100, unlocked: true, date: "14 Dez 2024" },
    { id: "3", title: "Ciclista Regular", description: "Completaste 10 viagens", icon: "trophy", colors: ["#FFB74D", "#FFA726"] as const, iconColor: "#fff", points: 150, unlocked: true, date: "15 Dez 2024" },
    { id: "4", title: "Madrugador", description: "Estaciona antes das 8h", icon: "sunny", colors: ["#b2d6f0", "#9ec8e8"] as const, iconColor: "#0208C7", points: 75, unlocked: false, progress: 2, total: 5 },
    { id: "5", title: "Explorador Urbano", description: "Usa 5 parques diferentes", icon: "map", colors: ["#e95049", "#ff6b63"] as const, iconColor: "#fff", points: 200, unlocked: false, progress: 3, total: 5 },
    { id: "6", title: "Sustentável", description: "Poupa 50kg de CO₂", icon: "earth", colors: ["#9C27B0", "#BA68C8"] as const, iconColor: "#fff", points: 500, unlocked: false, progress: 12.5, total: 50 },
];
// NOTE: Também alterei a chave de 'color' para 'colors' nos dados para evitar conflitos na próxima etapa.

const REWARDS: Reward[] = [
    { id: "1", title: "1h Grátis", description: "Uma hora de estacionamento gratuito", icon: "time", colors: ["#e4f967", "#d4e857"] as const, points: 500, available: true },
    { id: "2", title: "Café Oferecido", description: "Café grátis em parceiros Parki", icon: "cafe", colors: ["#FFB74D", "#FFA726"] as const, points: 300, available: true },
    { id: "3", title: "Desconto 20%", description: "20% off na próxima reserva", icon: "pricetag", colors: ["#e95049", "#ff6b63"] as const, points: 750, available: false },
    { id: "4", title: "Upgrade Premium", description: "1 mês de acesso premium", icon: "star", colors: ["#9C27B0", "#BA68C8"] as const, points: 2000, available: false },
];
// NOTE: Também alterei a chave de 'color' para 'colors' nos dados.

// --- NOVO COMPONENTE: AchievementCard ---
const AchievementCard: React.FC<{ item: Achievement; index: number }> = ({ item, index }) => {
    const itemAnim = useRef(new Animated.Value(0)).current; // HOOK AQUI
    
    // Efeito de entrada
    useEffect(() => { // HOOK AQUI
        Animated.spring(itemAnim, { 
            toValue: 1, 
            delay: index * 80, 
            tension: 50, 
            friction: 8, 
            useNativeDriver: true 
        }).start();
    }, [itemAnim, index]);

    const progressPercent = item.progress && item.total ? (item.progress / item.total) * 100 : 0;

    return (
        <Animated.View
            key={item.id}
            style={[
                styles.achievementCard,
                { opacity: itemAnim, transform: [{ scale: itemAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] },
            ]}
        >
            <LinearGradient 
                colors={item.unlocked ? item.colors : ["#e0e0e0", "#bdbdbd"]} 
                style={styles.achievementGradient}
            >
                <View style={styles.achievementIcon}>
                    <Ionicons name={item.icon as any} size={28} color={item.unlocked ? item.iconColor : "#999"} />
                </View>
                <View style={styles.achievementContent}>
                    <Text style={[styles.achievementTitle, !item.unlocked && styles.achievementTitleLocked]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[styles.achievementDescription, !item.unlocked && styles.achievementDescriptionLocked]} numberOfLines={2}>
                        {item.description}
                    </Text>
                    {item.unlocked ? (
                        <View style={styles.unlockedBadge}>
                            <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                            <Text style={styles.unlockedText}>{item.date}</Text>
                        </View>
                    ) : (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{item.progress || 0}/{item.total || 0}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.pointsBadge}>
                    <Text style={styles.achievementPointsValue}>+{item.points}</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

// --- NOVO COMPONENTE: RewardCard ---
const RewardCard: React.FC<{ item: Reward; index: number; currentPoints: number; onRedeem: (reward: Reward) => void }> = ({ item, index, currentPoints, onRedeem }) => {
    const itemAnim = useRef(new Animated.Value(0)).current; // HOOK AQUI
    
    // Efeito de entrada
    useEffect(() => { // HOOK AQUI
        Animated.spring(itemAnim, { 
            toValue: 1, 
            delay: index * 80, 
            tension: 50, 
            friction: 8, 
            useNativeDriver: true 
        }).start();
    }, [itemAnim, index]);

    const canRedeem = currentPoints >= item.points && item.available;

    return (
        <Animated.View
            key={item.id}
            style={[
                styles.rewardCard,
                {
                    opacity: itemAnim,
                    transform: [{ translateY: itemAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                },
            ]}
        >
            <LinearGradient 
                colors={canRedeem ? item.colors : ["#f5f5f5", "#e0e0e0"]} 
                style={styles.rewardGradient}
            >
                <View style={styles.rewardIcon}>
                    <Ionicons name={item.icon as any} size={32} color={canRedeem ? "#fff" : "#999"} />
                </View>
                <View style={styles.rewardContent}>
                    <Text style={[styles.rewardTitle, !canRedeem && styles.rewardTitleLocked]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[styles.rewardDescription, !canRedeem && styles.rewardDescriptionLocked]} numberOfLines={2}>
                        {item.description}
                    </Text>
                    <View style={styles.rewardBottom}>
                        <View style={styles.rewardPointsBadge}>
                            <Ionicons name="diamond" size={16} color="#0208C7" />
                            <Text style={styles.rewardPointsText}>{item.points} pts</Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.redeemButton, !canRedeem && styles.redeemButtonDisabled]} 
                            onPress={() => onRedeem(item)} // Chama a função passada pelo pai
                            disabled={!canRedeem}
                        >
                            <Text style={[styles.redeemText, !canRedeem && styles.redeemTextDisabled]}>
                                {canRedeem ? "Resgatar" : "Bloqueado"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};


// --- COMPONENTE PRINCIPAL: Rewards ---
export default function Rewards() {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState<"achievements" | "rewards">("achievements");
    const [currentPoints, setCurrentPoints] = useState(1247); 
    
    // Animações
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const pointsAnim = useRef(new Animated.Value(0)).current;

    const level = 5;
    const nextLevelPoints = 1500;
    const progressPercentage = (currentPoints / nextLevelPoints) * 100;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
            Animated.timing(pointsAnim, { toValue: currentPoints, duration: 1500, useNativeDriver: true }),
        ]).start();
    }, [currentPoints]); // Dependência atualizada

    // Função de tratamento de Resgate (dentro do componente pai)
    const handleRedeem = (reward: Reward) => {
        Alert.alert(
            "Confirmar Resgate",
            `Deseja realmente resgatar "${reward.title}" por ${reward.points} pontos?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Resgatar",
                    onPress: () => {
                        if (currentPoints >= reward.points) {
                            const newPoints = currentPoints - reward.points;
                            setCurrentPoints(newPoints);
                            Alert.alert("Sucesso!", `Parabéns, resgataste 1 ${reward.title}. Os teus novos pontos são: ${newPoints}.`);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };


    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0208C7", "#1a1fc9", "#e95049"]} style={styles.backgroundGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            
            {/* Header */}
            <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerEmoji}>🏆</Text>
                    <Text style={styles.headerTitle}>Recompensas</Text>
                    <Text style={styles.headerSubtitle}>Ganha pontos e desbloqueia prémios</Text>
                </View>
            </Animated.View>

            {/* Points Card */}
            <Animated.View style={[styles.pointsCard, { opacity: fadeAnim, transform: [{ scale: slideAnim.interpolate({ inputRange: [0, 30], outputRange: [1, 0.95] }) }] }]}>
                <LinearGradient colors={["#e4f967", "#d4e857"]} style={styles.pointsGradient}>
                    <View style={styles.pointsHeader}>
                        <View>
                            <Text style={styles.pointsLabel}>Os Teus Pontos</Text>
                            {/* Pontos atualizados pelo estado */}
                            <Text style={styles.pointsValue}>{currentPoints}</Text> 
                        </View>
                        <View style={styles.levelBadge}>
                            <Ionicons name="star" size={20} color="#0208C7" />
                            <Text style={styles.levelText}>Nível {level}</Text>
                        </View>
                    </View>
                    <View style={styles.progressSection}>
                        <View style={styles.progressInfo}>
                            <Text style={styles.progressLabel}>Progresso para Nível {level + 1}</Text>
                            <Text style={styles.progressNumbers}>{currentPoints} / {nextLevelPoints}</Text>
                        </View>
                        <View style={styles.levelProgressBar}>
                            <View style={[styles.levelProgressFill, { width: `${progressPercentage}%` }]} />
                        </View>
                    </View>
                </LinearGradient>
            </Animated.View>

            {/* Tabs */}
            <Animated.View style={[styles.tabsContainer, { opacity: fadeAnim }]}>
                <TouchableOpacity style={[styles.tab, selectedTab === "achievements" && styles.tabActive]} onPress={() => setSelectedTab("achievements")}>
                    <Ionicons name="trophy" size={20} color={selectedTab === "achievements" ? "#0208C7" : "#999"} />
                    <Text style={[styles.tabText, selectedTab === "achievements" && styles.tabTextActive]}>Conquistas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, selectedTab === "rewards" && styles.tabActive]} onPress={() => setSelectedTab("rewards")}>
                    <Ionicons name="gift" size={20} color={selectedTab === "rewards" ? "#0208C7" : "#999"} />
                    <Text style={[styles.tabText, selectedTab === "rewards" && styles.tabTextActive]}>Prémios</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {selectedTab === "achievements" ? (
                    <View style={styles.achievementsGrid}>
                        {/* Agora renderiza o componente AchievementCard, que contém os Hooks */}
                        {ACHIEVEMENTS.map((item, index) => (
                            <AchievementCard key={item.id} item={item} index={index} />
                        ))}
                    </View>
                ) : (
                    <View style={styles.rewardsList}>
                        {/* Agora renderiza o componente RewardCard, passando props e a função de resgate */}
                        {REWARDS.map((item, index) => (
                            <RewardCard 
                                key={item.id} 
                                item={item} 
                                index={index} 
                                currentPoints={currentPoints}
                                onRedeem={handleRedeem}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    backgroundGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 345 }, // Ajustado para 280 conforme solicitado anteriormente
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, alignItems: "center" },
    backButton: { position: "absolute", top: 60, left: 24, width: 45, height: 45, borderRadius: 22.5, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
    headerContent: { alignItems: "center", gap: 8 },
    headerEmoji: { fontSize: 40 },
    headerTitle: { fontSize: 32, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)", fontWeight: "500" },
    pointsCard: { marginHorizontal: 20, borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 10, marginBottom: 20 },
    pointsGradient: { padding: 16 },
    pointsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    pointsLabel: { fontSize: 14, fontWeight: "700", color: "#0208C7", marginBottom: 4 },
    pointsValue: { fontSize: 36, fontWeight: "900", color: "#0208C7", letterSpacing: -1 },
    levelBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(2, 8, 199, 0.15)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    levelText: { fontSize: 14, fontWeight: "900", color: "#0208C7" },
    progressSection: { gap: 6 },
    progressInfo: { flexDirection: "row", justifyContent: "space-between" },
    progressLabel: { fontSize: 12, fontWeight: "700", color: "#0208C7" },
    progressNumbers: { fontSize: 12, fontWeight: "700", color: "#0208C7" },
    levelProgressBar: { height: 6, backgroundColor: "rgba(2,8,199,0.2)", borderRadius: 4, overflow: "hidden" },
    levelProgressFill: { height: "100%", backgroundColor: "#0208C7", borderRadius: 4 },
    tabsContainer: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 16 },
    tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.5)" },
    tabActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    tabText: { fontSize: 14, fontWeight: "600", color: "#999" },
    tabTextActive: { color: "#0208C7", fontWeight: "800" },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
    achievementsGrid: { gap: 10 },
    achievementCard: { borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
    achievementGradient: { flexDirection: "row", padding: 12, alignItems: "center", gap: 12, position: "relative" },
    achievementIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
    achievementContent: { flex: 1, gap: 4 },
    achievementTitle: { fontSize: 15, fontWeight: "900", color: "#000" },
    achievementTitleLocked: { color: "#666" },
    achievementDescription: { fontSize: 11, fontWeight: "600", color: "#333" },
    achievementDescriptionLocked: { color: "#999" },
    unlockedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
    unlockedText: { fontSize: 10, fontWeight: "700", color: "#003655ff" },
    progressContainer: { gap: 3 },
    progressBar: { height: 5, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 3, overflow: "hidden" },
    progressFill: { height: "100%", backgroundColor: "#0208C7", borderRadius: 3 },
    progressText: { fontSize: 9, fontWeight: "700", color: "#666" },
    pointsBadge: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    achievementPointsValue: { fontSize: 14, fontWeight: "900", color: "#0208C7" },
    rewardsList: { gap: 10 },
    rewardCard: { borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
    rewardGradient: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12, flex: 1 },
    rewardIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
    rewardContent: { flex: 1, justifyContent: "space-between" },
    rewardTitle: { fontSize: 16, fontWeight: "900", color: "#000000ff", marginBottom: 2, flexShrink: 1 },
    rewardTitleLocked: { color: "#666" },
    rewardDescription: { fontSize: 12, fontWeight: "600", color: "rgba(0, 0, 0, 0.9)", flexShrink: 1 },
    rewardDescriptionLocked: { color: "#999" },
    rewardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
    rewardPointsBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    rewardPointsText: { fontSize: 12, fontWeight: "900", color: "#0208C7" },
    redeemButton: { backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    redeemButtonDisabled: { backgroundColor: "rgba(0,0,0,0.1)" },
    redeemText: { fontSize: 13, fontWeight: "900", color: "#0208C7" },
    redeemTextDisabled: { color: "#999" },
});