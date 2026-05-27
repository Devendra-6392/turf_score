# Quick Start Guide - Challenge System Testing

## 🎬 Getting Started

### Prerequisites
- Backend running on `http://192.168.18.23:5000`
- Frontend Expo app running
- Valid user authentication token
- WhatsApp installed (for deep link testing)

---

## 📱 Testing Flows

### Flow 1: Create a Challenge
```
1. App Home → Tap "Challenges" Tab (bottom navigator, position #3)
2. Tap the Purple "+" Button (FAB)
3. Create Challenge Screen Opens
   
   STEP 1: Sport & Type
   - Select "CRICKET" 
   - Select "TEAM"
   - Tap Next
   
   STEP 2: Details
   - Title: "Epic Cricket Rivalry"
   - Description: "Professional 11-a-side match"
   - Max Players: 11
   - Tap Next
   
   STEP 3: Turf & Date
   - Select any turf from list
   - Pick a date (next week)
   - Enter time: 14:00
   - Tap Next
   
   STEP 4: Message
   - Message: "We're unbeatable! Who dares challenge us?"
   - Review summary
   - Tap "Publish Challenge"
   
4. Success dialog appears
5. Tap "View Challenge" to see details
```

**Expected Result:** Challenge created and visible in detail screen

---

### Flow 2: Browse & Filter Challenges
```
1. Go to Challenges Tab
2. See list of challenges
3. Filter by Sport:
   - Tap "FOOTBALL" chip
   - List updates to show Football challenges only
   - Tap "ALL" to reset
4. Filter by Type:
   - Tap "INDIVIDUAL" chip
   - List updates
5. Pull down to refresh
6. Scroll to load more
```

**Expected Result:** Filters work, challenges update dynamically

---

### Flow 3: Accept a Challenge
```
1. In Challenges Feed, tap any challenge card
2. Challenge Detail screen opens
3. See challenge info:
   - Title, creator, rating
   - Sport, format, players
   - Message in orange banner
   - Turf location & date
4. Tap "Accept Challenge" button (purple)
5. Loading spinner appears
6. Success message: "Challenge Accepted! 🎉"
7. Screen shows "✓ ACCEPTED" status
```

**Expected Result:** Challenge status changes to ACCEPTED

---

### Flow 4: Share Challenge to WhatsApp
```
1. Create a new challenge (Flow 1)
2. In Challenge Detail, tap "Share to WhatsApp" button
3. WhatsApp opens with pre-filled message:
   - Challenge title
   - Challenge message
   - Deep link: exponew://challenge/share/{shareCode}
   - #TurfScore hashtags
4. Select contact and send
5. Recipient receives WhatsApp message
6. Recipient taps link → Opens your app to challenge detail
```

**Expected Result:** WhatsApp opens, message includes link, deep link works

---

### Flow 5: Test Deep Linking
```
Method 1: WhatsApp
- Share challenge to WhatsApp (Flow 4)
- Send message
- Click link in WhatsApp
- App opens directly to challenge

Method 2: Manual URL in Notes/Browser
- Copy: exponew://challenge/share/{SHARECODE}
- Open in browser on device
- App opens to challenge detail

Method 3: Expo Go Dev Testing
- Use: exp://challenge/share/{SHARECODE}
- Open in browser or share via text
- Opens in Expo Go app
```

**Expected Result:** App navigates to correct challenge detail screen

---

## 🔍 What to Verify

### Screen Validations

**ChallengesScreen:**
- [ ] Shows list of challenges
- [ ] Filters work (sport & type)
- [ ] Pull-to-refresh works
- [ ] Cards display: creator, sport, location, message
- [ ] Tap card navigates to detail
- [ ] FAB button navigates to create

**CreateChallengeScreen:**
- [ ] Step 1: Sport & type selection works
- [ ] Step 2: Form inputs (title, description, players) work
- [ ] Step 3: Date picker opens and date selects
- [ ] Step 3: Turf list shows and selection works
- [ ] Step 4: Message preview shows entered text
- [ ] Step 4: Summary shows all info correctly
- [ ] Progress bar updates each step
- [ ] Back/Next buttons work properly
- [ ] Disabled state on Step 1 back button
- [ ] Final submission creates challenge

**ChallengeDetailScreen:**
- [ ] Loads challenge data correctly
- [ ] Shows creator avatar & info
- [ ] Shows status badge (OPEN/ACCEPTED)
- [ ] Info grid shows: Sport, Format, Players
- [ ] Challenge message displays in orange banner
- [ ] Turf info shows with location
- [ ] Date & time display correctly
- [ ] Team info shows (if team challenge)
- [ ] VS card shows (if accepted team match)
- [ ] Accept button works & updates status
- [ ] WhatsApp share button opens WhatsApp
- [ ] Share button uses Share API

---

## 🐛 Common Issues & Fixes

### Issue: "Challenge not found"
**Fix:**
- Ensure backend is running
- Verify challenge ID exists
- Check token is still valid
- Check network connectivity

### Issue: WhatsApp doesn't open
**Fix:**
- Ensure WhatsApp is installed
- Check device permissions
- App falls back to Share API automatically
- Try manual deep link: `exponew://challenge/share/{code}`

### Issue: Deep link doesn't work
**Fix:**
- Verify app scheme in app.json has `exponew://`
- Test with `exp://` in Expo Go first
- Ensure challenge shareCode is valid
- Check deep linking config in App.js

### Issue: Form won't submit
**Fix:**
- Verify title is filled (required)
- Verify sport is selected
- Check internet connection
- Verify token is valid
- Check backend is responding

### Issue: Challenges not loading
**Fix:**
- Refresh the page (pull-to-refresh)
- Check backend URL: `http://192.168.18.23:5000`
- Verify token in AuthContext
- Check network request in Network tab

---

## 📊 Backend API Verification

**Test each endpoint:**

```bash
# List challenges (public)
curl http://192.168.18.23:5000/api/challenges

# Get by share code
curl http://192.168.18.23:5000/api/challenges/share/{shareCode}

# Create challenge (requires token)
curl -X POST http://192.168.18.23:5000/api/challenges \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "sportType": "CRICKET",
    "type": "INDIVIDUAL"
  }'

# Get my challenges (requires token)
curl http://192.168.18.23:5000/api/challenges/me \
  -H "Authorization: Bearer {token}"

# Accept challenge (requires token)
curl -X POST http://192.168.18.23:5000/api/challenges/{id}/accept \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

---

## 📝 Notes

- All screens use Colors from `src/constants/Colors.js`
- Authentication via `src/context/AuthContext.js`
- Backend URL configured: `http://192.168.18.23:5000/api`
- Deep link scheme: `exponew://`
- All APIs require valid JWT token (except listing)

---

## ✅ Checklist for Full Testing

### Essential Tests
- [ ] Create challenge - all 4 steps
- [ ] View challenge feed - filters work
- [ ] Accept challenge - status updates
- [ ] Share to WhatsApp - message includes link
- [ ] Deep link works - app navigates correctly

### Additional Tests  
- [ ] Error handling - invalid input
- [ ] Network error - graceful failure
- [ ] Token expiration - re-login prompt
- [ ] Empty states - no challenges, no turfs
- [ ] Loading states - spinners appear correctly
- [ ] Animations - smooth transitions

---

## 🎉 Ready to Test!

The Challenge System is fully implemented and ready for comprehensive testing. Follow the flows above to validate all functionality.

**Questions?** Check the main implementation document: `CHALLENGE_IMPLEMENTATION_COMPLETE.md`
