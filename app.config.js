require('dotenv').config();

module.exports = {
  expo: {
    name: 'Turf Score',
    slug: 'turfscore',
    scheme: 'turfscore',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    updates: {
      url: 'https://u.expo.dev/977cef8f-c2b8-432a-a0b5-8d22b352e0b5',
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
      googleServicesFile: './google-services.json',
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
        projectId: '977cef8f-c2b8-432a-a0b5-8d22b352e0b5',
      },
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_Sx2Yhd3xvB6nWM',
      API_URL: process.env.API_URL || 'http://10.147.107.203:5000/api',
    },
  },
};
