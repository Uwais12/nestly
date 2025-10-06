import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function NotFound() {
  const router = useRouter();
  useEffect(() => {
    // Redirect any unmatched deep link (e.g., nestly://dataUrl=...) to home
    router.replace('/(tabs)/all');
  }, []);
  return <View />;
}


