declare module 'react-native-share-menu' {
  export type ShareData = { data?: any } | null;
  export type ShareListener = (data: ShareData) => void;
  const ShareMenu: {
    getInitialShare?: (cb: ShareListener) => void;
    addNewShareListener?: (cb: ShareListener) => () => void;
  };
  export default ShareMenu;
  export const ShareMenuReactView: any;
}


