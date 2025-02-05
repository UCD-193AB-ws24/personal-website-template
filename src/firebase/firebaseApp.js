import { initializeApp, getApps, getApp } from "firebase/app";
import firebaseConfig from "./firebaseConfig";

// Ensure Firebase isn't initialized multiple times
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export default app;