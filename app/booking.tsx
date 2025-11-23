import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getActiveBooking } from "./services/bookingService";

export default function Booking() {
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    getActiveBooking().then((b) => setBooking(b));
  }, []);

  if (!booking) return <Text style={{ margin: 20 }}>Nenhuma reserva ativa.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes da Reserva</Text>

      <Text>Parque: {booking.storageId}</Text>
      <Text>Duração: {booking.duration}</Text>
      <Text>Início: {booking.startTime.toDate().toLocaleString()}</Text>
      <Text>Fim: {booking.endTime.toDate().toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
});
