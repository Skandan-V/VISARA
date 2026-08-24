// Visara Auth Manager (Google Authentication + Offline Guest Mode)

import { initializeVisaraFirebase, signInWithGooglePopup, signOutUser, trackVisaraEvent } from './firebase.js';

class VisaraAuthManager {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    this.init();
  }

  async init() {
    // 1. Check existing saved session
    const savedUser = localStorage.getItem('visara_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        this.currentUser = null;
      }
    }

    // 2. Initialize Firebase in background
    try {
      const { auth } = await initializeVisaraFirebase();
      if (auth) {
        const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
        onAuthStateChanged(auth, (user) => {
          if (user) {
            const profile = {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'Visara User',
              email: user.email || '',
              photoURL: user.photoURL || '',
              isAnonymous: false
            };
            this.setUser(profile);
          } else if (!this.isGuestMode()) {
            this.setUser(null);
          }
        });
      }
    } catch (err) {
      console.warn('[Visara Auth] Firebase listener notice:', err.message);
    }

    this.notifyListeners();
  }

  setUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('visara_user', JSON.stringify(user));
      trackVisaraEvent('user_session_active', { uid: user.uid, email: user.email });
    } else {
      localStorage.removeItem('visara_user');
    }
    this.notifyListeners();
  }

  isGuestMode() {
    return localStorage.getItem('visara_guest_mode') === 'true';
  }

  setGuestMode(enabled = true) {
    if (enabled) {
      localStorage.setItem('visara_guest_mode', 'true');
      this.currentUser = {
        uid: 'guest_' + Date.now(),
        displayName: 'Local User',
        email: 'Offline Mode',
        photoURL: '',
        isAnonymous: true
      };
      trackVisaraEvent('guest_login', { type: 'local_mode' });
    } else {
      localStorage.removeItem('visara_guest_mode');
      this.currentUser = null;
    }
    this.notifyListeners();
  }

  async loginWithGoogle() {
    try {
      trackVisaraEvent('auth_google_click');
      const result = await signInWithGooglePopup();
      if (result && result.user) {
        const profile = {
          uid: result.user.uid,
          displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Visara User',
          email: result.user.email || '',
          photoURL: result.user.photoURL || '',
          isAnonymous: false
        };
        localStorage.removeItem('visara_guest_mode');
        this.setUser(profile);
        trackVisaraEvent('login_success', { provider: 'google', uid: profile.uid });
        return { success: true, user: profile };
      }
    } catch (error) {
      console.error('[Visara Auth] Google login failed:', error);
      trackVisaraEvent('login_error', { code: error.code || 'unknown', message: error.message });
      throw error;
    }
  }

  async logout() {
    trackVisaraEvent('logout');
    await signOutUser();
    localStorage.removeItem('visara_guest_mode');
    this.setUser(null);
  }

  getUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  onAuthStateChange(callback) {
    this.authListeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners() {
    this.authListeners.forEach(cb => {
      try { cb(this.currentUser); } catch (e) { console.error(e); }
    });
  }
}

export const authManager = new VisaraAuthManager();
if (typeof window !== 'undefined') {
  window.visaraAuth = authManager;
}
