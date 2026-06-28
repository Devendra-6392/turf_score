# API Endpoints Documentation

Base URL: `http://<your-server-ip>:5500` (or your domain, e.g., `https://api.yourdomain.com`)

All protected routes require a JWT token in the Authorization header:
`Authorization: Bearer <your_jwt_token>`

---

## 1. Authentication & User Profile

### Signup
- **Endpoint:** `POST /auth/register`
- **Description:** Register a new user.
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890"
  }
  ```
- **Response:** User object and JWT Token.

### Login
- **Endpoint:** `POST /auth/login`
- **Description:** Authenticate a user and get a token.
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** User object and JWT Token.

### User Profile
- **Endpoint:** `GET /auth/me` (or `GET /auth/profile`)
- **Description:** Get the currently logged-in user's profile details.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** User details including wallet balance.

### Logout
- **Endpoint:** *Client-side action*
- **Description:** Logout is typically handled on the client-side by deleting the JWT token from local storage/async storage. If you have token blacklisting, you might call `POST /auth/logout`.

---

## 2. Turfs

### Turf List
- **Endpoint:** `GET /turfs`
- **Description:** Get a list of all available turfs. Can include query parameters for filtering (e.g., location, sport).
- **Response:** Array of turf objects.

### Turf Detail
- **Endpoint:** `GET /turfs/:id`
- **Description:** Get detailed information about a specific turf.
- **Response:** Single turf object with amenities, location, images, etc.

---

## 3. Slots & Bookings

### Get Available Slots
- **Endpoint:** `GET /turfs/:id/slots` (or `GET /bookings/slots?turfId=:id&date=YYYY-MM-DD`)
- **Description:** Get available time slots for a specific turf on a given date.
- **Response:** Array of available and booked slots.

### Create Booking
- **Endpoint:** `POST /bookings`
- **Description:** Book a slot for a turf.
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "turfId": "123",
    "date": "2026-06-28",
    "startTime": "18:00",
    "endTime": "19:00",
    "paymentMethod": "wallet" // or "online", "cod"
  }
  ```
- **Response:** Booking confirmation details.

### My Bookings
- **Endpoint:** `GET /bookings/my-bookings` (or `GET /bookings/user`)
- **Description:** Get a list of bookings made by the current user.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Array of user's past and upcoming bookings.

---

## 4. Teams & Challenges

### Create Team
- **Endpoint:** `POST /teams`
- **Description:** Create a new team for challenges.
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "FC Strikers",
    "sport": "football",
    "description": "Local football team"
  }
  ```

### Challenges List
- **Endpoint:** `GET /challenges`
- **Description:** Get a list of open challenges from other teams.
- **Response:** Array of challenge objects.

### Create Challenge
- **Endpoint:** `POST /challenges`
- **Description:** Create a challenge against another team or an open challenge.
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "turfId": "123",
    "date": "2026-06-29",
    "time": "19:00",
    "wagerAmount": 500
  }
  ```

---

## 5. Wallet & Coupons

### Get Wallet Balance
- **Endpoint:** `GET /auth/wallet` (or part of `GET /auth/me`)
- **Description:** Retrieve current wallet balance and transaction history.
- **Headers:** `Authorization: Bearer <token>`

### Apply Coupon
- **Endpoint:** `POST /coupons/apply`
- **Description:** Validate and apply a coupon code for a discount during booking.
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "code": "SUMMER50",
    "bookingAmount": 1000
  }
  ```
- **Response:** Discount amount and final price.
