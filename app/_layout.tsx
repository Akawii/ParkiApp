// app/_layout.tsx
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="home" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="parking" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="writeNfcCard" />
    </Stack>
  );
}