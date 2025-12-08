import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Appearance = 'system' | 'dark';
type Prefs = { appearance: Appearance; notificationsEnabled: boolean };

const KEY = 'nestly:prefs:v1';
const DEFAULT_PREFS: Prefs = { appearance: 'system', notificationsEnabled: false };

export function usePreferences() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Prefs;
          setPrefs({ ...DEFAULT_PREFS, ...parsed });
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Prefs) => {
    setPrefs(next);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const setAppearance = useCallback(
    (appearance: Appearance) => {
      persist({ ...prefs, appearance });
    },
    [prefs, persist],
  );

  const toggleNotifications = useCallback(() => {
    persist({ ...prefs, notificationsEnabled: !prefs.notificationsEnabled });
  }, [prefs, persist]);

  return { prefs, loading, setAppearance, toggleNotifications };
}
