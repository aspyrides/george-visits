// Fill this in with your own Firebase project's config. See README.md for
// step-by-step setup instructions (it's free — the Spark plan easily covers
// a small family app like this one).
//
// Firebase Console > Project settings (gear icon) > scroll to "Your apps" >
// Web app > "SDK setup and configuration" > Config.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Resolves once this browser has a stable anonymous identity. That identity
// (not a login) is what we use as the "device ID" to tell bookings apart and
// to allow people to cancel only their own visit.
export const authReady = new Promise((resolve, reject) => {
  const unsubscribe = onAuthStateChanged(
    auth,
    (user) => {
      if (user) {
        unsubscribe();
        resolve(user.uid);
      } else {
        signInAnonymously(auth).catch(reject);
      }
    },
    reject
  );
});
