import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "./firebaseConfig";

// Ensure Firebase isn't initialized multiple times
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication, Firestore, and Firebase Storage
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app)

export { auth, db, storage};
