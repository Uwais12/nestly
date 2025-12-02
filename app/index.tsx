import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSession } from '@/hooks/useSession';
import { theme } from '@/constants/theme';
import { Glass } from '@/components/ui/Glass';

export default function Index() {
  const { session, loading } = useSession();
  const router = useRouter();

  // If still loading auth state, show nothing or a splash
  if (loading) return null;

  // If authenticated, go straight to the app
  if (session) return <Redirect href="/(tabs)/all" />;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.accentPurple, theme.colors.accentCyan, theme.colors.accentOrange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <Glass style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>Nestly</Text>
          <Text style={styles.tagline}>Save links. Watch later.{'\n'}Stay organized.</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.button} 
            activeOpacity={0.9}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: theme.spacing(4),
    gap: theme.spacing(6),
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 26,
  },
  actions: {
    width: '100%',
    gap: theme.spacing(2),
  },
  button: {
    backgroundColor: theme.colors.text, // High contrast black button
    paddingVertical: 16,
    borderRadius: theme.radius,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
