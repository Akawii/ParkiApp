// app/home.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useBooking } from "./contexts/BookingContext";

// Definição de tipos para o MapStyleElement (Adicionada para resolver o aviso de tipagem)
interface MapStyleElement {
  featureType?: string;
  elementType?: string;
  stylers: { [key: string]: string | number }[];
}

const { width } = Dimensions.get('window');

export default function Home() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('home');
    const { activeBooking, timeRemaining } = useBooking();

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const bookingPulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animação de pulse no marcador
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Slide-in do header
        Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, []);

    // Pulse para o card de reserva ativa
    useEffect(() => {
        if (activeBooking) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bookingPulse, {
                        toValue: 1.02,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(bookingPulse, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [activeBooking]);

    const handleTabPress = (tab: string, route?: string) => {
        setActiveTab(tab);
        if (route) router.push(route as any);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calcula a largura da barra de progresso
    const getProgressPercentage = () => {
        if (!activeBooking || activeBooking.duration <= 0) return '100%';
        const totalSeconds = activeBooking.duration * 60;
        const percentage = (timeRemaining / totalSeconds) * 100;
        return `${Math.max(0, percentage)}%`; // Garante que a percentagem nunca é negativa
    }


    return (
        <View style={styles.container}>
            {/* Header flutuante com gradiente */}
            <Animated.View
                style={[
                    styles.headerContainer,
                    { transform: [{ translateY: slideAnim }] }
                ]}
            >
                <LinearGradient
                    colors={['rgba(2, 8, 199, 0.95)', 'rgba(233, 80, 73, 0.85)']}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.headerGreeting}>Olá! 👋</Text>
                            <Text style={styles.headerTitle}>Pronto para pedalar?</Text>
                        </View>
                        <TouchableOpacity style={styles.notificationButton}>
                            <Ionicons name="notifications-outline" size={24} color="#fff" />
                            <View style={styles.badge} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </Animated.View>

            {/* Card flutuante de estatísticas rápidas - Voltou para o topo */}
            <View style={styles.statsCard}>
                <LinearGradient
                    colors={['#ffffff', '#f8f9fa']}
                    style={styles.statsGradient}
                >
                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: '#e4f967' }]}>
                            <Ionicons name="leaf-outline" size={20} color="#0208C7" />
                        </View>
                        <View>
                            <Text style={styles.statValue}>12.5 kg</Text>
                            <Text style={styles.statLabel}>CO₂ poupado</Text>
                        </View>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: '#b2d6f0' }]}>
                            <Ionicons name="bicycle-outline" size={20} color="#0208C7" />
                        </View>
                        <View>
                            <Text style={styles.statValue}>47</Text>
                            <Text style={styles.statLabel}>Viagens</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            {/* MAPA DE LISBOA */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 38.7223,
                    longitude: -9.1393,
                    latitudeDelta: 0.08,
                    longitudeDelta: 0.08,
                }}
                customMapStyle={customMapStyle}
            >
                <Marker
                    coordinate={{ latitude: 38.7223, longitude: -9.1393 }}
                    title="Parque Parkey"
                    description="O teu estacionamento inteligente"
                >
                    <Animated.View style={[styles.markerContainer, { transform: [{ scale: pulseAnim }] }]}>
                        <View style={styles.markerOuter}>
                            <View style={styles.markerInner}>
                                <Ionicons name="bicycle" size={20} color="#fff" />
                            </View>
                        </View>
                    </Animated.View>
                </Marker>
            </MapView>

            {/* Card de Reserva Ativa (no fundo, se houver booking) */}
            {activeBooking && (
                <Animated.View
                    style={[
                        styles.activeBookingCard,
                        styles.activeBookingCardBottom, // Posição no fundo
                        { transform: [{ scale: bookingPulse }] }
                    ]}
                >
                    <LinearGradient
                        colors={['#e4f967', '#d4e857']}
                        style={styles.activeBookingGradient}
                    >
                        <View style={styles.activeBookingHeader}>
                            <View style={styles.activeBookingIcon}>
                                <Ionicons name="lock-closed" size={20} color="#0208C7" />
                            </View>
                            <View style={styles.activeBookingInfo}>
                                <Text style={styles.activeBookingTitle}>Cacifo Reservado</Text>
                                <Text style={styles.activeBookingLocation}>{activeBooking.location}</Text>
                            </View>
                            <View style={styles.activeBookingBadge}>
                                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                            </View>
                        </View>

                        <View style={styles.timerContainer}>
                            <View style={styles.timerLeft}>
                                <Ionicons name="time" size={24} color="#0208C7" />
                                <View>
                                    <Text style={styles.timerLabel}>Tempo Restante</Text>
                                    <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.viewDetailsButton}>
                                <Text style={styles.viewDetailsText}>Ver QR</Text>
                                <Ionicons name="qr-code" size={18} color="#0208C7" />
                            </TouchableOpacity>
                        </View>

                        {/* Barra de progresso */}
                        <View style={styles.progressBarContainer}>
                            <Animated.View
                                style={[
                                    styles.progressBar,
                                    {
                                        width: `${Math.max(0, (timeRemaining / (activeBooking.duration * 60)) * 100)}%`,
                                        backgroundColor: timeRemaining < 300 ? '#e95049' : '#0208C7'
                                    } as any
                                ]}
                            />
                        </View>

                        {timeRemaining < 300 && (
                            <View style={styles.warningContainer}>
                                <Ionicons name="warning" size={16} color="#e95049" />
                                <Text style={styles.warningText}>Menos de 5 minutos restantes!</Text>
                            </View>
                        )}
                    </LinearGradient>
                </Animated.View>
            )}

            {/* Botão de ação principal (Estacionar) - só aparece se NÃO houver booking */}
            {!activeBooking && (
                <TouchableOpacity
                    style={styles.fabContainer}
                    onPress={() => handleTabPress('park', '/parking-choice')}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#e95049', '#ff6b63']}
                        style={styles.fab}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="add" size={32} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.fabLabel}>Estacionar</Text>
                </TouchableOpacity>
            )}

            {/* BARRA INFERIOR moderna */}
            <View style={styles.bottomBarContainer}>
                <LinearGradient
                    colors={['#ffffff', '#f8f9fa']}
                    style={styles.bottomBar}
                >
                    <TouchableOpacity
                        style={styles.tabButton}
                        onPress={() => handleTabPress('home')}
                    >
                        <View style={[styles.tabIconContainer, activeTab === 'home' && styles.tabIconActive]}>
                            <Ionicons
                                name={activeTab === 'home' ? "home" : "home-outline"}
                                size={24}
                                color={activeTab === 'home' ? "#0208C7" : "#999"}
                            />
                        </View>
                        <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive]}>
                            Início
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabButton}
                        onPress={() => handleTabPress('history' , '/history')}
                    >
                        <View style={[styles.tabIconContainer, activeTab === 'history' && styles.tabIconActive]}>
                            <Ionicons
                                name={activeTab === 'history' ? "time" : "time-outline"}
                                size={24}
                                color={activeTab === 'history' ? "#0208C7" : "#999"}
                            />
                        </View>
                        <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
                            Histórico
                        </Text>
                    </TouchableOpacity>

                    {/* O tabSpacer é condicional à presença do FAB/Reserva Ativa */}
                    {!activeBooking ? (
                        <View style={styles.tabSpacer} />
                    ) : (
                        <View style={{ width: 10 }} />
                    )}

                    <TouchableOpacity
                        style={styles.tabButton}
                        onPress={() => handleTabPress('rewards', '/rewards')}
                    >
                        <View style={[styles.tabIconContainer, activeTab === 'rewards' && styles.tabIconActive]}>
                            <Ionicons
                                name={activeTab === 'rewards' ? "trophy" : "trophy-outline"}
                                size={24}
                                color={activeTab === 'rewards' ? "#0208C7" : "#999"}
                            />
                        </View>
                        <Text style={[styles.tabText, activeTab === 'rewards' && styles.tabTextActive]}>
                            Recompensas
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabButton}
                        onPress={() => handleTabPress('profile', '/profile')}
                    >
                        <View style={[styles.tabIconContainer, activeTab === 'profile' && styles.tabIconActive]}>
                            <Ionicons
                                name={activeTab === 'profile' ? "person" : "person-outline"}
                                size={24}
                                color={activeTab === 'profile' ? "#0208C7" : "#999"}
                            />
                        </View>
                        <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
                            Perfil
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </View>
    );
}

// Estilo de mapa customizado (opcional, mais moderno)
const customMapStyle: MapStyleElement[] = [
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#b2d6f0" }]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [{ "color": "#f5f5f5" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#ffffff" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#e4f967" }, { "lightness": 60 }]
    }
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },
    map: {
        flex: 1
    },

    // Header flutuante
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerGreeting: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginTop: 4,
    },
    notificationButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#e4f967',
        borderWidth: 2,
        borderColor: '#0208C7',
    },

    // Marcador customizado
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerOuter: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(233, 80, 73, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerInner: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#e95049',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#e95049",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },

    // Card de Reserva Ativa - Mantido no fundo
    activeBookingCard: {
        position: 'absolute',
        left: 20,
        right: 20,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
        zIndex: 15,
    },
    activeBookingCardBottom: {
        bottom: Platform.OS === 'ios' ? 110 : 100,
        top: undefined,
    },
    activeBookingGradient: {
        padding: 16,
    },
    activeBookingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    activeBookingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(2, 8, 199, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    activeBookingInfo: {
        flex: 1,
    },
    activeBookingTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0208C7',
        marginBottom: 2,
    },
    activeBookingLocation: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    activeBookingBadge: {
        marginLeft: 8,
    },
    timerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    timerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    timerLabel: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600',
    },
    timerValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0208C7',
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(2, 8, 199, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    viewDetailsText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0208C7',
    },
    progressBarContainer: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(233, 80, 73, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    warningText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#e95049',
    },

    // Card de estatísticas - Posição Fixa no Topo (ajustado para 130)
    statsCard: {
        position: 'absolute',
        top: 130, 
        left: 20,
        right: 20,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 9,
    },
    statsGradient: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000',
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#e0e0e0',
    },

    // FAB (Floating Action Button)
    fabContainer: {
        position: 'absolute',
        bottom: 100,
        left: width / 2 - 35,
        alignItems: 'center',
    },
    fab: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#e95049",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
    fabLabel: {
        marginTop: 6,
        fontSize: 12,
        fontWeight: '700',
        color: '#000',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },

    // Barra inferior moderna
    bottomBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    bottomBar: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 8,
        paddingBottom: 20,
        justifyContent: "space-around",
        alignItems: 'flex-end',
    },
    tabButton: {
        alignItems: "center",
        gap: 4,
    },
    tabIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIconActive: {
        backgroundColor: 'rgba(2, 8, 199, 0.1)',
    },
    tabText: {
        fontSize: 11,
        color: "#999",
        fontWeight: '600',
    },
    tabTextActive: {
        color: "#0208C7",
        fontWeight: "800",
    },
    tabSpacer: {
        width: 70,
    },
});