import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBiRYwEjTs4CHvwpUrb_Yz5oOHrsxy8nt0",
  authDomain: "poyaday-helper.firebaseapp.com",
  databaseURL:
    "https://poyaday-helper-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "poyaday-helper",
  storageBucket: "poyaday-helper.firebasestorage.app",
  messagingSenderId: "252918445442",
  appId: "1:252918445442:web:81d0314c959036cd57cb9b",
  measurementId: "G-M4J7JXHZEP",
};

const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Authentication
export const auth = getAuth(app);

// Google Login
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Storage
export const storage = getStorage(app);

// Export app (optional but recommended)
export default app;