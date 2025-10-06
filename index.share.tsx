import { AppRegistry } from 'react-native';
import ShareMenu, { ShareMenuReactView } from 'react-native-share-menu';
import { createItemViaUnfurl } from './lib/api';

function ShareNestly() {
  return ShareMenuReactView({
    title: 'Save to Nestly',
    onShare: async ({ data }: { data?: unknown }) => {
      try {
        const text = typeof data === 'string' ? data : Array.isArray(data) ? String(data[0]) : data ? String(data) : '';
        if (text) {
          await createItemViaUnfurl(text);
        }
      } catch (_) {}
      return true;
    },
  });
}

AppRegistry.registerComponent('ShareNestly', () => ShareNestly);


