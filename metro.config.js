const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for InternalBytecode.js issue
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Disable source maps in development to avoid InternalBytecode.js issues
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
