import { Stack } from 'expo-router';
import '@/locales/i18n';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
