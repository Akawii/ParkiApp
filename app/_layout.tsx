// app/_layout.tsx
import { Stack } from 'expo-router';
import { BookingProvider } from './contexts/BookingContext';

export default function RootLayout() {
  return (
    <BookingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </BookingProvider>
  );
}