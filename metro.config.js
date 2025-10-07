const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for InternalBytecode.js issue
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// WebRTC module resolution
config.resolver.alias = {
  'react-native-webrtc': 'react-native-webrtc',
  // Ensure reanimated's validate-worklets can resolve deep semver paths
  'semver/functions/satisfies': require.resolve('semver/functions/satisfies.js'),
  'semver/functions/prerelease': require.resolve('semver/functions/prerelease.js'),
};

// Disable source maps in development to avoid InternalBytecode.js issues
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
