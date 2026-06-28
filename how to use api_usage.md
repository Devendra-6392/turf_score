# How to Use the API Endpoints in the React Native APK

This guide explains exactly how the Turf Score mobile app connects to the backend API. It includes real examples taken from the app's source code showing how to make `GET`, `POST`, and authenticated requests using the native `fetch` API.

---

## 1. Setting up the Base URL

In the app, the base URL is centralized in `src/config/api.js`. Whenever you need to make an API call, you import `API_URL` from this file.

```javascript
// src/config/api.js
export const API_URL = 'https://turf.localhostt.live/api';
```

When using it in a screen or context:
```javascript
import { API_URL } from '../config/api';
// example: `${API_URL}/turfs`
```

---

## 2. Authentication (Login & Register)

Authentication is handled in `src/context/AuthContext.js`. The app uses `POST` requests to send user credentials to the backend.

### Example: User Login
```javascript
const BACKEND_URL = `${API_URL}/auth`;

const login = async (email, password) => {
  const res = await fetch(`${BACKEND_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  
  // Save token securely on success
  // (Token and User details are saved to SecureStore)
};
```

---

## 3. Making Authenticated Requests (Protected Routes)

Most endpoints (like creating a booking, fetching user profile, or joining a team) require the user to be logged in. You must attach the JWT token to the `Authorization` header. 

Here is how the app fetches the user's profile securely:

### Example: Fetching the User Profile
```javascript
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const fetchProfile = async (token) => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}` 
    }
  });
  
  if (!res.ok) throw new Error('Failed to fetch profile');
  const userProfile = await res.json();
  return userProfile;
};
```

---

## 4. Fetching Public Data (No Token Needed)

For public information like the list of turfs, you can make a simple `GET` request without sending a token.

### Example: Fetching Turfs
```javascript
import { API_URL } from '../config/api';

const getTurfs = async () => {
  try {
    const res = await fetch(`${API_URL}/turfs`);
    const data = await res.json();
    // data contains an array of turf objects
    return data;
  } catch (error) {
    console.error("Error fetching turfs:", error);
  }
};
```

---

## 5. Sending Data (POST / PUT Requests)

When creating a new record (like an LFP post, a booking, or a challenge), you use `POST` and pass a JSON body along with the authorization token.

### Example: Creating a "Looking For Player" (LFP) Post
```javascript
const createLfpPost = async (token, postData) => {
  const res = await fetch(`${API_URL}/lfp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      turfId: postData.turfId,
      date: postData.date,
      time: postData.time,
      sport: postData.sport,
      playersNeeded: postData.playersNeeded
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};
```

---

## Summary of Usage Rules

1. **Always import `API_URL`**: Use `${API_URL}/endpoint` to ensure the app uses the correct server depending on your environment.
2. **`GET` vs `POST`**: Use `GET` to retrieve data (default in `fetch`). Use `POST` or `PUT` to create/update data, and always include `method: 'POST'` and `body: JSON.stringify(data)`.
3. **JSON Headers**: If you are sending a body in your request, always include `'Content-Type': 'application/json'` in the headers.
4. **Auth Headers**: For private endpoints, include `'Authorization': 'Bearer ' + token` in the headers.
