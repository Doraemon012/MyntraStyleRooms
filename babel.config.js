module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for react-native-webrtc
      'react-native-reanimated/plugin',
    ],
  };
};
