import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Plotto',
  slug: 'plotto',
  version: '0.0.1',
  orientation: 'portrait',
  scheme: 'plotto',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.getplotto.app',
  },
  android: {
    package: 'com.getplotto.app',
    adaptiveIcon: {
      backgroundColor: '#fbf8f4',
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: '21f4e83b-291f-4f05-a738-c0d06986a885',
    },
  },
};

export default config;
