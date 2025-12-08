import { useMemo } from 'react';
import { withSpring, withTiming } from 'react-native-reanimated';
import { useDockState } from '@/hooks/useDockState';
import { theme } from '@/constants/theme';

export function useMotion() {
  const { reduceMotion } = useDockState();
  const easing = theme.motion.easing.standard;
  return useMemo(() => {
    const spring = (to: number) =>
      reduceMotion ? withTiming(to, { duration: theme.motion.durationSm, easing }) : withSpring(to, { damping: 16, stiffness: 160 });
    const timing = (to: number, duration = theme.motion.durationMd) => withTiming(to, { duration, easing });
    const fade = (to: number, duration = theme.motion.durationSm) => withTiming(to, { duration, easing });
    return { spring, timing, fade };
  }, [reduceMotion, easing]);
}
