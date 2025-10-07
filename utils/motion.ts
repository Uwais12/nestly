import { useMemo } from 'react';
import { useDockState } from '@/hooks/useDockState';
import { withSpring, withTiming } from 'react-native-reanimated';

export function useMotion() {
  const { reduceMotion } = useDockState();
  return useMemo(() => {
    const spring = (to: number) => (reduceMotion ? withTiming(to, { duration: 120 }) : withSpring(to, { damping: 16, stiffness: 160 }));
    const timing = (to: number, duration = 200) => withTiming(to, { duration, easing: (t) => t });
    return { spring, timing };
  }, [reduceMotion]);
}


