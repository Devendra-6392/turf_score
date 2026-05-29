import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/ToastConfig';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import TurfDetailScreen from './src/screens/TurfDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BookingSuccessScreen from './src/screens/BookingSuccessScreen';
import BookingDetailScreen from './src/screens/BookingDetailScreen';
import BookSlotScreen from './src/screens/BookSlotScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import ChallengesScreen from './src/screens/ChallengesScreen';
import CreateChallengeScreen from './src/screens/CreateChallengeScreen';
import ChallengeDetailScreen from './src/screens/ChallengeDetailScreen';
import MatchResultScreen from './src/screens/MatchResultScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import AttractiveBottomTab from './src/components/AttractiveBottomTab';
import AnimatedScreenWrapper from './src/components/AnimatedScreenWrapper';
import { AuthProvider } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <AttractiveBottomTab {...props} />}
    screenOptions={({ route }) => ({
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home">
      {(props) => <AnimatedScreenWrapper focused={props.navigation.isFocused()}><HomeScreen {...props} /></AnimatedScreenWrapper>}
    </Tab.Screen>
    <Tab.Screen name="Search">
      {(props) => <AnimatedScreenWrapper focused={props.navigation.isFocused()}><SearchScreen {...props} /></AnimatedScreenWrapper>}
    </Tab.Screen>
    <Tab.Screen name="Challenges">
      {(props) => <AnimatedScreenWrapper focused={props.navigation.isFocused()}><ChallengesScreen {...props} /></AnimatedScreenWrapper>}
    </Tab.Screen>
    <Tab.Screen name="Teams">
      {(props) => <AnimatedScreenWrapper focused={props.navigation.isFocused()}><TeamsScreen {...props} /></AnimatedScreenWrapper>}
    </Tab.Screen>
    <Tab.Screen name="Profile">
      {(props) => <AnimatedScreenWrapper focused={props.navigation.isFocused()}><ProfileScreen {...props} /></AnimatedScreenWrapper>}
    </Tab.Screen>
  </Tab.Navigator>
);

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="TurfDetail" component={TurfDetailScreen} />
          <Stack.Screen name="BookSlot" component={BookSlotScreen} />
          <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
          <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
          <Stack.Screen name="QRScanner" component={QRScannerScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="CreateChallenge" component={CreateChallengeScreen} />
          <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
          <Stack.Screen name="ChallengeDetailByShare" component={ChallengeDetailScreen} />
          <Stack.Screen name="MatchResult" component={MatchResultScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast config={toastConfig} position="top" topOffset={50} />
    </AuthProvider>
  );
}
