const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure TypeScript files are resolved
config.resolver.sourceExts.push('ts', 'tsx');

module.exports = config;
