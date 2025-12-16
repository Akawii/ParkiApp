// app/parking-choice.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get('window');

export default function ParkingChoice() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideLeftAnim = useRef(new Animated.Value(-width)).current;
  const slideRightAnim = useRef(new Animated.Value(width)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideLeftAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(slideRightAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleReserve = () => {
    router.push('/reserve' as any);
  };

  const handleUnlock = () => {
    router.push('/park' as any);
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0208C7', '#1a1fc9', '#e95049']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Como queres estacionar?</Text>
          <Text style={styles.headerSubtitle}>Escolhe a opção ideal para ti</Text>
        </View>
      </Animated.View>

      {/* Decorative Elements */}
      <Animated.View 
        style={[
          styles.decorCircle1,
          { opacity: fadeAnim }
        ]} 
      />
      <Animated.View 
        style={[
          styles.decorCircle2,
          { opacity: fadeAnim }
        ]} 
      />

      {/* Options Container */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.optionsContainer}
        showsVerticalScrollIndicator={false}
      >
        
        {/* RESERVAR CARD */}
        <Animated.View
          style={[
            styles.cardWrapper,
            { transform: [{ translateX: slideLeftAnim }] }
          ]}
        >
          <TouchableOpacity 
            style={styles.card}
            onPress={handleReserve}
            activeOpacity={0.95}
          >
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              {/* Top Section */}
              <View style={styles.cardTop}>
                {/* Icon Container */}
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['#e4f967', '#d4e857']}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="calendar" size={32} color="#0208C7" />
                  </LinearGradient>
                </View>

                {/* Badge */}
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>POPULAR</Text>
                </View>
              </View>

              {/* Content */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Reservar Cacifo</Text>
                <Text style={styles.cardDescription}>
                  Planeia o teu dia! Garante um cacifo inteligente para guardar a tua bicicleta.
                </Text>
                
                {/* Features */}
                <View style={styles.featuresContainer}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#0208C7" />
                    <Text style={styles.featureText}>Garantia de espaço</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#0208C7" />
                    <Text style={styles.featureText}>Segurança ESP32</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#0208C7" />
                    <Text style={styles.featureText}>Cancelamento grátis</Text>
                  </View>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity style={styles.cardButton} onPress={handleReserve}>
                <Text style={styles.cardButtonText}>Escolher horário</Text>
                <Ionicons name="arrow-forward" size={18} color="#0208C7" />
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* UNLOCK IMEDIATO CARD */}
        <Animated.View
          style={[
            styles.cardWrapper,
            { transform: [{ translateX: slideRightAnim }] }
          ]}
        >
          <TouchableOpacity 
            style={styles.card}
            onPress={handleUnlock}
            activeOpacity={0.95}
          >
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              {/* Top Section */}
              <View style={styles.cardTop}>
                {/* Icon Container */}
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['#e95049', '#ff6b63']}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="flash" size={32} color="#fff" />
                  </LinearGradient>
                </View>

                {/* Badge */}
                <View style={[styles.badge, styles.badgeAlt]}>
                  <Text style={styles.badgeText}>RÁPIDO</Text>
                </View>
              </View>

              {/* Content */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Unlock Imediato</Text>
                <Text style={styles.cardDescription}>
                  Estaciona agora! Acede instantaneamente aos cacifos disponíveis.
                </Text>
                
                {/* Features */}
                <View style={styles.featuresContainer}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#e95049" />
                    <Text style={styles.featureText}>Acesso instantâneo</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#e95049" />
                    <Text style={styles.featureText}>Desbloqueio através da APP</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#e95049" />
                    <Text style={styles.featureText}>Pay as you go</Text>
                  </View>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity style={[styles.cardButton, styles.cardButtonAlt]} onPress={handleUnlock}>
                <Text style={[styles.cardButtonText, styles.cardButtonTextAlt]}>
                  Desbloquear agora
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#e95049" />
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {/* Bottom Info */}
      <Animated.View 
        style={[
          styles.bottomInfo,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color="#0208C7" />
          <Text style={styles.infoText}>
            Cacifos com sistema ESP32 e notificações em tempo real
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

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
    gap: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Decorative
  decorCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(228, 249, 103, 0.1)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  cardGradient: {
    padding: 18,
  },

  // Card Top
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  // Icon
  iconContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  iconGradient: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  cardContent: {
    gap: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    fontWeight: '500',
  },

  // Features
  featuresContainer: {
    gap: 7,
    marginTop: 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },

  // Button
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(2, 8, 199, 0.1)',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 14,
  },
  cardButtonAlt: {
    backgroundColor: 'rgba(233, 80, 73, 0.1)',
  },
  cardButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0208C7',
  },
  cardButtonTextAlt: {
    color: '#e95049',
  },

  // Badge
  badge: {
    backgroundColor: '#0208C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeAlt: {
    backgroundColor: '#e95049',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.8,
  },

  // Bottom Info
  bottomInfo: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    lineHeight: 16,
  },
});