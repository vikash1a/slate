# Firebase Setup Guide for Slate

> Step-by-step instructions to set up Firebase (Google Auth + Cloud Firestore) for the Slate app.

---

## Step 1: Create a Firebase Project

1. Go to **[Firebase Console](https://console.firebase.google.com)**
2. Click **"Create a project"** (or "Add project")
3. Enter project name: `slate` (or whatever you prefer)
4. **Disable Google Analytics** (not needed for this app) → Click **Create Project**
5. Wait for it to finish → Click **Continue**

---

## Step 2: Register a Web App

1. On the project dashboard, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `slate-web`
3. ❌ **Skip** "Set up Firebase Hosting" checkbox (we'll do this later if needed)
4. Click **Register app**
5. 🔑 **You'll see your Firebase config** — copy it and save it somewhere. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy.....................",
  authDomain: "slate-xxxxx.firebaseapp.com",
  projectId: "slate-xxxxx",
  storageBucket: "slate-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

> **IMPORTANT:** Save this config — we'll put it in a `.env` file in the project later.

6. Click **Continue to console**

---

## Step 3: Enable Google Sign-In

1. In the left sidebar, click **Build → Authentication**
2. Click **Get started**
3. Go to the **Sign-in method** tab
4. Click **Google** from the providers list
5. Toggle **Enable** to ON
6. Set a **Project support email** (select your Google email from the dropdown)
7. Click **Save**

✅ Google Sign-In is now enabled.

---

## Step 4: Create Cloud Firestore Database

1. In the left sidebar, click **Build → Firestore Database**
2. Click **Create database**
3. Choose a **location** closest to you:
   - For India: `asia-south1 (Mumbai)`
   - For US: `us-central1 (Iowa)`
   - For Europe: `europe-west1 (Belgium)`

> **WARNING:** You **cannot change the location** after creation. Pick carefully.

4. Select **Start in test mode** (we'll add proper security rules shortly)
5. Click **Create**

✅ Firestore is now ready.

---

## Step 5: Set Up Security Rules

1. In Firestore, click the **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Each user can only access their own pages
    match /users/{userId}/pages/{pageId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

✅ Now only authenticated users can access their own data.

---

## Step 6: Create Your `.env` File

Once the project is scaffolded, create a `.env` file in the project root with your Firebase config:

```bash
VITE_FIREBASE_API_KEY=AIzaSy.....................
VITE_FIREBASE_AUTH_DOMAIN=slate-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=slate-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=slate-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

> **NOTE:** The `VITE_` prefix is required — Vite only exposes env variables that start with `VITE_` to the browser.

---

## Checklist

Use this to confirm everything is done:

- [ ] Firebase project created
- [ ] Web app registered & config copied
- [ ] Google Sign-In enabled in Authentication
- [ ] Firestore database created (correct region)
- [ ] Security rules published
- [ ] `.env` file ready with your config values

---

## Is the API Key Safe to Expose?

> **Yes.** Firebase API keys are **not secret** — they're just identifiers. Security comes from **Firestore Security Rules** (Step 5) which run server-side. Your rules ensure each user can only access their own data, regardless of who has the API key.

---

Once you've completed these steps, let me know and I'll start building the app! 🚀
