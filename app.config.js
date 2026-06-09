require('dotenv').config();

module.exports = {
  expo: {
    name: 'Turf Score',
    slug: 'turf-score',
    scheme: 'turfscore',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    updates: {
      url: 'https://u.expo.dev/5b260de2-b539-4f92-a9f3-18e3e62bf2c1',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.turfscore.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.turfscore.app',
      edgeToEdgeEnabled: true,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-font',
      'expo-secure-store',
      'expo-camera',
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: '35.0.0',
            minSdkVersion: 26,
          },
          ios: {
            deploymentTarget: '15.1',
          },
        },
      ],
    ],
    extra: {
      eas: {
        projectId: '5b260de2-b539-4f92-a9f3-18e3e62bf2c1',
      },
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_Sx2Yhd3xvB6nWM',
      API_URL: process.env.API_URL || 'http://10.65.234.203:5000/api',
    },
  },
};
