import { Stack } from 'expo-router';

export default function AthleteLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false 
    }}>
      <Stack.Screen name="details" />
      <Stack.Screen name="create" />
      <Stack.Screen name="insights/[id]" />
      <Stack.Screen name="tracking/[id]" />
      <Stack.Screen name="recommendations/[id]" />
      <Stack.Screen name="performance-measurements/[id]" />
      <Stack.Screen name="performance-history/[id]" />
      <Stack.Screen name="view-measurements/[id]" />
      <Stack.Screen name="measurements/[id]" />
    </Stack>
  );
} 