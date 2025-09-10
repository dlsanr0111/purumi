import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Purumi',
  slug: 'purumi',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#88C8C3',
  },
  assetBundlePatterns: [
    '**/*',
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.purumi.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: '이 앱은 클리닉 위치를 표시하고 길찾기 기능을 제공하기 위해 위치 정보를 사용합니다.',
      NSCameraUsageDescription: '이 앱은 리뷰에 사진을 첨부하기 위해 카메라를 사용합니다.',
      NSPhotoLibraryUsageDescription: '이 앱은 리뷰에 사진을 첨부하기 위해 사진 라이브러리에 접근합니다.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#88C8C3',
    },
    package: 'com.purumi.app',
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: '이 앱은 클리닉 위치를 표시하고 길찾기 기능을 제공하기 위해 위치 정보를 사용합니다.',
      },
    ],
    [
      'expo-av',
      {
        microphonePermission: false,
      },
    ],
  ],
  extra: {
    supabaseUrl: 'https://iaeadujcimzpkzfwsqwr.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWFkdWpjaW16cGt6ZndzcXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDQwODIsImV4cCI6MjA3Mjk4MDA4Mn0.CvxRL_tqq2qtTaqE_eZItividP4Liu37rLs9zP-Bqcw',
  },
});
