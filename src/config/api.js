// ============================================
// LOCAL DEVELOPMENT CONFIG (uncomment to use)
// ============================================
// import Constants from 'expo-constants';
// let BASE_API_URL = 'http://10.170.173.203:5000/api'; // Fallback
// const hostUri = Constants.expoConfig?.hostUri;
// if (hostUri) {
//   const hostIp = hostUri.split(':')[0];
//   BASE_API_URL = `http://${hostIp}:5000/api`;
// } else if (Constants.expoConfig?.extra?.API_URL) {
//   BASE_API_URL = Constants.expoConfig.extra.API_URL;
// }
// export const API_URL = BASE_API_URL;

// ============================================
// DEPLOYED BACKEND (comment out to use local)
// ============================================
export const API_URL = 'https://turf.localhostt.live/api';

export default API_URL;
