module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Expo preset
      'babel-preset-expo',
    ],
    plugins: [
      // Required for Reanimated
      'react-native-reanimated/plugin',
    ],
  };
};


