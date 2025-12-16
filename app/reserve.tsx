// app/reserve.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get('window');

interface Locker {
    id: string;
    location: string;
    address: string;
    available: number;
    total: number;
    distance: string;
    price: string;
}

const LOCKERS: Locker[] = [
    {
        id: '1',
        location: 'Marquês de Pombal',
        address: 'Av. da Liberdade, 1250',
        available: 8,
        total: 12,
        distance: '0.3 km',
        price: '0.50€'
    },
    {
        id: '2',
        location: 'Cais do Sodré',
        address: 'Praça Duque da Terceira',
        available: 3,
        total: 10,
        distance: '0.8 km',
        price: '0.50€'
    },
    {
        id: '3',
        location: 'Parque das Nações',
        address: 'Alameda dos Oceanos',
        available: 15,
        total: 20,
        distance: '1.2 km',
        price: '0.50€'
    },
    {
        id: '4',
        location: 'Belém',
        address: 'Av. Brasília',
        available: 6,
        total: 15,
        distance: '2.1 km',
        price: '0.50€'
    },
    {
        id: '5',
        location: 'Chiado',
        address: 'Largo do Chiado',
        available: 2,
        total: 8,
        distance: '0.5 km',
        price: '0.50€'
    },
];

export default function Reserve() {
    const router = useRouter();
    const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
    const [duration, setDuration] = useState(15);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<'mbway' | 'paypal' | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

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

    const handleConfirmBooking = () => {
        if (selectedLocker && selectedPayment) {
            // Adicionar esta linha para fechar o modal
            setShowPayment(false); 
            // Continuar para a próxima tela após o "pagamento"
            router.push({
                pathname: '/booking-success',
                params: {
                    location: selectedLocker.location, // Envia a localização escolhida
                    address: selectedLocker.address,
                    duration: duration.toString(), // Envia a duração escolhida (em minutos)
                    price: totalPrice.toFixed(2),
                }
            } as any);
        }
    };

    const totalPrice = (duration / 15) * 0.50;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0208C7', '#1a1fc9']}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            {/* Header */}
            <Animated.View
                style={[
                    styles.header,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Reservar Cacifo</Text>
                    <Text style={styles.headerSubtitle}>Escolhe a localização e duração</Text>
                </View>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Lockers List */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <Text style={styles.sectionTitle}>📍 Cacifos Disponíveis</Text>

                    {LOCKERS.map((locker, index) => (
                        <Animated.View
                            key={locker.id}
                            style={[
                                styles.lockerCardWrapper,
                                {
                                    opacity: fadeAnim,
                                    transform: [{
                                        translateY: slideAnim.interpolate({
                                            inputRange: [0, 50],
                                            outputRange: [0, 50 + (index * 10)]
                                        })
                                    }]
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.lockerCard,
                                    selectedLocker?.id === locker.id && styles.lockerCardSelected
                                ]}
                                onPress={() => setSelectedLocker(locker)}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={selectedLocker?.id === locker.id
                                        ? ['#e4f967', '#d4e857']
                                        : ['#ffffff', '#f8f9fa']
                                    }
                                    style={styles.lockerCardGradient}
                                >
                                    <View style={styles.lockerCardTop}>
                                        <View style={styles.lockerInfo}>
                                            <Text style={styles.lockerLocation}>{locker.location}</Text>
                                            <Text style={styles.lockerAddress}>{locker.address}</Text>
                                        </View>

                                        {selectedLocker?.id === locker.id && (
                                            <View style={styles.selectedBadge}>
                                                <Ionicons name="checkmark-circle" size={24} color="#0208C7" />
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.lockerCardBottom}>
                                        <View style={styles.lockerStat}>
                                            <Ionicons
                                                name="bicycle"
                                                size={16}
                                                color={locker.available > 5 ? "#4CAF50" : "#FF9800"}
                                            />
                                            <Text style={styles.lockerStatText}>
                                                {locker.available}/{locker.total} disponíveis
                                            </Text>
                                        </View>

                                        <View style={styles.lockerDivider} />

                                        <View style={styles.lockerStat}>
                                            <Ionicons name="location" size={16} color="#666" />
                                            <Text style={styles.lockerStatText}>{locker.distance}</Text>
                                        </View>

                                        <View style={styles.lockerDivider} />

                                        <View style={styles.lockerStat}>
                                            <Ionicons name="cash" size={16} color="#0208C7" />
                                            <Text style={styles.lockerStatText}>{locker.price}/15min</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </Animated.View>

                {/* Duration Selector */}
                {selectedLocker && (
                    <Animated.View
                        style={[
                            styles.section,
                            { opacity: fadeAnim }
                        ]}
                    >
                        <Text style={styles.sectionTitle}>⏱️ Duração</Text>

                        <View style={styles.durationCard}>
                            <LinearGradient
                                colors={['#ffffff', '#f8f9fa']}
                                style={styles.durationGradient}
                            >
                                <View style={styles.durationSlider}>
                                    <TouchableOpacity
                                        style={styles.durationButton}
                                        onPress={() => duration > 15 && setDuration(duration - 15)}
                                        disabled={duration <= 15}
                                    >
                                        <Ionicons
                                            name="remove-circle"
                                            size={32}
                                            color={duration <= 15 ? "#ccc" : "#0208C7"}
                                        />
                                    </TouchableOpacity>

                                    <View style={styles.durationDisplay}>
                                        <Text style={styles.durationValue}>{duration}</Text>
                                        <Text style={styles.durationUnit}>minutos</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.durationButton}
                                        onPress={() => duration < 60 && setDuration(duration + 15)}
                                        disabled={duration >= 60}
                                    >
                                        <Ionicons
                                            name="add-circle"
                                            size={32}
                                            color={duration >= 60 ? "#ccc" : "#0208C7"}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.durationInfo}>
                                    Máximo: 60 minutos (4 períodos de 15 min)
                                </Text>
                            </LinearGradient>
                        </View>
                    </Animated.View>
                )}

                {/* Summary */}
                {selectedLocker && (
                    <Animated.View
                        style={[
                            styles.section,
                            { opacity: fadeAnim }
                        ]}
                    >
                        <Text style={styles.sectionTitle}>📋 Resumo da Reserva</Text>

                        <View style={styles.summaryCard}>
                            <LinearGradient
                                colors={['#0208C7', '#1a1fc9']}
                                style={styles.summaryGradient}
                            >
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Localização</Text>
                                    <Text style={styles.summaryValue}>{selectedLocker.location}</Text>
                                </View>

                                <View style={styles.summaryDivider} />

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Duração</Text>
                                    <Text style={styles.summaryValue}>{duration} minutos</Text>
                                </View>

                                <View style={styles.summaryDivider} />

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabelBold}>Total</Text>
                                    <Text style={styles.summaryValueBold}>{totalPrice.toFixed(2)}€</Text>
                                </View>
                            </LinearGradient>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>

            {/* Bottom Button */}
            {selectedLocker && (
                <Animated.View
                    style={[
                        styles.bottomContainer,
                        { opacity: fadeAnim }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => setShowPayment(true)}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#e95049', '#ff6b63']}
                            style={styles.confirmGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.confirmButtonText}>
                                Continuar para Pagamento
                            </Text>
                            <Ionicons name="arrow-forward" size={24} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Payment Modal */}
            <Modal
                visible={showPayment}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPayment(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LinearGradient
                            colors={['#ffffff', '#f8f9fa']}
                            style={styles.modalGradient}
                        >
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Escolhe o Pagamento</Text>
                                <TouchableOpacity
                                    onPress={() => setShowPayment(false)}
                                    style={styles.modalClose}
                                >
                                    <Ionicons name="close" size={28} color="#000" />
                                </TouchableOpacity>
                            </View>

                            {/* Payment Options */}
                            <View style={styles.paymentOptions}>
                                {/* MBWay */}
                                <TouchableOpacity
                                    style={[
                                        styles.paymentOption,
                                        selectedPayment === 'mbway' && styles.paymentOptionSelected
                                    ]}
                                    onPress={() => setSelectedPayment('mbway')}
                                    activeOpacity={0.9}
                                >
                                    <View style={[styles.paymentIcon, { backgroundColor: '#FF6B35' }]}>
                                        <Ionicons name="phone-portrait" size={32} color="#fff" />
                                    </View>
                                    <View style={styles.paymentInfo}>
                                        <Text style={styles.paymentName}>MBWay</Text>
                                        <Text style={styles.paymentDescription}>Pagamento instantâneo</Text>
                                    </View>
                                    {selectedPayment === 'mbway' && (
                                        <Ionicons name="checkmark-circle" size={28} color="#0208C7" />
                                    )}
                                </TouchableOpacity>

                                {/* PayPal */}
                                <TouchableOpacity
                                    style={[
                                        styles.paymentOption,
                                        selectedPayment === 'paypal' && styles.paymentOptionSelected
                                    ]}
                                    onPress={() => setSelectedPayment('paypal')}
                                    activeOpacity={0.9}
                                >
                                    <View style={[styles.paymentIcon, { backgroundColor: '#0070BA' }]}>
                                        <Ionicons name="logo-paypal" size={32} color="#fff" />
                                    </View>
                                    <View style={styles.paymentInfo}>
                                        <Text style={styles.paymentName}>PayPal</Text>
                                        <Text style={styles.paymentDescription}>Seguro e rápido</Text>
                                    </View>
                                    {selectedPayment === 'paypal' && (
                                        <Ionicons name="checkmark-circle" size={28} color="#0208C7" />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Payment Total */}
                            <View style={styles.paymentTotal}>
                                <Text style={styles.paymentTotalLabel}>Total a pagar</Text>
                                <Text style={styles.paymentTotalValue}>{totalPrice.toFixed(2)}€</Text>
                            </View>

                            {/* Confirm Payment Button */}
                            <TouchableOpacity
                                style={[
                                    styles.paymentButton,
                                    !selectedPayment && styles.paymentButtonDisabled
                                ]}
                                onPress={handleConfirmBooking}
                                disabled={!selectedPayment}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={selectedPayment
                                        ? ['#4CAF50', '#66BB6A']
                                        : ['#ccc', '#ddd']
                                    }
                                    style={styles.paymentButtonGradient}
                                >
                                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                    <Text style={styles.paymentButtonText}>
                                        Confirmar Pagamento
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
    },

    // Header
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    headerContent: {
        gap: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },

    // Scroll
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 120,
    },

    // Section
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000',
        marginBottom: 12,
    },

    // Locker Cards
    lockerCardWrapper: {
        marginBottom: 12,
    },
    lockerCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    lockerCardSelected: {
        shadowColor: "#e4f967",
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    lockerCardGradient: {
        padding: 16,
    },
    lockerCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    lockerInfo: {
        flex: 1,
    },
    lockerLocation: {
        fontSize: 17,
        fontWeight: '800',
        color: '#000',
        marginBottom: 4,
    },
    lockerAddress: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    selectedBadge: {
        marginLeft: 8,
    },
    lockerCardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lockerStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    lockerStatText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    lockerDivider: {
        width: 1,
        height: 16,
        backgroundColor: '#ddd',
        marginHorizontal: 8,
    },

    // Duration
    durationCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    durationGradient: {
        padding: 20,
    },
    durationSlider: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    durationButton: {
        padding: 4,
    },
    durationDisplay: {
        alignItems: 'center',
    },
    durationValue: {
        fontSize: 48,
        fontWeight: '900',
        color: '#0208C7',
    },
    durationUnit: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    durationInfo: {
        textAlign: 'center',
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },

    // Summary
    summaryCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    summaryGradient: {
        padding: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '700',
    },
    summaryLabelBold: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '800',
    },
    summaryValueBold: {
        fontSize: 24,
        color: '#e4f967',
        fontWeight: '900',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginVertical: 4,
    },

    // Bottom
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 30,
        backgroundColor: 'transparent',
    },
    confirmButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#e95049",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    confirmGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 18,
    },
    confirmButtonText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#fff',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
        maxHeight: '80%',
    },
    modalGradient: {
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000',
    },
    modalClose: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Payment Options
    paymentOptions: {
        gap: 12,
        marginBottom: 24,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    paymentOptionSelected: {
        borderColor: '#0208C7',
        backgroundColor: 'rgba(2, 8, 199, 0.05)',
    },
    paymentIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#000',
        marginBottom: 2,
    },
    paymentDescription: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },

    // Payment Total
    paymentTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
    },
    paymentTotalLabel: {
        fontSize: 15,
        color: '#666',
        fontWeight: '600',
    },
    paymentTotalValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0208C7',
    },

    // Payment Button
    paymentButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    paymentButtonDisabled: {
        opacity: 0.5,
    },
    paymentButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 18,
    },
    paymentButtonText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#fff',
    },
});