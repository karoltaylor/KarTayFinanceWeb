# Backend API Integration Guide

This document explains how the frontend integrates with the backend API for user and wallet management.

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [API Service](#api-service)
4. [Authentication Flow](#authentication-flow)
5. [Wallet Management](#wallet-management)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## Overview

The application uses a FastAPI backend (assumed to be running on `http://localhost:8000`) that provides:

- **User Management**: Create, read, update, and delete users
- **Wallet Management**: Create, read, update, and delete wallets for users
- **Automatic Integration**: Users are automatically created in the backend when they sign in with Firebase Auth

---

## Configuration

### Environment Variables

Create a `.env` file in the project root (copy from `env.template`):

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8000
```

### Backend API Endpoints

The backend should expose the following endpoints:

#### User Endpoints
- `POST /users/` - Create a new user
- `GET /users/firebase/{firebase_uid}` - Get user by Firebase UID
- `GET /users/{user_id}` - Get user by ID
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user

#### Wallet Endpoints
- `GET /wallets/user/{user_id}` - Get all wallets for a user
- `GET /wallets/{wallet_id}` - Get wallet by ID
- `POST /wallets/` - Create a new wallet
- `PUT /wallets/{wallet_id}` - Update wallet
- `DELETE /wallets/{wallet_id}` - Delete wallet
- `GET /wallets/user/{user_id}/total-balance` - Get total balance across all wallets

---

## API Service

The API service is located at `src/services/api.js` and provides convenient functions for all backend operations.

### Usage Example

```javascript
import { 
  createUser, 
  getUserByFirebaseUid,
  getWalletsByUserId,
  createWallet,
  deleteWallet
} from '../services/api';

// Create a user
const user = await createUser({
  firebase_uid: 'firebase-uid-123',
  email: 'user@example.com',
  display_name: 'John Doe'
});

// Get user wallets
const wallets = await getWalletsByUserId(user.id);

// Create a wallet
const wallet = await createWallet({
  name: 'My Wallet',
  user_id: user.id,
  balance: 0
});

// Delete a wallet
await deleteWallet(wallet.id);
```

---

## Authentication Flow

### Automatic User Creation

When a user signs in with Firebase Authentication, the system automatically:

1. **Checks Backend**: Attempts to fetch user from backend using Firebase UID
2. **Creates if Missing**: If user doesn't exist, creates them in the backend
3. **Stores User**: Stores both Firebase user and backend user in context

This happens in `AuthContext.jsx`:

```javascript
const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    // Try to get existing user
    let backendUserData = await getUserByFirebaseUid(firebaseUser.uid);
    
    if (!backendUserData) {
      // Create user if doesn't exist
      backendUserData = await createUser({
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        display_name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      });
    }
    
    setBackendUser(backendUserData);
  }
});
```

### Accessing User Data

Components can access both Firebase and backend user data:

```javascript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, backendUser } = useAuth();
  
  // user = Firebase user (email, displayName, photoURL, etc.)
  // backendUser = Backend user (id, firebase_uid, email, display_name, etc.)
  
  return <div>Welcome, {backendUser.display_name}!</div>;
}
```

---

## Wallet Management

### Fetching Wallets

Wallets are automatically fetched when the component mounts and `backendUser` is available:

```javascript
useEffect(() => {
  if (backendUser) {
    fetchWallets();
  }
}, [backendUser]);

const fetchWallets = async () => {
  const fetchedWallets = await getWalletsByUserId(backendUser.id);
  setWallets(fetchedWallets);
};
```

### Creating Wallets

```javascript
const addWallet = async (walletName) => {
  const newWallet = await createWallet({
    name: walletName,
    user_id: backendUser.id,
    balance: 0
  });
  
  setWallets([...wallets, newWallet]);
};
```

### Deleting Wallets

```javascript
const removeWallet = async (walletId) => {
  await deleteWallet(walletId);
  setWallets(wallets.filter(w => w.id !== walletId));
};
```

---

## Error Handling

### API Service Error Handling

The API service automatically handles errors and throws meaningful error messages:

```javascript
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

### Component Error Handling

Components display error messages to users:

```javascript
try {
  await createWallet({ name, user_id, balance: 0 });
} catch (error) {
  setError('Failed to create wallet. Please try again.');
}
```

### Error Banner

The FinanceManager component displays an error banner when operations fail:

```jsx
{error && (
  <div className={styles.errorBanner}>
    <span>{error}</span>
    <button onClick={() => setError(null)}>✕</button>
  </div>
)}
```

---

## Testing

### Local Development

1. **Start Backend**: Ensure your backend is running on `http://localhost:8000`
   ```bash
   # In your backend directory
   uvicorn main:app --reload
   ```

2. **Start Frontend**: Start the Vite dev server
   ```bash
   npm run dev
   ```

3. **Test Flow**:
   - Sign in with Google/Facebook/GitHub
   - Check console for backend user creation logs
   - Create a wallet and verify it appears in the backend
   - Delete a wallet and verify it's removed from the backend

### API Health Check

You can check if the API is available:

```javascript
import { checkAPIHealth } from '../services/api';

const isHealthy = await checkAPIHealth();
if (!isHealthy) {
  console.error('Backend API is not available');
}
```

### Console Logging

The integration includes comprehensive console logging:

- 🔍 Fetching backend user...
- 🆕 Creating user in backend...
- ✅ User created in backend
- 📥 Fetching wallets for user
- ➕ Creating wallet
- 🗑️ Deleting wallet
- ❌ Error messages for failures

---

## Data Models

### User Model (Backend Expected)

```typescript
{
  id: string;           // Backend-generated ID
  firebase_uid: string; // Firebase UID
  email: string;        // User email
  display_name: string; // Display name
  created_at: string;   // ISO timestamp
  updated_at: string;   // ISO timestamp
}
```

### Wallet Model (Backend Expected)

```typescript
{
  id: string;           // Backend-generated ID
  name: string;         // Wallet name
  user_id: string;      // User ID (foreign key)
  balance: number;      // Wallet balance
  transactions: Array;  // List of transactions (optional)
  created_at: string;   // ISO timestamp
  updated_at: string;   // ISO timestamp
}
```

---

## Troubleshooting

### Backend Not Available

**Error**: `Failed to load wallets. Please try again.`

**Solution**: 
- Ensure backend is running on `http://localhost:8000`
- Check `VITE_API_BASE_URL` in `.env` file
- Verify backend API documentation at `http://localhost:8000/docs`

### CORS Issues

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: Configure CORS in your FastAPI backend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### User Not Created in Backend

**Error**: Backend user is `null` after sign-in

**Solution**:
- Check backend logs for errors
- Verify backend `/users/` endpoint accepts the correct payload
- Check console for error messages
- Ensure MongoDB/database is running and accessible

---

## Best Practices

1. **Always handle errors**: Display user-friendly error messages
2. **Use loading states**: Show loading spinners during API calls
3. **Validate data**: Ensure data is valid before sending to backend
4. **Log operations**: Use console logging for debugging
5. **Keep state in sync**: Update local state after successful API calls

---

## Future Enhancements

Potential improvements for the API integration:

- [ ] Add retry logic for failed requests
- [ ] Implement request caching
- [ ] Add offline support with local storage
- [ ] Implement optimistic updates
- [ ] Add request debouncing for rapid operations
- [ ] Implement WebSocket for real-time updates
- [ ] Add API request interceptors for auth tokens
- [ ] Implement pagination for large wallet lists

---

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [React Query (for future improvements)](https://tanstack.com/query/latest)

