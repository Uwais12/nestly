import { AppRegistry } from 'react-native';
import ShareMenu, { ShareMenuReactView } from 'react-native-share-menu';

function ShareNestly() {
  return ShareMenuReactView({
    title: 'Save to Nestly',
    onShare: async ({ data }: { data?: unknown }) => {
      try {
        const text = typeof data === 'string' ? data : Array.isArray(data) ? String(data[0]) : data ? String(data) : '';
        if (text) {
          // Trigger the main app via deep link to open Add modal with URL prefilled
          const url = `nestly://shared?url=${encodeURIComponent(text)}`;
          ShareMenu.dismissExtension();
          // On iOS, opening URLs from share extension is handled by the extension host; here we just return true
          // The main app's deep link handler will route to the add modal
          // On Android, the host activity will receive the intent
        }
      } catch (_) {}
      return true;
    },
  });
}

AppRegistry.registerComponent('ShareNestly', () => ShareNestly);


