type AnalyticsEvent =
  | 'home_view'
  | 'grid_scroll'
  | 'search_query'
  | 'filter_select'
  | 'dock_state_change';

export function logEvent(event: AnalyticsEvent, params?: Record<string, unknown>) {
  try {
    // Placeholder analytics. Replace with real provider (e.g., Segment, Amplitude) later.
    // Keep payload small to avoid perf issues in production.
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event}`, params ?? {});
  } catch {}
}


