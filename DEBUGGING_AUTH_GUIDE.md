# Authentication Debugging Guide for AWS Amplify

## Overview

This guide helps you debug authentication issues on AWS Amplify using the extensive logging added throughout the authentication flow.

---

## 📊 Log Legend

| Emoji | Meaning |
|-------|---------|
| 🚀 | Application/Feature Start |
| 🔵 | Auth Context Initialization |
| 🔔 | Auth State Change |
| 🔐 | Login Attempt |
| 🛡️ | Protected Route Check |
| 🔥 | Firebase Initialization |
| 👤 | User Registration/Backend |
| 🔄 | Redirect Flow |
| 🪟 | Popup Flow |
| 📍 | Location/URL Info |
| 📊 | State Info |
| 🌍 | Environment Info |
| ✅ | Success |
| ❌ | Error |
| ⚠️ | Warning |
| ⏳ | Loading |
| 🚫 | Access Denied |
| 🚪 | Logout |
| 🏁 | Completion |

---

## 🔍 Expected Log Flow (Successful Authentication)

### On Initial Page Load (Before Login)

```
🚀 ========== APP MOUNTED ==========
🌍 Environment Info: { hostname, href, pathname, ... }
🔧 Environment Variables: { apiBaseUrl, firebaseProjectId, hasFirebaseApiKey }

🔥 ========== FIREBASE INITIALIZATION ==========
🔥 Firebase Config: { authDomain, projectId, hasApiKey, hasAppId }
✅ Firebase app initialized
✅ Firebase Auth initialized

🔵 ========== AUTH INITIALIZATION START ==========
🔵 Initializing auth...
🌍 Environment: { hostname, href, isLocalhost, authMode }
🔵 Setting up auth state listener...

🔔 ========== AUTH STATE CHANGED ==========
🔔 Auth state changed: ❌ No user
🚪 User logged out, clearing state...
✅ User state cleared
🏁 Setting loading to false...
🏁 Auth state change handling complete
🔵 ========== AUTH STATE CHANGED END ==========

📊 AuthProvider state: { hasUser: false, hasBackendUser: false, loading: false, ... }

🛡️ ========== PROTECTED ROUTE CHECK ==========
🛡️ ProtectedRoute state: { loading: false, hasUser: false, userEmail: 'N/A' }
🚫 No user found - showing Login page
🔐 Rendering Login page
```

### When User Clicks Login Button (Redirect Mode - AWS Amplify)

```
🔐 ========== LOGIN: GOOGLE BUTTON CLICKED ==========
📍 Current URL: https://your-app.amplifyapp.com/
🔐 Calling google sign-in function...

🚀 ========== GOOGLE SIGN-IN INITIATED ==========
🔄 Initiating Google sign-in with REDIRECT...
📍 Current location before redirect: https://your-app.amplifyapp.com/

[Browser redirects to Google OAuth page]
```

### After Google OAuth (User Returns to App)

```
🚀 ========== APP MOUNTED ==========
🌍 Environment Info: { hostname, href, pathname, ... }

🔥 ========== FIREBASE INITIALIZATION ==========
✅ Firebase app initialized
✅ Firebase Auth initialized

🔵 ========== AUTH INITIALIZATION START ==========
🔵 Initializing auth...
🌍 Environment: { hostname, href, isLocalhost: false, authMode: 'REDIRECT' }

🆕 Creating redirect check promise...
📍 Current URL: https://your-app.amplifyapp.com/
🔍 Checking for redirect result...
✅ Persistence set to LOCAL
✅ Redirect authentication successful! { email, uid, provider }

🔵 Setting up auth state listener...

🔔 ========== AUTH STATE CHANGED ==========
🔔 Auth state changed: ✅ User authenticated
👤 Firebase User Details: { email, uid, displayName, providerId, emailVerified }

🔄 Starting backend registration/verification...
📤 Sending registration request to backend: { email, username, oauth_provider, oauth_id }

📡 POST /api/users/register { userId: ..., body: {...} }
✅ POST /api/users/register response: { user_id, email, ... }
💾 User ID stored in localStorage: [user_id]

✅ Backend registration successful: { user_id, email, ... }
✅ Backend user state updated

🏁 Setting loading to false...
🏁 Auth state change handling complete
🔵 ========== AUTH STATE CHANGED END ==========

📊 AuthProvider state: { hasUser: true, hasBackendUser: true, loading: false, isAuthenticated: true }

🛡️ ========== PROTECTED ROUTE CHECK ==========
🛡️ ProtectedRoute state: { loading: false, hasUser: true, userEmail: 'user@email.com' }
✅ User authenticated - rendering protected content
✅ Rendering protected content
```

---

## 🚨 Common Issues & How to Identify Them

### Issue 1: Stuck in Redirect Loop (Redirecting Back to Login)

**What You'll See in Logs:**

```
🔔 ========== AUTH STATE CHANGED ==========
🔔 Auth state changed: ❌ No user
```

**Possible Causes:**

1. **Redirect result not being captured**
   - Look for: `🔍 Checking for redirect result...`
   - Should be followed by: `✅ Redirect authentication successful!`
   - If you see: `ℹ️ No pending redirect result` → Firebase didn't complete the redirect

2. **Firebase Config Issue**
   - Check: `🔥 Firebase Config:` logs
   - Ensure `hasApiKey: true` and `hasAppId: true`
   - Ensure `authDomain` matches your Firebase project

3. **Environment Variables Not Set in Amplify**
   - Check: `🔧 Environment Variables:` logs
   - Ensure all Firebase vars are present

**Solution:**
- Verify Firebase config in AWS Amplify environment variables
- Check Firebase Console → Authentication → Settings → Authorized Domains
- Add your Amplify domain to Firebase authorized domains

---

### Issue 2: Backend Registration Fails

**What You'll See in Logs:**

```
❌ ========== BACKEND REGISTRATION ERROR ==========
❌ Error registering user in backend: [error message]
⚠️ Continuing with Firebase-only auth (no backend user)
```

**Possible Causes:**

1. **VITE_API_BASE_URL not set or incorrect**
   - Check: `🔧 Environment Variables:` → `apiBaseUrl`
   - Should be your backend API URL

2. **Backend API not accessible**
   - Check browser Network tab for API call
   - Look for CORS errors

3. **Backend API endpoint mismatch**

**Solution:**
- Set `VITE_API_BASE_URL` in Amplify environment variables
- Verify backend is running and accessible
- Check CORS configuration on backend

---

### Issue 3: Auth State Not Persisting

**What You'll See in Logs:**

After login, on page refresh:
```
🔔 Auth state changed: ❌ No user
```

**Possible Causes:**

1. **Persistence not set correctly**
   - Look for: `✅ Persistence set to LOCAL`
   - Should appear before auth state listener

2. **Cookies/LocalStorage blocked**

**Solution:**
- Check browser console for storage errors
- Ensure cookies are enabled
- Check for third-party cookie restrictions

---

### Issue 4: Wrong Auth Mode (Using Popup on Production)

**What You'll See in Logs:**

```
🔧 Auth Mode: POPUP (Development)
```

But you're on AWS Amplify (not localhost)

**Possible Causes:**

- `isLocalhost` detection failing
- Check: `🌍 Environment: { hostname, isLocalhost, authMode }`

**Solution:**
- Should show `authMode: 'REDIRECT'` on production
- If not, there's a hostname detection issue

---

### Issue 5: Firebase Not Initialized

**What You'll See in Logs:**

```
❌ Firebase API Key not configured! Check your .env file.
❌ Firebase Project ID not configured! Check your .env file.
```

**Solution:**
- Add Firebase environment variables in AWS Amplify Console:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

---

## 📋 Debugging Checklist

When experiencing login issues on AWS Amplify, check these in order:

### 1. Environment Variables (AWS Amplify Console)

```bash
✅ VITE_FIREBASE_API_KEY=...
✅ VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
✅ VITE_FIREBASE_PROJECT_ID=your-project
✅ VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
✅ VITE_FIREBASE_MESSAGING_SENDER_ID=...
✅ VITE_FIREBASE_APP_ID=...
✅ VITE_API_BASE_URL=https://your-backend-api.com
```

### 2. Firebase Console → Authentication → Settings

- ✅ Authorized domains includes your Amplify domain
  - Example: `main.d1a2b3c4d5e6f7.amplifyapp.com`
- ✅ Google Sign-in enabled
- ✅ OAuth redirect domain configured

### 3. Browser Console Logs

Open Developer Tools → Console and look for:

- ✅ `🔥 Firebase Config:` shows valid config
- ✅ `🌍 Environment:` shows correct hostname and authMode
- ✅ `🔍 Checking for redirect result...`
- ✅ `✅ Redirect authentication successful!`
- ✅ `🔔 Auth state changed: ✅ User authenticated`
- ✅ `✅ Backend registration successful`

### 4. Browser Network Tab

- ✅ No CORS errors
- ✅ API calls to backend succeed (if backend configured)
- ✅ Firebase auth requests succeed

---

## 🔧 How to Set Environment Variables in AWS Amplify

1. Go to AWS Amplify Console
2. Select your app
3. Go to **App settings** → **Environment variables**
4. Add each variable from your `.env` file
5. **Important:** Redeploy your app after adding variables

---

## 📱 Testing Locally vs Production

### Local Testing (Popup Mode)
```
🔧 Auth Mode: POPUP (Development)
```
- Uses popup windows for OAuth
- Faster for development
- Works on localhost

### Production Testing (Redirect Mode)
```
🔧 Auth Mode: REDIRECT (Production)
```
- Uses redirects for OAuth
- Required for hosted environments (AWS Amplify)
- Avoids COOP (Cross-Origin-Opener-Policy) issues

---

## 🆘 Still Having Issues?

### Capture Complete Logs

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Clear console (🚫 icon)
4. Attempt login
5. Copy ALL console logs (right-click → Save as...)
6. Look for any red errors (❌)

### Key Information to Check

1. **What is the URL after Google redirects back?**
   - Look for: `📍 Current URL:` after redirect

2. **Does redirect result exist?**
   - Look for: `✅ Redirect authentication successful!` OR `ℹ️ No pending redirect result`

3. **Is auth state changing?**
   - Look for: `🔔 Auth state changed:` with user email

4. **Are there any errors?**
   - Look for: `❌` errors in logs

---

## 💡 Quick Fixes

### Fix 1: Clear Browser Storage

```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Fix 2: Check Firebase Authorized Domains

Firebase Console → Authentication → Settings → Authorized domains

Must include:
- `localhost` (for development)
- `your-app.amplifyapp.com` (your Amplify domain)

### Fix 3: Verify Redirect URI

The URI Firebase redirects to should be:
```
https://your-app.amplifyapp.com
```

NOT:
```
https://your-app.amplifyapp.com/login
https://your-app.amplifyapp.com/callback
```

---

## 📞 Support

If you're still experiencing issues after checking all of the above:

1. Gather complete console logs
2. Check Network tab for failed requests
3. Note the exact step where authentication fails
4. Review the corresponding section in this guide

---

**Last Updated:** 2025-01-09

