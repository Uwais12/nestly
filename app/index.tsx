import { Redirect } from 'expo-router';
import { useSession } from '@/hooks/useSession';

export default function Index() {
  const { session } = useSession();
  return session ? <Redirect href="/(tabs)/all" /> : <Redirect href="/(auth)/sign-in" />;
}
