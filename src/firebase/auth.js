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


export const getUsername = () => {
    const savedUsername = localStorage.getItem("username");
  
    return savedUsername || currentUsername;
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
    localStorage.setItem("username", username);

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

    const userId = userCredential.user.uid;  // Get the UID of the signed-in user
    const userDocRef = doc(db, "users", userId); // Get a reference to the user's document in Firestore
    const userDoc = await getDoc(userDocRef); // Fetch the user's document

    if (userDoc.exists()) {
      const username = userDoc.data().username;
      console.log("Username retrieved:", username);
      localStorage.setItem("username", username);
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
    localStorage.setItem("email", result.user.email);

  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};


export const setUsername = async (username) => {
  try {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error("Username is already taken.");
    }

    email = localStorage.getItem("email");

    await setDoc(doc(db, "users", userCredential.user.uid), {
      username,
      email,
    });

  } catch (error) {
    console.error("Error setting username:", error.message);
    throw error;
  }

}


export const signUserOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};