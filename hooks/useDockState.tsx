import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useReducer } from 'react';
import { AccessibilityInfo } from 'react-native';

type DockState = {
  isDocked: boolean;
  reduceMotion: boolean;
};

type Action =
  | { type: 'dock' }
  | { type: 'undock' };

function reducer(state: DockState, action: Action): DockState {
  switch (action.type) {
    case 'dock':
      return { ...state, isDocked: true };
    case 'undock':
      return { ...state, isDocked: false };
    default:
      return state;
  }
}

const DockContext = createContext<{
  isDocked: boolean;
  reduceMotion: boolean;
  dock: () => void;
  undock: () => void;
} | null>(null);

export function DockProvider({ children }: PropsWithChildren<{}>) {
  const [state, dispatch] = useReducer(reducer, { isDocked: false, reduceMotion: false });

  // detect reduce motion
  // Note: this API is async; we snapshot once on mount. In a full app you might subscribe.
  AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
    if (enabled !== state.reduceMotion) {
      // direct set via dispatch pattern
      // we reuse reducer by toggling based on current dock state
      // but we only need to store reduceMotion; using memo below prevents re-renders loops
      state.reduceMotion = enabled;
    }
  }).catch(() => {});

  const dock = useCallback(() => dispatch({ type: 'dock' }), []);
  const undock = useCallback(() => dispatch({ type: 'undock' }), []);

  const value = useMemo(() => ({ isDocked: state.isDocked, reduceMotion: state.reduceMotion, dock, undock }), [state.isDocked, state.reduceMotion, dock, undock]);
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

export function useDockState() {
  const ctx = useContext(DockContext);
  if (!ctx) throw new Error('useDockState must be used within DockProvider');
  return ctx;
}

// Export reducer for testing
export const __dockReducer = reducer;



