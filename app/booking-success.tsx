// app/booking-success.tsx

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useBooking } from "./contexts/BookingContext";

const { width } = Dimensions.get('window');

export default function BookingSuccess() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { setActiveBooking, timeRemaining } = useBooking();

    // 1. ALTERAÇÃO: Define um número de cacifo fixo para debug OU usa o valor do parâmetro.
    // Você deve enviar este parâmetro da tela anterior. Exemplo: params: { lockerNumber: '05' }
    const lockerNumberParam = params.lockerNumber as string | undefined;
    const [lockerNumber] = useState(() =>
        // Prioriza o parâmetro. Se não existir, usa '05' para debug.
        lockerNumberParam || '05'
    );

    const checkAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // ... (Seu código de animação existente)
        
        // Animação de check
        Animated.sequence([
            Animated.timing(checkAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Pulse no timer
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
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

        // 2. ALTERAÇÃO: Criar reserva ativa (Ajuste da Duração)
        
        // Duração Normal: parseInt(params.duration as string) * 60
        // Duração para Debug (10 Segundos): 10 / 60 = 0.166... minutos
        // Vamos forçar a duração para que o BookingContext inicie o contador em 10 segundos
        const debugDuration = 10 / 60; // Duração em minutos (0.166... min)

        const booking = {
            id: Date.now().toString(),
            location: params.location as string || 'Marquês de Pombal',
            address: params.address as string || 'Av. da Liberdade, 1250',
            startTime: Date.now(),
            // 🚨 MUDANÇA AQUI: Para debug de 10 segundos, forçamos a duração mínima.
            // Quando terminar o debug, você deve usar:
            // duration: parseInt(params.duration as string) || 2, 
            duration: 3, // Usa 0.166... minutos (10 segundos)
            price: parseFloat(params.price as string) || 0.50,  
            // Usa o número do cacifo definido acima (parâmetro ou '05')
            lockerNumber: lockerNumber.padStart(2, '0'), 
        };

        setActiveBooking(booking);
        
    }, []);

    const formatTime = (seconds: number) => {
        // ... (Seu código de formatação)
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = () => {
        // Para calcular a percentagem, a duração total deve ser em segundos.
        // A duração é guardada em minutos na reserva (booking.duration).
        // Se a duração for '0.1666...', o total é 10 segundos.
        const durationInMinutes = parseFloat(params.duration as string) || 0.1666; // Usa a duração de debug (ou a original se for maior que 0)
        const totalSeconds = durationInMinutes * 60;

        // Evita divisão por zero.
        if (totalSeconds <= 0) return 0;
        
        return (timeRemaining / totalSeconds) * 100;
    };

    const handleGoHome = () => {
        // Usa `replace` para que o utilizador não volte para a página de sucesso
        // ao pressionar "voltar"
        router.replace('/home' as any);
    };

    return (
        <View style={styles.container}>
            {/* ... (Todo o seu JSX e estilos permanecem iguais) */}
            <LinearGradient
                colors={['#0208C7', '#1a1fc9']}
                style={styles.backgroundGradient}
            />

            {/* --- Botão de Saída Adicionado --- */}
            <SafeAreaView style={styles.exitButtonContainer}>
                <TouchableOpacity
                    style={styles.exitButton}
                    onPress={handleGoHome}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close-circle-outline" size={32} color="#fff" />
                </TouchableOpacity>
            </SafeAreaView>
            {/* --------------------------------- */}

            <View style={styles.content}>
                {/* Success Icon */}
                <Animated.View
                    style={[
                        styles.iconContainer,
                        {
                            opacity: checkAnim,
                            transform: [{
                                scale: checkAnim.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: [0, 1.2, 1]
                                })
                            }]
                        }
                    ]}
                >
                    <View style={styles.iconCircle}>
                        <LinearGradient
                            colors={['#4CAF50', '#66BB6A']}
                            style={styles.iconGradient}
                        >
                            <Ionicons name="checkmark" size={60} color="#fff" />
                        </LinearGradient>
                    </View>
                </Animated.View>

                {/* Success Message */}
                <Animated.View
                    style={[
                        styles.messageContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.successTitle}>Pagamento Confirmado! </Text>
                    <Text style={styles.successSubtitle}>
                        O teu cacifo está reservado e pronto a ser utilizado.
                    </Text>
                </Animated.View>

                {/* Timer Card */}
                <Animated.View
                    style={[
                        styles.timerCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: pulseAnim }]
                        }
                    ]}
                >
                    <LinearGradient
                        colors={['#e4f967', '#d4e857']}
                        style={styles.timerGradient}
                    >
                        <Text style={styles.timerLabel}>Tempo Restante</Text>
                        {/* Exibe o contador real vindo do contexto */}
                        <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text> 

                        {/* Progress Bar */}
                        <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                    styles.progressBar,
                                    {
                                        width: `${getProgressPercentage()}%`,
                                        backgroundColor: getProgressPercentage() > 20 ? '#0208C7' : '#e95049'
                                    }
                                ]}
                            />
                        </View>

                        <View style={styles.timerWarning}>
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <Text style={styles.timerWarningText}>
                                Não te esqueças de guardar a tua bicicleta!
                            </Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Booking Details */}
                <Animated.View
                    style={[
                        styles.detailsCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="location" size={24} color="#0208C7" />
                        </View>
                        <View style={styles.detailText}>
                            <Text style={styles.detailLabel}>Localização</Text>
                            <Text style={styles.detailValue}>{params.location}</Text>
                            <Text style={styles.detailSubValue}>{params.address}</Text>
                        </View>
                    </View>

                    <View style={styles.detailDivider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="lock-closed" size={24} color="#0208C7" />
                        </View>
                        <View style={styles.detailText}>
                            <Text style={styles.detailLabel}>Cacifo</Text>
                            {/* Usa o número do cacifo correto */}
                            <Text style={styles.detailValue}>#{lockerNumber.padStart(2, '0')}</Text> 
                        </View>
                    </View>

                    <View style={styles.detailDivider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="cash" size={24} color="#0208C7" />
                        </View>
                        <View style={styles.detailText}>
                            <Text style={styles.detailLabel}>Total Pago</Text>
                            <Text style={styles.detailValue}>{params.price}€</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View
                    style={[
                        styles.actionsContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    {/* Alterado para usar handleGoHome */}
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleGoHome}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#0208C7', '#1a1fc9']}
                            style={styles.buttonGradient}
                        >
                            <Ionicons name="home" size={24} color="#fff" />
                            <Text style={styles.primaryButtonText}>Voltar ao Início</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="qr-code-outline" size={24} color="#0208C7" />
                        <Text style={styles.secondaryButtonText}>Ver QR Code</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Support Link */}
                <Animated.View style={[styles.supportContainer, { opacity: fadeAnim }]}>
                    <Ionicons name="help-circle-outline" size={20} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.supportText}>Precisas de ajuda?</Text>
                    <TouchableOpacity>
                        <Text style={styles.supportLink}>Contacta-nos</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

// ... (Styles omitidos por brevidade, mas devem permanecer no seu arquivo)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0208C7',
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    // --- NOVO ESTILO PARA O BOTÃO DE SAÍDA ---
    exitButtonContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 10,
        paddingTop: 20, // Espaçamento superior para SafeAreaView
        paddingRight: 10,
    },
    exitButton: {
        padding: 10,
    },
    // ----------------------------------------
    content: {
        flex: 1,
        // Reduzir o paddingTop para compensar o espaço usado pelo exitButton
        paddingTop: 60, 
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    // Success Icon
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
    },
    iconGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Message
    messageContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
        textAlign: 'center',
    },

    // Timer Card
    timerCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    timerGradient: {
        padding: 24,
        alignItems: 'center',
    },
    timerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    timerValue: {
        fontSize: 56,
        fontWeight: '900',
        color: '#0208C7',
        marginBottom: 16,
    },
    progressBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    timerWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timerWarningText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },

    // Details Card
    detailsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        // Nota: `backdropFilter` não funciona nativamente no React Native puro, mas pode ser suportado por bibliotecas como `expo-blur`.
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    detailIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    detailText: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 17,
        fontWeight: '800',
        color: '#fff',
    },
    detailSubValue: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
        marginTop: 2,
    },
    detailDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginVertical: 4,
    },

    // Actions
    actionsContainer: {
        gap: 12,
        marginBottom: 24,
    },
    primaryButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 18,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#fff',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 18,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    secondaryButtonText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#fff',
    },

    // Support
    supportContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    supportText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    supportLink: {
        fontSize: 14,
        color: '#e4f967',
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});