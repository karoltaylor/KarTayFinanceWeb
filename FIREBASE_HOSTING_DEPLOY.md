# Firebase Hosting Deployment Guide

## 🎯 Why This is Needed

Your logs show this error:
```
GET https://kartay-8b625.firebaseapp.com/__/firebase/init.json 404 (Not Found)
```

The Firebase auth handler at `kartay-8b625.firebaseapp.com/__/auth/handler` needs Firebase Hosting to be deployed to work properly. Without it, the OAuth redirect won't complete.

---

## ✅ Steps to Fix

### 1. Login to Firebase (In a new terminal)

Open a new terminal and run:
```bash
firebase login
```

This will open your browser and ask you to authorize Firebase CLI.

### 2. Deploy to Firebase Hosting

After logging in, run:
```bash
firebase deploy --only hosting
```

This will deploy your app to Firebase Hosting, which will fix the auth handler.

### 3. Verify Deployment

After deployment, you should see:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/kartay-8b625/overview
Hosting URL: https://kartay-8b625.web.app
```

### 4. Test Authentication Again

Go back to your AWS Amplify site:
```
https://main.d2sw8mgq37patu.amplifyapp.com/
```

Try logging in with Google again. The auth handler should now work!

---

## 🔍 What This Does

Firebase Hosting deployment creates the necessary infrastructure at `kartay-8b625.firebaseapp.com` to handle OAuth redirects. The auth handler page (`__/auth/handler`) needs this infrastructure to complete the authentication flow.

---

## 📊 Expected Behavior After Fix

After deploying Firebase Hosting, when you try to login:

1. Click "Sign in with Google" on Amplify site
2. Redirect to Google OAuth
3. Redirect to `https://kartay-8b625.firebaseapp.com/__/auth/handler` ✅ (will now work)
4. Handler processes the auth token
5. Redirect back to Amplify site with authenticated user

Your console logs should show:
```
🔍 Checking for redirect result...
✅ Redirect authentication successful! {email: '...', uid: '...'}
```

---

## 🚀 Alternative Solution (If You Don't Want to Use Firebase Hosting)

If you don't want to maintain Firebase Hosting, you have two options:

### Option A: Use Firebase Auth with Custom Domain
Configure a custom auth domain in Firebase that points to your Amplify deployment.

### Option B: Switch Auth Provider
Consider using AWS Amplify's built-in authentication (AWS Cognito) instead of Firebase Auth.

However, the quickest fix right now is to simply deploy Firebase Hosting.

---

## ⚠️ Note

You'll need to keep Firebase Hosting deployed (at least minimally) for the auth handler to work. You don't need to serve your actual app from Firebase Hosting - you can continue using AWS Amplify for that. Firebase Hosting just needs to be there to handle the OAuth redirects.

---

## 🔐 After Deployment

Your architecture will be:
- **Main App**: Hosted on AWS Amplify (`main.d2sw8mgq37patu.amplifyapp.com`)
- **Auth Handler**: Hosted on Firebase (`kartay-8b625.firebaseapp.com`)
- **Backend API**: AWS API Gateway (`41dcsg65qh.execute-api.eu-central-1.amazonaws.com`)

All working together! 🎉

---

## 📞 Troubleshooting

If after deploying Firebase Hosting you still have issues:

1. Clear browser cache and cookies
2. Try in incognito/private window
3. Check Firebase Console → Hosting to confirm deployment
4. Verify the hosting URL is accessible
5. Check console logs again for any new errors

