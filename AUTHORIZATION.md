# Authorization System

## Overview

The application includes an email-based whitelist authorization system to control who can access the application. This is useful for development, testing, or restricting access to specific users.

---

## How It Works

1. **User authenticates** with Firebase (Google, Facebook, or GitHub)
2. **System checks** if user's email is in the whitelist
3. **Access granted** if email is whitelisted, otherwise shows "Access Denied" page

---

## Configuration

### 1. Enable/Disable Authorization

**File**: `.env`

```env
# Set to true to enable authorization checking
VITE_AUTHORIZATION_ENABLED=true

# Set to false to allow all authenticated users (no whitelist)
VITE_AUTHORIZATION_ENABLED=false
```

### 2. Add Authorized Users

**File**: `src/config/authorization.js`

```javascript
const ALLOWED_EMAILS = [
  'karol.taylor@gmail.com',
  'john.doe@example.com',      // Add new emails here
  'jane.smith@example.com',
  // Add more as needed
];
```

**Steps:**
1. Open `src/config/authorization.js`
2. Add the user's email to the `ALLOWED_EMAILS` array
3. Save the file
4. Restart the dev server (`npm run dev`)

---

## User Experience

### Authorized User
1. Signs in with Google/Facebook/GitHub
2. Immediately sees the Finance Manager dashboard
3. Full access to the application

### Unauthorized User
1. Signs in with Google/Facebook/GitHub
2. Sees "Access Denied" page with:
   - Their email address
   - "Sign Out" button
   - **In development**: List of allowed emails

---

## Use Cases

### Development Environment
```env
# .env.development
VITE_AUTHORIZATION_ENABLED=true
```

Only allow specific developers to access the app during development.

### Production with Restricted Access
```env
# .env.production
VITE_AUTHORIZATION_ENABLED=true
```

Allow only specific users (e.g., beta testers, clients) to access the production app.

### Production with Open Access
```env
# .env.production
VITE_AUTHORIZATION_ENABLED=false
```

Allow any authenticated user to access the application.

---

## Adding a New User

**Option 1: Manual (Recommended for small teams)**

1. User requests access
2. Developer adds their email to `ALLOWED_EMAILS` array
3. Developer commits and deploys
4. User can now access the app

**Option 2: Dynamic (Future Enhancement)**

Could implement an admin panel to manage allowed users without code changes:
- Admin adds user email through UI
- Email stored in database
- Authorization checks database instead of hardcoded array

---

## Customization

### Change Authorization Logic

**File**: `src/config/authorization.js`

```javascript
// Example: Domain-based authorization
export function isUserAuthorized(email) {
  if (!AUTHORIZATION_ENABLED) return true;
  
  // Allow anyone from company domain
  if (email.endsWith('@yourcompany.com')) {
    return true;
  }
  
  // Or check whitelist
  return ALLOWED_EMAILS.includes(email.toLowerCase());
}
```

### Custom Unauthorized Page

**File**: `src/components/Unauthorized/Unauthorized.jsx`

Customize the "Access Denied" page:
- Change messaging
- Add contact information
- Add request access form
- Change styling

---

## Security Notes

### ✅ Good Practices

- Keep `ALLOWED_EMAILS` in source control (no sensitive data)
- Use environment variables to enable/disable
- Case-insensitive email matching
- Clear error messages for unauthorized users

### ⚠️ Limitations

- **Client-side only**: Users can view the whitelist in dev mode
- **No role-based access**: All authorized users have full access
- **Requires code deployment**: Adding users requires code changes

### 🔒 For Production

For production applications with stricter requirements:

1. **Backend Authorization**: Implement authorization checks in your FastAPI backend
2. **Role-Based Access Control (RBAC)**: Add user roles (admin, user, viewer)
3. **Database-Driven**: Store allowed users in MongoDB
4. **Admin Panel**: Create UI to manage authorized users

---

## Testing

### Test Authorized Access
1. Add your email to `ALLOWED_EMAILS`
2. Sign in with that email
3. Should see the Finance Manager dashboard

### Test Unauthorized Access
1. Use an email NOT in `ALLOWED_EMAILS`
2. Sign in
3. Should see "Access Denied" page

### Test Disabled Authorization
1. Set `VITE_AUTHORIZATION_ENABLED=false`
2. Sign in with any email
3. Should see the Finance Manager dashboard

---

## Troubleshooting

### User sees "Access Denied" but email is in whitelist

**Check:**
1. Email spelling is correct (case-insensitive matching)
2. Dev server was restarted after adding email
3. `.env` file has `VITE_AUTHORIZATION_ENABLED=true`

### Authorization still checking when disabled

**Solution:**
1. Verify `.env` has `VITE_AUTHORIZATION_ENABLED=false`
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R)

### Can't see allowed emails on unauthorized page

**Reason:** Development info only shows in dev mode

**Solution:** Run `npm run dev` instead of production build

---

## Future Enhancements

### 1. Database-Backed Whitelist
Store allowed emails in MongoDB instead of code:
```javascript
const allowedUsers = await db.collection('authorized_users').find().toArray();
```

### 2. User Roles
Add roles to control access levels:
```javascript
const ROLES = {
  admin: ['full.access@gmail.com'],
  user: ['regular.user@gmail.com'],
  viewer: ['view.only@gmail.com']
};
```

### 3. Request Access Form
Allow users to request access through the unauthorized page:
- Submit email + reason
- Admin receives notification
- Admin approves/denies

### 4. Invitation System
Generate invite links for new users:
- Admin creates invite link
- Link contains temporary token
- User signs in with invite link
- Email automatically added to whitelist

---

## Code Reference

**Files Modified:**
- `src/config/authorization.js` - Whitelist configuration
- `src/components/ProtectedRoute/ProtectedRoute.jsx` - Authorization check
- `src/components/Unauthorized/Unauthorized.jsx` - Unauthorized page
- `src/components/Unauthorized/Unauthorized.module.css` - Styling
- `env.template` - Environment variable documentation

**Key Functions:**
- `isUserAuthorized(email)` - Check if email is authorized
- `getAllowedEmails()` - Get whitelist (dev only)

---

## Quick Start

### Enable Authorization (Dev)

1. **Create `.env` file**:
   ```bash
   cp env.template .env
   ```

2. **Set authorization to enabled**:
   ```env
   VITE_AUTHORIZATION_ENABLED=true
   ```

3. **Add your email** in `src/config/authorization.js`:
   ```javascript
   const ALLOWED_EMAILS = [
     'your.email@gmail.com',  // Add your email here
   ];
   ```

4. **Restart dev server**:
   ```bash
   npm run dev
   ```

5. **Test**: Sign in and verify you have access

---

**Last Updated**: 2025-01-15  
**Version**: 1.0.0

