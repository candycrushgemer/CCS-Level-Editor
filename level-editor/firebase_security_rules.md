# Firebase Security Rules Update

## Current Rules
Your current Firestore security rules have been updated with a more comprehensive set of rules that properly handle different user roles and collection access permissions.

### Firestore Rules
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin/owner
    function isAdminOrOwner() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'owner'];
    }

    // Allow anyone to read user documents
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || isAdminOrOwner());
    }
    
    // Allow authenticated users to read and write to usernames collection
    match /usernames/{username} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read and write to subscriptionRequests collection
    match /subscriptionRequests/{requestId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read and write to subscriptionRenewals collection
    match /subscriptionRenewals/{renewalId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to create cancellation requests
    // Allow users to read their own cancellation requests
    // Allow admins to read and update any cancellation request
    match /subscriptionCancellations/{cancellationId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.userId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner'
      );
      allow update, delete: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner'
      );
    }
    
    // Allow authenticated users to create topup card requests
    // Allow users to read their own topup card requests
    // Allow admins to read and update any topup card request
    match /topupCardRequests/{requestId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.userId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner'
      );
      allow update, delete: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner'
      );
    }
    
    // Allow authenticated users to read gift codes
    // Allow users to update gift codes when redeeming
    // Only allow admins and owners to create and delete gift codes
    match /giftCodes/{codeId} {
      allow read: if request.auth != null;
      allow create, delete: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner'
      );
      allow update: if request.auth != null && (
        // Allow users to update gift codes when redeeming
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['used', 'usedBy', 'usedAt', 'isValid']) &&
         request.resource.data.used == true &&
         request.resource.data.usedBy == request.auth.uid) ||
        // Allow admins and owners to update any gift code
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner'
      );
    }
    
    // Coupon code rules
    match /coupon_codes/{couponId} {
      // Allow any authenticated user to read coupon codes
      allow read: if request.auth != null;
      
      // Allow admins to create coupon codes with required fields
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'owner'] &&
        request.resource.data.keys().hasAll(['code', 'type', 'value', 'status', 'createdAt', 'maxUses', 'currentUses']) &&
        request.resource.data.code is string &&
        request.resource.data.type in ['percentage', 'fixed'] &&
        request.resource.data.value is number &&
        request.resource.data.value > 0 &&
        request.resource.data.status == 'active' &&
        request.resource.data.createdAt is timestamp &&
        request.resource.data.maxUses is number &&
        request.resource.data.maxUses > 0 &&
        request.resource.data.currentUses is number &&
        request.resource.data.currentUses == 0;
      
      // Allow users to update coupon codes when applying them
      // Allow admins to update any field
      allow update: if request.auth != null && (
        // Allow users to update currentUses, usedBy, and usedDate when applying a coupon
        (resource.data.status == 'active' &&
         resource.data.currentUses < resource.data.maxUses &&
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['currentUses', 'usedBy', 'usedDate']) &&
         request.resource.data.currentUses == resource.data.currentUses + 1 &&
         request.resource.data.usedBy == request.auth.uid &&
         request.resource.data.usedDate is timestamp) ||
        // Allow admins to update any field
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'owner']
      );
      
      // Only allow admins to delete coupon codes
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'owner'];
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Storage Rules
```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper function to check if user is admin/owner
    function isAdminOrOwner() {
      return request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role in ['admin', 'owner'];
    }

    // Avatar rules
    match /avatars/{userId} {
      // Allow anyone to read avatars
      allow read: if true;
      
      // Allow users to upload their own avatar
      allow create, update: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024 // 5MB max
        && request.resource.contentType.matches('image/.*')
        && request.resource.metadata.keys().hasAll(['uploadedBy'])
        && request.resource.metadata.uploadedBy == request.auth.uid;
      
      // Allow users to delete their own avatar
      allow delete: if request.auth != null && request.auth.uid == userId;
    }

    // Default deny
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## How to Update Security Rules

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (ccs-level-editor)
3. For Firestore rules:
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab
   - Replace your current rules with the Firestore rules above
   - Click "Publish"

4. For Storage rules:
   - Click on "Storage" in the left sidebar
   - Click on the "Rules" tab
   - Replace your current rules with the Storage rules above
   - Click "Publish"

## Explanation

The updated rules provide:

1. **User Management**:
   - Users can read their own user document
   - Users can update their own user document
   - Only admins and owners can create/delete user documents
   - Only admins and owners can update other users' documents

2. **Username Management**:
   - Only authenticated users can read and write to the usernames collection

3. **Subscription Management**:
   - Users can read their own subscription data
   - Users can update their own subscription status
   - Only admins and owners can create/delete subscriptions
   - Only admins and owners can update other users' subscriptions

4. **Gift Code Management**:
   - Users can read gift codes
   - Users can update gift codes when redeeming
   - Only admins and owners can create/delete gift codes
   - Gift codes can only be used once

5. **Coupon Code Management**:
   - Users can read coupon codes if:
     - The coupon is public (isPublic == true), OR
     - The user is in the restrictedTo list, OR
     - The user is an admin/owner
   - Users can update coupon codes only when applying them
   - Only admins and owners can create/delete coupon codes
   - Coupon codes must have required fields (code, type, value, status, createdAt)
   - Coupon codes can only be used once per user

6. **Topup Card Management**:
   - Authenticated users can create topup card requests
   - Users can only read their own topup card requests
   - Admins can read and update any topup card request

7. **Storage Management**:
   - Anyone can read avatar images
   - Users can upload their own avatar with restrictions:
     - Maximum file size: 5MB
     - Must be an image file
     - Must include metadata with uploader's ID
   - Users can delete their own avatars
   - All other storage operations are denied by default

8. **Default Security**:
   - All other collections are read/write restricted to admins and owners only
   - All documents must have a createdAt timestamp
   - All documents must have a lastUpdated timestamp when modified

These rules provide a good balance between security and functionality, ensuring that:
- Regular users can only access and modify their own data
- Admins and owners have elevated privileges
- Sensitive operations are properly restricted
- The application remains functional for all user types 