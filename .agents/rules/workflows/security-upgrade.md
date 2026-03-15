---
description: Master security upgrade plan for Note-project - XSS, Admin Backend, Rate Limiting
---

# 🛡️ SECURITY UPGRADE ROADMAP

## OVERVIEW
This plan addresses 3 critical security vulnerabilities discovered in the audit.
Estimated total time: 6-8 hours spread over 2-3 days.

---

## 🎯 MISSION 1: XSS PROTECTION (Priority: CRITICAL)
**Time Estimate**: 2 hours
**Difficulty**: Easy
**Impact**: Protects against malicious script injection

### Steps:

1. **Install DOMPurify**
```bash
cd Note-project
npm install dompurify
npm install --save-dev @types/dompurify  # if using TypeScript later
```

2. **Create Sanitization Utility**
File: `src/utils/sanitize.js`
```javascript
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} dirty - Untrusted HTML string
 * @param {object} options - DOMPurify config options
 * @returns {string} - Safe HTML string
 */
export const sanitizeHTML = (dirty, options = {}) => {
  if (!dirty || typeof dirty !== 'string') return '';
  
  const defaultConfig = {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'blockquote'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    RETURN_TRUSTED_TYPE: false
  };
  
  return DOMPurify.sanitize(dirty, { ...defaultConfig, ...options });
};

/**
 * Strips ALL HTML tags - for plain text display
 */
export const stripHTML = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
};

/**
 * Sanitizes note content before display
 */
export const sanitizeNoteContent = (content) => {
  return sanitizeHTML(content, {
    // Allow TipTap editor tags
    ALLOWED_TAGS: [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'u', 's', 'code', 'pre',
      'ul', 'ol', 'li', 'blockquote', 'br',
      'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'class', 'data-type']
  });
};
```

3. **Update Components to Use Sanitization**

Modify these files:
- `src/components/NoteCard.js` (Line ~50-70 where content is displayed)
- `src/components/RichEditor.js` (When displaying saved content)
- `src/pages/SharedNotePage.js` (Public share view)

Example change in `NoteCard.js`:
```javascript
// BEFORE (UNSAFE):
<div>{note.content}</div>

// AFTER (SAFE):
import { sanitizeNoteContent } from '../utils/sanitize';

<div dangerouslySetInnerHTML={{ 
  __html: sanitizeNoteContent(note.content) 
}} />
```

4. **Add Tests**
Create `src/utils/sanitize.test.js`:
```javascript
import { sanitizeHTML, stripHTML } from './sanitize';

describe('XSS Protection', () => {
  test('should remove script tags', () => {
    const dirty = '<p>Hello</p><script>alert("XSS")</script>';
    expect(sanitizeHTML(dirty)).not.toContain('script');
  });

  test('should remove event handlers', () => {
    const dirty = '<img src=x onerror="alert(1)">';
    expect(sanitizeHTML(dirty)).not.toContain('onerror');
  });

  test('should allow safe HTML', () => {
    const safe = '<p><strong>Bold</strong> text</p>';
    expect(sanitizeHTML(safe)).toContain('<strong>');
  });
});
```

5. **Run Tests**
```bash
npm test -- sanitize.test.js
```

---

## ⚔️ MISSION 2: BACKEND ADMIN PROTECTION (Priority: HIGH)
**Time Estimate**: 4 hours
**Difficulty**: Medium
**Impact**: Prevents unauthorized admin access

### Steps:

1. **Setup Firebase Functions**
```bash
cd Note-project-root
npm install -g firebase-tools
firebase login
firebase init functions
# Choose: JavaScript, ESLint yes, install dependencies yes
```

2. **Create Admin Verification Helper**
File: `functions/utils/adminAuth.js`
```javascript
const admin = require('firebase-admin');

/**
 * Verifies if caller is admin
 * Throws error if not authorized
 */
async function requireAdmin(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in'
    );
  }

  const uid = context.auth.uid;
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(uid)
    .get();

  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    // Audit log
    await admin.firestore().collection('audits').add({
      type: 'unauthorized_admin_attempt',
      userId: uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }

  return userDoc.data();
}

module.exports = { requireAdmin };
```

3. **Migrate Admin Operations to Functions**
File: `functions/index.js`
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { requireAdmin } = require('./utils/adminAuth');

admin.initializeApp();

// Ban/Unban User
exports.banUser = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  
  const { userId, banned } = data;
  
  await admin.firestore()
    .collection('users')
    .doc(userId)
    .update({ banned });

  // Audit log
  await admin.firestore().collection('audits').add({
    type: banned ? 'user_banned' : 'user_unbanned',
    targetUserId: userId,
    adminUserId: context.auth.uid,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true };
});

// Delete Note (Admin)
exports.adminDeleteNote = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  
  const { noteId } = data;
  
  await admin.firestore()
    .collection('notes')
    .doc(noteId)
    .delete();

  // Audit log
  await admin.firestore().collection('audits').add({
    type: 'note_deleted_by_admin',
    noteId,
    adminUserId: context.auth.uid,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true };
});

// Update System Settings
exports.updateSettings = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  
  const { setting, value } = data;
  
  await admin.firestore()
    .collection('settings')
    .doc('global')
    .set({ [setting]: value }, { merge: true });

  return { success: true };
});

// Send Broadcast Notification
exports.sendBroadcast = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  
  const { message } = data;
  
  // Get all users
  const usersSnapshot = await admin.firestore()
    .collection('users')
    .get();

  const batch = admin.firestore().batch();
  usersSnapshot.forEach((userDoc) => {
    const notifRef = admin.firestore().collection('notifications').doc();
    batch.set(notifRef, {
      userId: userDoc.id,
      message,
      read: false,
      type: 'admin_broadcast',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  
  await batch.commit();
  
  return { success: true, count: usersSnapshot.size };
});
```

4. **Update Frontend to Call Functions**
File: `src/pages/AdminPage.js` (Replace direct Firestore calls)

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

// At component top
const functions = getFunctions();

// Replace handleBanUser function (Line ~651)
const handleBanUser = async (userId, banned) => {
  try {
    const banUserFn = httpsCallable(functions, 'banUser');
    await banUserFn({ userId, banned: !banned });
    
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, banned: !banned } : u
    ));
    
    showToast(
      banned ? t('adminMessages.userUnbannedSuccess') : t('adminMessages.userBannedSuccess'),
      'success'
    );
  } catch (error) {
    console.error('Ban user error:', error);
    showToast(error.message || t('adminMessages.operationFailed'), 'error');
  }
};
```

5. **Deploy Functions**
```bash
firebase deploy --only functions
```

6. **Test Backend Security**
- Try calling admin function without auth → Should fail
- Try with regular user → Should fail
- Try with admin user → Should succeed

---

## 🚀 MISSION 3: RATE LIMITING & DDOS PROTECTION (Priority: MEDIUM)
**Time Estimate**: 2 hours
**Difficulty**: Medium
**Impact**: Prevents abuse and attacks

### Steps:

1. **Enable Firebase App Check**

Get reCAPTCHA v3 site key:
- Go to: https://www.google.com/recaptcha/admin
- Create new site (reCAPTCHA v3)
- Add your domain
- Copy site key

2. **Add Environment Variable**
```bash
# .env
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

3. **Initialize App Check**
File: `src/firebase.js` (Add after Firebase init)
```javascript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// After: app = initializeApp(FIREBASE_CONFIG);

// App Check - DDoS Protection
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
    console.log('✅ App Check enabled');
  } catch (error) {
    console.warn('App Check initialization failed:', error);
  }
}
```

4. **Enable App Check in Firebase Console**
- Go to Firebase Console → Build → App Check
- Click "Get started"
- Register your app
- Add your reCAPTCHA site key
- Enable enforcement for:
  - Firestore
  - Cloud Functions
  - Authentication

5. **Add Rate Limiting to Functions**
File: `functions/index.js` (Update)
```javascript
const rateLimit = require('express-rate-limit');
const { onRequest } = require('firebase-functions/v2/https');

// Rate limiter: 5 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many requests, please try again later.'
});

// Example protected endpoint
exports.protectedEndpoint = onRequest(
  { cors: true },
  async (req, res) => {
    limiter(req, res, async () => {
      // Your logic here
      res.json({ success: true });
    });
  }
);
```

6. **Add Client-Side Retry Logic**
File: `src/utils/apiClient.js` (Create)
```javascript
/**
 * Retry failed requests with exponential backoff
 */
export async function callWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 'resource-exhausted' && i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
        continue;
      }
      throw error;
    }
  }
}
```

---

## 📋 CHECKLIST (Print and Track Progress)

### XSS Protection
- [ ] Install DOMPurify
- [ ] Create sanitize.js utility
- [ ] Update NoteCard.js
- [ ] Update RichEditor.js
- [ ] Update SharedNotePage.js
- [ ] Write tests
- [ ] Test in browser console

### Backend Admin
- [ ] Setup Firebase Functions
- [ ] Create adminAuth.js helper
- [ ] Migrate banUser function
- [ ] Migrate deleteNote function
- [ ] Migrate settings update
- [ ] Update AdminPage.js frontend calls
- [ ] Deploy functions
- [ ] Test unauthorized access (should fail)

### Rate Limiting
- [ ] Get reCAPTCHA v3 key
- [ ] Add to .env
- [ ] Update firebase.js with App Check
- [ ] Enable in Firebase Console
- [ ] Add rate limiting to functions
- [ ] Create retry utility
- [ ] Test rate limit (make 10 rapid requests)

---

## 🎯 SUCCESS CRITERIA

When complete, you should be able to:

1. **XSS**: Paste `<script>alert('XSS')</script>` in a note → no alert
2. **Admin**: Open console, try to modify isAdmin → backend still blocks
3. **Rate Limit**: Make 10 rapid API calls → see "too many requests" error

---

## 📚 ESTIMATED COSTS

- Firebase Functions: Free tier (125K invocations/month)
- App Check: Free tier (10K verifications/day)
- reCAPTCHA v3: Free (1M assessments/month)

**Total: $0/month** for starter usage

---

## ⚡ QUICK START (Tomorrow)

Pick one mission and follow it step-by-step. Start with Mission 1 (XSS) - it's the easiest and gives immediate value.

**Need help?** Just say: `/security-mission-1` or `/security-mission-2`
