declare module 'expo-share-intent' {
  export type SharedItem = { mimeType?: string; data?: string[] };
  export function getSharedData(): Promise<SharedItem[] | null>;
  export function clearSharedData(): Promise<void>;
  export function addListener(cb: (items: SharedItem[] | null) => void): { remove: () => void };
}


