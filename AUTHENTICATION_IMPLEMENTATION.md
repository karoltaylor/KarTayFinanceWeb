# X-User-ID Authentication Implementation

## 🎯 Overview

Your application now uses **X-User-ID header authentication** to communicate with the backend API.

---

## 🔄 Authentication Flow

```
1. User signs in with Firebase (Google/Facebook/GitHub)
   ↓
2. Frontend calls /api/users/register with OAuth data
   ↓
3. Backend returns user_id (MongoDB ObjectId)
   ↓
4. Frontend stores user_id in localStorage
   ↓
5. All subsequent API calls include X-User-ID header
```

---

## 💾 LocalStorage Management

### User ID Storage

The `user_id` from the backend is automatically stored in localStorage:

```javascript
// Automatically stored after successful registration
localStorage.setItem('backend_user_id', user_id);

// Automatically cleared on logout
localStorage.removeItem('backend_user_id');
```

### Manual Access (if needed)

```javascript
import { setUserId } from './services/api';

// Get current user ID
const userId = localStorage.getItem('backend_user_id');

// Set user ID
setUserId('some-user-id');

// Clear user ID
setUserId(null);
```

---

## 📡 API Request Headers

Every authenticated API request automatically includes:

```http
POST /api/wallets HTTP/1.1
Host: localhost:8000
Content-Type: application/json
X-User-ID: 507f1f77bcf86cd799439011
```

The `X-User-ID` header is automatically added by the `fetchAPI` wrapper in `src/services/api.js`.

---

## 🔐 User Registration Payload

When a user signs in with Firebase, the frontend sends:

```javascript
POST /api/users/register
{
  "email": "user@example.com",
  "username": "user",
  "oauth_provider": "google",  // or "facebook", "github"
  "oauth_id": "firebase-uid-here"
}
```

**Backend Response:**

```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "username": "user",
  "oauth_provider": "google",
  "oauth_id": "firebase-uid-here",
  "created_at": "2024-10-06T10:00:00Z"
}
```

---

## 🛠️ Implementation Details

### API Service (`src/services/api.js`)

```javascript
// Automatically includes X-User-ID header
async function fetchAPI(endpoint, options = {}) {
  const userId = getUserId();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(userId && { 'X-User-ID': userId }),
      ...options.headers,
    },
    ...options,
  };
  
  // ... fetch logic
}
```

### Auth Context (`src/contexts/AuthContext.jsx`)

```javascript
// Registers user and stores user_id
const backendUserData = await registerUser({
  email: firebaseUser.email,
  username: firebaseUser.displayName,
  oauth_provider: oauthProvider,
  oauth_id: firebaseUser.uid,
});

// user_id automatically stored in localStorage by registerUser()
```

### Finance Manager (`src/pages/FinanceManager/FinanceManager.jsx`)

```javascript
// All wallet operations automatically authenticated via X-User-ID header
const wallets = await getWallets();
const newWallet = await createWallet({ name: 'My Wallet' });
await deleteWallet(walletId);
```

---

## 📋 Available API Functions

All functions automatically include the `X-User-ID` header:

### User APIs
```javascript
import { registerUser } from './services/api';

const user = await registerUser({
  email,
  username,
  oauth_provider,
  oauth_id
});
```

### Wallet APIs
```javascript
import { getWallets, createWallet, deleteWallet } from './services/api';

const wallets = await getWallets();
const wallet = await createWallet({ name: 'Savings' });
await deleteWallet(walletId);
```

### Transaction APIs
```javascript
import { uploadTransactions, getTransactions } from './services/api';

await uploadTransactions(file);
const transactions = await getTransactions();
```

### Stats & Assets APIs
```javascript
import { getStats, getAssets } from './services/api';

const stats = await getStats();
const assets = await getAssets();
```

---

## 🧪 Testing the Authentication

### 1. Check User Registration

Open the browser console and sign in. You should see:

```
👤 Registering/verifying user in backend...
✅ User registered in backend: { user_id: "...", email: "..." }
💾 User ID stored in localStorage: 507f1f77bcf86cd799439011
```

### 2. Verify LocalStorage

```javascript
// In browser console
localStorage.getItem('backend_user_id')
// Should return: "507f1f77bcf86cd799439011"
```

### 3. Check API Requests

Open DevTools → Network tab → Look at any API request → Headers:

```
Request Headers:
  X-User-ID: 507f1f77bcf86cd799439011
  Content-Type: application/json
```

---

## 🔍 Debugging

### User ID Not Stored

**Symptom**: Wallets don't load, getting 401/403 errors

**Solution**:
1. Check console for `💾 User ID stored in localStorage`
2. Verify backend returns `user_id` in registration response
3. Check localStorage: `localStorage.getItem('backend_user_id')`

### Wrong User ID Format

**Symptom**: Backend rejects user_id

**Solution**:
- Backend expects MongoDB ObjectId (24 hex characters)
- Check registration response format matches backend expectations

### Authentication Errors After Logout

**Symptom**: Getting authentication errors after signing out

**Solution**:
- User ID is automatically cleared on logout
- Hard refresh the page if needed: Ctrl+Shift+R

---

## 🔒 Security Notes

### Current Implementation (Development)

⚠️ **Not production-ready**:
- Client sends user_id in header
- Backend trusts the user_id without verification
- Anyone can impersonate any user by changing the header

### For Production

Consider implementing **Firebase ID Token Verification**:

```javascript
// Get Firebase ID token
const token = await firebase.auth().currentUser.getIdToken();

// Send in Authorization header
headers: {
  'Authorization': `Bearer ${token}`
}

// Backend verifies token with Firebase Admin SDK
// Backend extracts user_id from verified token
```

See your backend documentation for Firebase token verification setup.

---

## 📊 Request/Response Examples

### Creating a Wallet

**Request:**
```http
POST /api/wallets HTTP/1.1
Host: localhost:8000
Content-Type: application/json
X-User-ID: 507f1f77bcf86cd799439011

{
  "name": "My Savings"
}
```

**Response:**
```json
{
  "id": "507f191e810c19729de860ea",
  "name": "My Savings",
  "balance": 0,
  "user_id": "507f1f77bcf86cd799439011",
  "created_at": "2024-10-06T10:00:00Z"
}
```

### Getting Wallets

**Request:**
```http
GET /api/wallets HTTP/1.1
Host: localhost:8000
X-User-ID: 507f1f77bcf86cd799439011
```

**Response:**
```json
[
  {
    "id": "507f191e810c19729de860ea",
    "name": "My Savings",
    "balance": 1500.50,
    "user_id": "507f1f77bcf86cd799439011"
  },
  {
    "id": "507f191e810c19729de860eb",
    "name": "Checking",
    "balance": 3200.00,
    "user_id": "507f1f77bcf86cd799439011"
  }
]
```

---

## ✅ Checklist

Before testing, ensure:

- [x] Backend is running on `http://localhost:8000`
- [x] Backend `/api/users/register` endpoint is working
- [x] Backend returns `user_id` in registration response
- [x] Backend accepts `X-User-ID` header for authenticated endpoints
- [x] Firebase authentication is configured
- [x] `.env` file has `VITE_API_BASE_URL` set

---

## 🎉 You're All Set!

The authentication system is fully implemented and working. Just:

1. **Start your backend**: `python main.py` or `uvicorn main:app --reload`
2. **Start the frontend**: `npm run dev`
3. **Sign in** with Google/Facebook/GitHub
4. **Watch the console** for authentication logs
5. **Create wallets** and see them sync with the backend!

---

**Questions?** Check the logs in the browser console - they show every step of the authentication process! 🚀

