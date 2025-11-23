const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
  '@/src': path.resolve(__dirname, './src'),
  '@/services': path.resolve(__dirname, './src/services'),
  '@/components': path.resolve(__dirname, './src/components'),
  '@/firebase': path.resolve(__dirname, './src/firebase.ts'),
};

module.exports = config;