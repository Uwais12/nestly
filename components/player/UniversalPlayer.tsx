// components/player/UniversalPlayer.tsx
import { useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Image as RNImage, StyleSheet, View, Text } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';
import { theme } from '@/constants/theme';
import { getYouTubeId, instagramEmbedUrl } from '@/lib/url';

type Props = { url: string; platform: 'youtube'|'tiktok'|'instagram'|'web'; thumbnail?: string; active?: boolean; height?: number };

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

export function UniversalPlayer({ url, platform, thumbnail, active = true, height = 220 }: Props) {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [play, setPlay] = useState(false);

  useEffect(() => { setPlay(active); }, [active]);

  const content = useMemo(() => {
    if (platform === 'youtube') {
      const id = getYouTubeId(url);
      if (!id) return null;
      return (
        <YoutubePlayer
          height={height}
          videoId={id}
          play={play}
          initialPlayerParams={{ modestbranding: true, controls: true, mute: true }}
          onReady={() => setLoading(false)}
          onError={() => { setLoading(false); setFailed(true); }}
        />
      );
    }

    let src = url;
    if (platform === 'instagram') src = instagramEmbedUrl(url) ?? url;

    // Beefed-up CSS to hide IG/TikTok callouts + keep background clean
    const injectedCSS = `
      * { -webkit-tap-highlight-color: transparent !important; }
      header, footer, .banner, .video-metadata, ._ab8w, ._ab8x, ._aamw, ._aamx,
      [data-e2e="video-share"], [data-e2e="feed-prompt-panel"], [data-e2e="browser-openapp-button"],
      [data-e2e="browser-login-button"], [data-e2e="channel-card"], [data-e2e="user-card"],
      [class*="SharePanel"], [class*="OpenApp"], [class*="BottomSheet"], [class*="Login"],
      [role="dialog"], [data-testid="app-banner"] { display: none !important; }
      body, html { background:#000 !important; }
    `;

    return (
      <WebView
        source={{ uri: src, headers: { 'User-Agent': UA } }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        startInLoadingState
        injectedJavaScript={`(function(){var s=document.createElement('style');s.innerHTML=${JSON.stringify(injectedCSS)};document.head.appendChild(s);})(); true;`}
        onLoadEnd={() => setLoading(false)}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
        style={[styles.web, { height }]}
      />
    );
  }, [url, platform, height, play]);

  if (failed) {
    return (
      <View style={[styles.box, styles.center, { height }]}>
        <Text style={styles.fallback}>Playback unavailable. Use Open in App or Browser.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.box, { height }]}>
      {(!active && thumbnail) ? (
        <RNImage source={{ uri: thumbnail }} style={{ width: '100%', height }} resizeMode="cover" />
      ) : content}
      {loading && (
        <View style={[StyleSheet.absoluteFillObject, styles.center]}>
          <ActivityIndicator color={theme.colors.brand} />
          <Text style={styles.loadingText}>Tap to play if paused</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {  overflow: 'hidden' },
  // web: { borderRadius: theme.radius },
  center: { alignItems: 'center', justifyContent: 'center' },
  fallback: { color: theme.colors.textMuted, padding: 12, textAlign: 'center' },
  loadingText: { marginTop: 8, color: theme.colors.textMuted, fontSize: 12 },
});
