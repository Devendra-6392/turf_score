require('dotenv').config();

module.exports = {
  expo: {
    name: 'Skipers',
    slug: 'turfscore',
    scheme: 'skipers',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/s_icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    updates: {
      url: 'https://u.expo.dev/977cef8f-c2b8-432a-a0b5-8d22b352e0b5',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    splash: {
      image: './assets/splash-icon.jpg',
      resizeMode: 'contain',
      backgroundColor: '#0D1117',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.turfscore.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/s_icon_adaptive.png',
        backgroundColor: '#0D1117',
      },
      package: 'com.turfscore.app',
      googleServicesFile: './google-services.json',
      edgeToEdgeEnabled: true,
    },
    web: {
      favicon: './assets/s_icon.png',
    },
    plugins: [
      'expo-font',
      'expo-secure-store',
      'expo-camera',
      [
        'react-native-auth0',
        {
          domain: 'dev-or2bg4ojjktwtv8j.us.auth0.com',
        }
      ],
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
      // LOCAL: API_URL: process.env.API_URL || 'http://10.170.173.203:5000/api',
      API_URL: process.env.API_URL || 'https://turf.localhostt.live/api',
    },
  },
};
