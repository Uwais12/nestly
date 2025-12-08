import { Glass } from '@/components/ui/Glass';
import { theme } from '@/constants/theme';
import { useSession } from '@/hooks/useSession';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const { session, loading } = useSession();
  const router = useRouter();

  // If still loading auth state, show nothing or a splash
  if (loading) return null;

  // If authenticated, go straight to the app
  if (session) return <Redirect href="/(tabs)/all" />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(122,92,255,0.26)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 0.8 }}
          style={styles.bgGlowTop}
        />
        <LinearGradient
          colors={['rgba(92,225,230,0.22)', 'transparent']}
          start={{ x: 1, y: 1 }}
          end={{ x: 0.2, y: 0.2 }}
          style={styles.bgGlowBottom}
        />
      </View>

      <View style={styles.container}>
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

            <View style={styles.tagRow}>
              {['Inbox-first', 'Auto-tagged', 'Share from any app'].map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(3),
    justifyContent: 'center',
  },
  bgGlowTop: { position: 'absolute', top: -160, left: -80, width: 420, height: 320, borderRadius: 320 },
  bgGlowBottom: { position: 'absolute', bottom: -120, right: -60, width: 380, height: 300, borderRadius: 300 },
  card: {
    gap: theme.spacing(3),
    alignItems: 'stretch',
    justifyContent: 'space-between',
    borderRadius: theme.radius,
    padding: theme.spacing(4),
    backgroundColor: theme.colors.glassBg,
    borderWidth: 1,
    borderColor: theme.colors.glassStroke,
  },
  hero: {
    alignItems: 'center',
    gap: theme.spacing(2.5),
  },
  logoShell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    width: 132,
    height: 132,
    borderRadius: 999,
    padding: 10,
    marginTop: 4,
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FBF7F7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  logoImage: {
    width: '64%',
    height: '64%',
  },
  titleBlock: {
    alignItems: 'center',
    gap: 4,
  },
  appName: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
    color: theme.colors.text,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: theme.colors.textSecondary,
  },
  titleAccent: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: theme.colors.textAccent,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing(1),
  },
  tagRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  tagText: { color: theme.colors.text, fontSize: 12, letterSpacing: 0.1 },
  actions: {
    width: '100%',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
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
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12.5,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
