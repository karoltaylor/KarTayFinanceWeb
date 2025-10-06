# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication with Google, Facebook, and GitHub providers for your Finance Manager app.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `finance-manager` (or your choice)
4. Click **Continue**
5. Disable Google Analytics (optional, but simpler for now)
6. Click **Create project**
7. Wait for project to be created, then click **Continue**

## Step 2: Register Your Web App

1. In the Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `Finance Manager Web`
3. **Don't check** "Also set up Firebase Hosting"
4. Click **Register app**
5. Copy the Firebase configuration object (you'll need this later)
6. Click **Continue to console**

## Step 3: Enable Authentication Providers

### Enable Google Sign-In

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Get started** (if first time)
3. Go to **Sign-in method** tab
4. Click on **Google**
5. Toggle **Enable**
6. Select a **Project support email**
7. Click **Save**

### Enable Facebook Sign-In

1. First, create a Facebook App:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click **My Apps** > **Create App**
   - Select **Consumer** as the app type
   - Fill in app details and create the app
   - Go to **Settings** > **Basic**
   - Copy **App ID** and **App Secret**

2. In Firebase Console:
   - Click on **Facebook** in Sign-in method tab
   - Toggle **Enable**
   - Paste **App ID** and **App Secret** from Facebook
   - Copy the **OAuth redirect URI** shown
   - Click **Save**

3. Back in Facebook Developers:
   - Go to **Facebook Login** > **Settings**
   - Paste the **OAuth redirect URI** in **Valid OAuth Redirect URIs**
   - Save changes
   - Make your Facebook app **Live** (switch from Development to Live mode)

### Enable GitHub Sign-In

1. First, create a GitHub OAuth App:
   - Go to [GitHub Settings](https://github.com/settings/developers)
   - Click **OAuth Apps** > **New OAuth App**
   - Fill in:
     - **Application name**: Finance Manager
     - **Homepage URL**: `http://localhost:3000` (for development)
     - **Authorization callback URL**: (you'll get this from Firebase)
   - Click **Register application**
   - Copy **Client ID** and generate a **Client Secret**

2. In Firebase Console:
   - Click on **GitHub** in Sign-in method tab
   - Toggle **Enable**
   - Copy the **Authorization callback URL** shown
   - Paste **Client ID** and **Client Secret** from GitHub
   - Click **Save**

3. Back in GitHub:
   - Update **Authorization callback URL** with the one from Firebase
   - Save changes

## Step 4: Configure Your App

1. Create a `.env` file in your project root:

```bash
# Copy from .env.example
cp .env.example .env
```

2. Open `.env` and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Where to find these values:**
- In Firebase Console, go to **Project Settings** (gear icon)
- Scroll down to **Your apps** section
- Click the **Config** radio button
- Copy each value to your `.env` file

3. **Important:** Add `.env` to your `.gitignore` file (already done)

## Step 5: Test Authentication

1. Restart your development server:
```bash
npm run dev
```

2. Open http://localhost:3000
3. You should see the login page
4. Try signing in with:
   - ✅ **Google** - Should work immediately
   - ⚠️ **Facebook** - Requires Facebook app to be Live
   - ⚠️ **GitHub** - Should work immediately

## Step 6: Production Setup

### Update Authorized Domains

1. In Firebase Console > Authentication > Settings tab
2. Scroll to **Authorized domains**
3. Add your production domain (e.g., `yourdomain.com`)

### Update OAuth Redirect URLs

For Facebook:
1. Update **Valid OAuth Redirect URIs** in Facebook app settings
2. Add: `https://your-project-id.firebaseapp.com/__/auth/handler`

For GitHub:
1. Update **Authorization callback URL** in GitHub OAuth app settings
2. Add: `https://your-project-id.firebaseapp.com/__/auth/handler`

## Troubleshooting

### "auth/configuration-not-found"
- Make sure you've enabled the authentication provider in Firebase Console
- Check that your `.env` file has correct values
- Restart dev server after changing `.env`

### "auth/unauthorized-domain"
- Add your domain to Authorized domains in Firebase Console
- For localhost, it should be pre-authorized

### Facebook login not working
- Ensure Facebook app is in **Live** mode (not Development)
- Check that OAuth redirect URI is correctly set
- Verify App ID and App Secret are correct

### GitHub login not working
- Check Authorization callback URL is correct
- Verify Client ID and Client Secret are correct
- Make sure OAuth App is active

### "Missing or insufficient permissions"
- This is a Firestore error, not needed for authentication
- Can be ignored if you're only using Authentication (not Firestore)

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use environment variables** for all sensitive data
3. **Enable reCAPTCHA** in Firebase Console for production
4. **Set up security rules** if using Firestore
5. **Monitor authentication** in Firebase Console

## Next Steps

Once authentication is working:

1. **Add user data persistence** - Store user preferences in Firestore
2. **Add profile editing** - Let users update their profile
3. **Add email/password auth** - For users without social accounts
4. **Set up Firebase hosting** - Deploy your app
5. **Add password reset** - If using email/password auth

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Facebook Login for Firebase](https://firebase.google.com/docs/auth/web/facebook-login)
- [GitHub Login for Firebase](https://firebase.google.com/docs/auth/web/github-auth)

## Support

If you encounter issues:
1. Check Firebase Console > Authentication > Users (to see if users are being created)
2. Check browser console for error messages
3. Verify all configuration steps were completed
4. Try signing in with different providers

Happy coding! 🚀
