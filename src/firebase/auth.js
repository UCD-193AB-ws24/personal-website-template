import { createUserWithEmailAndPassword, 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut } from "firebase/auth";
  import { getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs,
    query, 
    collection, 
    where } from "firebase/firestore"; 

import {auth, db} from "./firebaseApp";

let currentUsername = "";


export const getUsername = async () => {
  if (!auth.currentUser) {
    console.error("No user is signed in.");
    return null;
  }

  const userDocRef = doc(db, "users", auth.currentUser.uid);

  try {
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log("No matching user found");
      return null;
    }

    const userData = userDoc.data();
    console.log("User data:", userData);

    return userData.username;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}


export const signUpWithEmail = async (email, username, password) => {

  try {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error("Username is already taken.");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User signed up:", userCredential.user);

    await setDoc(doc(db, "users", userCredential.user.uid), {
      username,
      email,
    });

  } catch (error) {
    console.error("Error signing up:", error.message);
    throw error;
  }
};


export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in:", userCredential.user);

    const userId = userCredential.user.uid;
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const username = userDoc.data().username;
      console.log("Username retrieved:", username);
      currentUsername = username;
      return username;
    } else {
      console.log("No user data found for this UID.");
      return null;
    }


  } catch (error) {
    console.error("Error signing in:", error.message);
    throw error;
  }
};


const provider = new GoogleAuthProvider();
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("User signed in:", result.user);

  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};


export const setUsername = async (username) => {
  try {
    if (!auth.currentUser) {
      throw new Error("No user is signed in.");
    }

    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error("Username is already taken.");
    }

    const email = auth.currentUser.email;
    const userId = auth.currentUser.uid;

    await setDoc(doc(db, "users", userId), { username, email }, { merge: true });

  } catch (error) {
    console.error("Error setting username:", error.message);
    throw error;
  }
}


export const signUserOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};