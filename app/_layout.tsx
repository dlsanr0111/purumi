import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Toast } from 'react-native-toast-message';
import { AuthProvider } from '../providers/AuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="clinics" />
        <Stack.Screen name="survey" />
        <Stack.Screen name="shorts" />
        <Stack.Screen name="review" />
        <Stack.Screen name="reservation" />
        <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
      </Stack>
      <Toast />
    </AuthProvider>
  );
}
