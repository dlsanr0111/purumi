import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Toast } from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="clinics" />
        <Stack.Screen name="survey" />
        <Stack.Screen name="shorts" />
        <Stack.Screen name="review" />
      </Stack>
      <Toast />
    </>
  );
}
