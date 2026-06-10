import Constants from 'expo-constants';

let BASE_API_URL = 'http://10.147.107.203:5000/api'; // Fallback

// Dynamically grab the IP address of the machine running the Expo Metro bundler!
// This ensures that even if your Wi-Fi IP changes, the app always connects to the right backend.
const hostUri = Constants.expoConfig?.hostUri;
if (hostUri) {
  const hostIp = hostUri.split(':')[0];
  BASE_API_URL = `http://${hostIp}:5000/api`;
} else if (Constants.expoConfig?.extra?.API_URL) {
  BASE_API_URL = Constants.expoConfig.extra.API_URL;
}

export const API_URL = BASE_API_URL;
export default API_URL;
