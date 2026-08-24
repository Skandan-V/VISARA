// Firebase & Google Analytics Service Layer for Visara
// Configured with hyperdyn-visara project credentials

const firebaseConfig = {
  apiKey: "AIzaSyCOUiPa3Uihmz8k3f7J57XdwTN00kKMFtE",
  authDomain: "hyperdyn-visara.firebaseapp.com",
  projectId: "hyperdyn-visara",
  storageBucket: "hyperdyn-visara.firebasestorage.app",
  messagingSenderId: "287517365783",
  appId: "1:287517365783:web:c486f45cab65452b90ee52",
  measurementId: "G-NJJ26P5Y2J"
};

let firebaseApp = null;
let firebaseAuth = null;
let firebaseAnalytics = null;
let googleAuthProvider = null;
let isInitialized = false;

// Safe dynamic loader to support both bundled and standalone Electron/Web execution
async function initializeVisaraFirebase() {
  if (isInitialized) return { app: firebaseApp, auth: firebaseAuth, analytics: firebaseAnalytics };

  try {
    let fbApp, fbAuth, fbAnalytics;
    
    try {
      fbApp = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
      fbAuth = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
      try {
        fbAnalytics = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js');
      } catch (e) {
        console.warn('[Visara Firebase] Analytics CDN module optional load notice:', e.message);
      }
    } catch (cdnErr) {
      console.warn('[Visara Firebase] CDN load attempt fallback:', cdnErr.message);
    }

    if (fbApp && fbApp.initializeApp) {
      firebaseApp = fbApp.initializeApp(firebaseConfig);
      
      if (fbAuth && fbAuth.getAuth) {
        firebaseAuth = fbAuth.getAuth(firebaseApp);
        googleAuthProvider = new fbAuth.GoogleAuthProvider();
      }

      if (fbAnalytics && fbAnalytics.getAnalytics) {
        try {
          const supported = await fbAnalytics.isSupported();
          if (supported) {
            firebaseAnalytics = fbAnalytics.getAnalytics(firebaseApp);
          }
        } catch (e) {
          console.warn('[Visara Analytics] isSupported check:', e.message);
        }
      }
      isInitialized = true;
    }
  } catch (err) {
    console.error('[Visara Firebase] Initialization error:', err);
  }

  return {
    app: firebaseApp,
    auth: firebaseAuth,
    analytics: firebaseAnalytics,
    config: firebaseConfig
  };
}

// Analytics Event Tracker (with graceful offline fallback & Google Measurement Protocol support)
async function trackVisaraEvent(eventName, params = {}) {
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    platform: 'electron_desktop',
    app_version: '1.0.0',
    ...params
  };

  // 1. If Firebase Analytics SDK is loaded, log via SDK
  try {
    if (firebaseAnalytics) {
      const { logEvent } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js');
      logEvent(firebaseAnalytics, eventName, payload);
    }
  } catch (e) {
    // Silent fallback
  }

  // 2. Direct Google Analytics Measurement Protocol (Guaranteed real-time hit in desktop environments)
  try {
    const measurementId = firebaseConfig.measurementId;
    if (measurementId && navigator.onLine) {
      let clientId = localStorage.getItem('visara_ga_client_id');
      if (!clientId) {
        clientId = 'visara_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
        localStorage.setItem('visara_ga_client_id', clientId);
      }

      const gaPayload = {
        client_id: clientId,
        events: [{
          name: eventName,
          params: {
            ...payload,
            engagement_time_msec: '100'
          }
        }]
      };

      fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=visara_app`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gaPayload)
      }).catch(() => {});
    }
  } catch (err) {
    // Offline safe
  }

  console.log(`[Visara Analytics Event] 📊 ${eventName}`, payload);
}

// Google Sign-In helper
async function signInWithGooglePopup() {
  if (!firebaseAuth) {
    await initializeVisaraFirebase();
  }

  if (firebaseAuth && googleAuthProvider) {
    const { signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
    return signInWithPopup(firebaseAuth, googleAuthProvider);
  } else {
    throw new Error('Firebase Auth is currently in offline mode');
  }
}

// Sign Out helper
async function signOutUser() {
  if (firebaseAuth) {
    const { signOut } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
    return signOut(firebaseAuth);
  }
  localStorage.removeItem('visara_user');
}

// Global window registration
if (typeof window !== 'undefined') {
  window.VisaraFirebase = {
    config: firebaseConfig,
    init: initializeVisaraFirebase,
    trackEvent: trackVisaraEvent,
    signInWithGoogle: signInWithGooglePopup,
    signOut: signOutUser
  };
}

export {
  firebaseConfig,
  initializeVisaraFirebase,
  trackVisaraEvent,
  signInWithGooglePopup,
  signOutUser
};
