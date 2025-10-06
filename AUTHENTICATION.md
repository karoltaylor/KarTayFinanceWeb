# Authentication Architecture

## Overview

The Finance Manager uses Firebase Authentication with support for multiple OAuth providers: Google, Facebook, and GitHub.

## Architecture

```
App.jsx
  └── AuthProvider (Context)
      └── ProtectedRoute
          └── FinanceManager (Protected Content)
```

## File Structure

```
src/
├── config/
│   └── firebase.js                    # Firebase initialization & config
│
├── contexts/
│   └── AuthContext.jsx                # Authentication context & hook
│
├── components/
│   ├── ProtectedRoute/
│   │   └── ProtectedRoute.jsx         # Route protection wrapper
│   ├── LoadingSpinner/
│   │   ├── LoadingSpinner.jsx         # Loading state component
│   │   └── LoadingSpinner.module.css
│   └── UserProfile/
│       ├── UserProfile.jsx            # User dropdown menu
│       └── UserProfile.module.css
│
└── pages/
    └── Login/
        ├── Login.jsx                   # Login page
        ├── Login.module.css
        └── components/
            └── AuthButton/
                ├── AuthButton.jsx      # OAuth provider button
                └── AuthButton.module.css
```

## Authentication Flow

### 1. Initial Load
```
User visits app
    ↓
AuthProvider checks auth state
    ↓
    ├─ User not authenticated → Show Login page
    └─ User authenticated → Show Finance Manager
```

### 2. Login Flow
```
User clicks "Continue with Google/Facebook/GitHub"
    ↓
AuthButton.onClick() triggered
    ↓
AuthContext.signInWithProvider() called
    ↓
Firebase opens OAuth popup
    ↓
User authenticates with provider
    ↓
Firebase returns user object
    ↓
AuthContext updates user state
    ↓
ProtectedRoute shows Finance Manager
```

### 3. Session Persistence
```
User closes browser
    ↓
User reopens app
    ↓
Firebase checks local storage
    ↓
User automatically logged in (if session valid)
```

### 4. Logout Flow
```
User clicks logout in UserProfile dropdown
    ↓
AuthContext.logout() called
    ↓
Firebase signs out user
    ↓
AuthContext clears user state
    ↓
ProtectedRoute shows Login page
```

## Components

### AuthProvider
**Location:** `src/contexts/AuthContext.jsx`

**Purpose:** Manages authentication state and provides auth functions to entire app

**State:**
- `user` - Current user object (null if not authenticated)
- `loading` - Loading state during auth checks
- `error` - Error messages from auth operations

**Functions:**
- `signInWithGoogle()` - Authenticate with Google
- `signInWithFacebook()` - Authenticate with Facebook
- `signInWithGithub()` - Authenticate with GitHub
- `logout()` - Sign out current user
- `isAuthenticated` - Boolean indicating auth status

**Usage:**
```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, signInWithGoogle, logout } = useAuth();
  
  return (
    <div>
      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={signInWithGoogle}>Login with Google</button>
      )}
    </div>
  );
}
```

### ProtectedRoute
**Location:** `src/components/ProtectedRoute/ProtectedRoute.jsx`

**Purpose:** Protects content that requires authentication

**Behavior:**
- Shows loading spinner while checking auth state
- Shows login page if user not authenticated
- Shows protected content if user authenticated

**Usage:**
```javascript
<ProtectedRoute>
  <FinanceManager />
</ProtectedRoute>
```

### UserProfile
**Location:** `src/components/UserProfile/UserProfile.jsx`

**Purpose:** Displays user info and logout option

**Features:**
- Shows user avatar (from OAuth provider)
- Displays user name and email
- Dropdown menu with logout button
- Click outside to close dropdown

### Login Page
**Location:** `src/pages/Login/Login.jsx`

**Purpose:** Login screen with OAuth provider buttons

**Features:**
- Branded header with app icon
- Three OAuth provider buttons (Google, Facebook, GitHub)
- Error message display
- Loading states during authentication

### AuthButton
**Location:** `src/pages/Login/components/AuthButton/AuthButton.jsx`

**Purpose:** Reusable button for OAuth providers

**Props:**
- `provider` - "google" | "facebook" | "github"
- `onClick` - Click handler function
- `disabled` - Disable during loading

## Security Features

### 1. Protected Routes
All protected content is wrapped in `ProtectedRoute` component which checks authentication before rendering.

### 2. Session Persistence
Firebase Authentication uses `browserLocalPersistence` to maintain sessions across browser restarts.

### 3. OAuth Popup
OAuth flows use secure popup windows, not redirects, to maintain app state.

### 4. Environment Variables
All sensitive Firebase config is stored in `.env` file (not committed to version control).

### 5. Token Refresh
Firebase automatically refreshes authentication tokens before they expire.

## User Object Structure

When authenticated, the `user` object contains:

```javascript
{
  uid: "firebase-unique-id",
  email: "user@example.com",
  displayName: "User Name",
  photoURL: "https://provider.com/photo.jpg",
  emailVerified: true,
  providerData: [{
    providerId: "google.com", // or "facebook.com", "github.com"
    uid: "provider-specific-id",
    displayName: "User Name",
    email: "user@example.com",
    photoURL: "https://provider.com/photo.jpg"
  }]
}
```

## Error Handling

### Common Errors

**auth/popup-closed-by-user**
- User closed OAuth popup before completing login
- Solution: Let user try again

**auth/account-exists-with-different-credential**
- User previously signed in with different provider using same email
- Solution: Use account linking (advanced feature)

**auth/unauthorized-domain**
- Domain not authorized in Firebase Console
- Solution: Add domain to authorized domains

**auth/configuration-not-found**
- Provider not enabled in Firebase Console
- Solution: Enable provider in Authentication settings

### Error Display

Errors are displayed in:
1. Login page - Red alert box with error message
2. Console - Detailed error logging for debugging

## State Management

### Why Context API?

- **Simple** - No additional libraries needed
- **Sufficient** - Auth state is global but simple
- **React-friendly** - Built-in React feature
- **Type-safe** - Can be typed with TypeScript

### Alternative Approaches

For larger apps, consider:
- **Redux** - More complex state management
- **Zustand** - Lightweight state management
- **Recoil** - Atom-based state management

## Testing Authentication

### Manual Testing

1. **Google Sign-In**
   - Should work immediately after Firebase setup
   - Test with personal Google account

2. **Facebook Sign-In**
   - Requires Facebook app in "Live" mode
   - Test with Facebook account
   - May require app review for production

3. **GitHub Sign-In**
   - Should work immediately after setup
   - Test with GitHub account

### Test Scenarios

- [ ] First-time login with each provider
- [ ] Logout and login again
- [ ] Close browser and reopen (session persistence)
- [ ] Try logging in with multiple providers (same email)
- [ ] Cancel OAuth popup (error handling)
- [ ] Test on different browsers
- [ ] Test on mobile devices

## Extending Authentication

### Add Email/Password Login

```javascript
// In AuthContext.jsx
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const signUpWithEmail = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

const signInWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};
```

### Add More OAuth Providers

Firebase supports:
- Twitter
- Microsoft
- Apple
- Yahoo
- Custom OAuth providers

### Add Profile Editing

Store additional user data in Firestore and allow users to update profile.

### Add Account Linking

Allow users to link multiple OAuth providers to same account.

## Performance Considerations

### Optimization Strategies

1. **Lazy Load Login Page** - Only load when needed
2. **Memoize Auth Context** - Prevent unnecessary re-renders
3. **Cache User Data** - Store in localStorage for faster loads
4. **Preload OAuth Scripts** - Load provider scripts early

### Current Performance

- **Initial Load**: ~500ms (Firebase SDK)
- **OAuth Popup**: ~2-3s (depends on provider)
- **Session Check**: <100ms (from cache)
- **Logout**: <100ms (local operation)

## Monitoring & Analytics

### Firebase Console

Monitor authentication in Firebase Console:
- **Users Tab** - See all authenticated users
- **Sign-in Methods** - Provider usage statistics
- **Audit Log** - Security events

### Adding Analytics

```javascript
// In firebase.js
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics(app);

// In AuthContext.jsx
logEvent(analytics, 'login', { method: 'google' });
logEvent(analytics, 'logout');
```

## Best Practices

1. ✅ **Use environment variables** for Firebase config
2. ✅ **Handle errors gracefully** with user-friendly messages
3. ✅ **Show loading states** during async operations
4. ✅ **Persist sessions** with appropriate persistence level
5. ✅ **Protect sensitive routes** with ProtectedRoute
6. ✅ **Log out on errors** when necessary
7. ✅ **Test all providers** thoroughly before deployment
8. ✅ **Monitor auth events** in Firebase Console
9. ✅ **Keep Firebase SDK updated** for security patches
10. ✅ **Follow OAuth best practices** for each provider

## Troubleshooting

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed troubleshooting guide.

## Future Enhancements

- [ ] Add email/password authentication
- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Add user profile editing
- [ ] Add account linking
- [ ] Add two-factor authentication
- [ ] Add SSO (Single Sign-On)
- [ ] Add biometric authentication (mobile)
- [ ] Store user preferences in Firestore
- [ ] Add user data export/import
