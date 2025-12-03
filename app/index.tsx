import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { Image } from 'expo-image';
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
      <StatusBar barStyle="dark-content" />
      {/* Background Orb */}
      <LinearGradient
        colors={[theme.colors.accentPurple, theme.colors.accentCyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.orbBehind}
      />

      <Glass style={styles.card}>
        <View style={styles.hero}>
          <View style={styles.logoShell}>
            <LinearGradient
              colors={[theme.colors.accentPurple, theme.colors.accentCyan, theme.colors.accentOrange]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoRing}
            >
              <View style={styles.logoInner}>
                <Image
                  source={require('../assets/images/NestlyAppIcons/light/icon2_1024x1024.png')}
                  style={styles.logoImage}
                  contentFit="contain"
                  transition={200}
                />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.appName}>Nestly</Text>
            <Text style={styles.title}>Delightful links,</Text>
            <Text style={styles.titleAccent}>saved for later.</Text>
          </View>

          <Text style={styles.subtitle}>
            Nestly turns TikTok, Reels and YouTube chaos into a calm, cinematic watchlist you can actually finish.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
               console.log("Get Started Pressed");
               router.push('/(auth)/sign-in');
            }}
            style={styles.buttonOuter}
          >
            <LinearGradient
              colors={[theme.colors.accentPurple, theme.colors.accentCyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Get started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.hint}>
            No clutter. No feeds to doomscroll. Just the good stuff you saved, ready when you are.
          </Text>
        </View>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(248,249,253,1)', // Ensure solid background
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  orbBehind: {
    position: 'absolute',
    width: 420,
    height: 320,
    borderRadius: 999,
    top: -160,
    left: -60, // Center roughly
    opacity: 0.35,
    zIndex: 0, // Ensure it is behind
  },
  card: {
    flex: 1,
    width: '100%',
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(7),
    paddingHorizontal: theme.spacing(4),
    borderRadius: 0,
    gap: theme.spacing(3),
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: 'transparent', // Glass handles background
    zIndex: 1, // Ensure content is above orb
  },
  hero: {
    alignItems: 'center',
    gap: theme.spacing(3),
    // overflow: 'hidden', // Removed to ensure shadows/rings aren't clipped if they expand
  },
  logoShell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    width: 120,
    height: 120,
    borderRadius: 999,
    padding: 8,
    marginTop: 5,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  logoImage: {
    width: '65%',
    height: '65%',
  },
  titleBlock: {
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#050816',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: theme.colors.textMuted,
  },
  titleAccent: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: theme.colors.accentPurple,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: theme.spacing(2),
    marginBottom: 20, // Add bottom margin for safety
  },
  buttonOuter: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
    color: theme.colors.textFaint,
    textAlign: 'center',
  },
});
