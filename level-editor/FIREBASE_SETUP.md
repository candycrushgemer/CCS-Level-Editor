# Firebase Authentication Setup Guide

This guide will help you set up Firebase authentication for the Level Editor application.

## Prerequisites

1. A Firebase project
2. Firebase CLI (optional, for deployment)
3. Basic knowledge of Firebase services

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Enter a project name (e.g., "level-editor-app")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:

### Email/Password
- Click "Email/Password"
- Enable "Email/Password"
- Click "Save"

### Google
- Click "Google"
- Enable "Google"
- Add your authorized domain
- Click "Save"

### Facebook
- Click "Facebook"
- Enable "Facebook"
- You'll need to create a Facebook app and get App ID and App Secret
- Add your authorized domain
- Click "Save"

## Step 3: Enable Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (you can secure it later)
4. Select a location for your database
5. Click "Enable"

## Step 4: Enable Storage

1. Go to "Storage" in the left sidebar
2. Click "Get started"
3. Choose "Start in test mode" (you can secure it later)
4. Select a location for your storage
5. Click "Done"

## Step 5: Get Firebase Configuration

1. Go to "Project settings" (gear icon) in the left sidebar
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web"
4. Enter an app nickname (e.g., "Level Editor Web")
5. Click "Register app"
6. Copy the Firebase configuration object

## Step 6: Update Configuration Files

Replace the placeholder configuration in all `credentials.js` files with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

Files to update:
- `level-editor/login/credentials.js`
- `level-editor/signup/credentials.js`
- `level-editor/app/credentials.js`
- `level-editor/editor/credentials.js`
- `level-editor/myaccount/credentials.js`

## Step 7: Set Up Firestore Security Rules

Go to Firestore Database > Rules and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add more rules as needed for your app
  }
}
```

## Step 8: Set Up Storage Security Rules

Go to Storage > Rules and update with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only upload to their own avatar folder
    match /avatars/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 9: Configure Authorized Domains

1. Go to Authentication > Settings
2. Add your domain to "Authorized domains"
3. For local development, add `localhost`

## Step 10: Test the Authentication

1. Open your application
2. Try to sign up with email/password
3. Try to sign in with Google/Facebook
4. Test profile updates and avatar uploads

## Features Implemented

### Authentication
- ✅ Email/password sign up and sign in
- ✅ Google OAuth sign in
- ✅ Facebook OAuth sign in
- ✅ Automatic redirects based on auth state
- ✅ Token-based authentication

### User Management
- ✅ User profile creation in Firestore
- ✅ Username and display name management
- ✅ Password change functionality
- ✅ Account deletion
- ✅ Sign out functionality

### Avatar Management
- ✅ Click avatar to upload new image
- ✅ Image cropping interface
- ✅ Firebase Storage integration
- ✅ Base64 to blob conversion
- ✅ Automatic profile updates

### UI Integration
- ✅ Dynamic user interface updates
- ✅ User info display in dropdowns
- ✅ Loading states and error handling
- ✅ Success/error messages
- ✅ Responsive design

## Security Considerations

1. **Firestore Rules**: Ensure users can only access their own data
2. **Storage Rules**: Restrict avatar uploads to user's own folder
3. **Authentication**: Use Firebase's built-in security features
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: Validate user inputs on both client and server

## Troubleshooting

### Common Issues

1. **"Firebase is not defined"**
   - Ensure Firebase SDK scripts are loaded before credentials.js
   - Check script order in HTML files

2. **"Permission denied"**
   - Check Firestore and Storage security rules
   - Ensure user is authenticated

3. **"Invalid API key"**
   - Verify Firebase configuration
   - Check domain authorization

4. **Avatar upload fails**
   - Check Storage security rules
   - Verify file size and format

### Debug Mode

Enable debug logging by adding this to your credentials.js:

```javascript
// Enable debug mode
localStorage.setItem('debug', 'firebase:*');
```

## Next Steps

1. **Customize UI**: Modify the authentication forms to match your design
2. **Add Validation**: Implement client-side form validation
3. **Error Handling**: Add more specific error messages
4. **User Roles**: Implement user roles and permissions
5. **Analytics**: Add Firebase Analytics for user behavior tracking
6. **Performance**: Implement lazy loading and caching strategies

## Support

For Firebase-specific issues, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

For application-specific issues, check the browser console for error messages and refer to the implemented error handling in the code. 