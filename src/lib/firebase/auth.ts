import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";

import { getFirebaseAuth, getFirebaseDB } from "./firebaseApp";
const auth = getFirebaseAuth();
const db = getFirebaseDB();
// import { auth, db } from "./firebaseApp";

import { APIResponse } from "@customTypes/apiResponse";
import isValidUsername from "@utils/isValidUsername";
import { setUsernameCookie } from "@lib/requests/setUsernameCookie";
import { fetchUsername } from "@lib/requests/fetchUsername";

export const signUpWithEmail = async (
  email: string,
  username: string,
  password: string,
) => {
  try {
    let errMsg = isValidUsername(username);
    if (errMsg.length !== 0) {
      throw new Error(errMsg);
    }

    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error("Username is already taken.");
    }

    const userCredentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    console.log("User signed up:", userCredentials.user);

    await setDoc(doc(db, "users", userCredentials.user.uid), {
      username,
      email,
    });

    errMsg = await setUsernameCookie(username);
    if (errMsg.length !== 0) {
      throw new Error(errMsg);
    }

    const idToken = await userCredentials.user.getIdToken();
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    const resBody = (await response.json()) as APIResponse<string>;

    if (response.ok && resBody.success) {
      return true;
    }
    return false;
  } catch (error: any) {
    console.log("Error signing up:", error.message);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredentials = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const idToken = await userCredentials.user.getIdToken();
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    const username = await fetchUsername();
    if (username.length === 0) {
      throw new Error("No username found");
    }

    const resBody = (await response.json()) as APIResponse<string>;
    return resBody;
  } catch (error: any) {
    console.log("Error signing in:", error.message);

    return { success: false, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const userCredentials = await signInWithPopup(auth, provider);
    const idToken = await userCredentials.user.getIdToken();

    console.log("User signed in:", userCredentials.user);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    const resBody = (await response.json()) as APIResponse<string>;

    if (response.ok && resBody.success) {
      return true;
    }
    return false;
  } catch (error: any) {
    console.log("Error signing in:", error.message);

    return false;
  }
};

export const setUsername = async (username: string) => {
  try {
    let errMsg = isValidUsername(username);
    if (errMsg.length !== 0) {
      throw new Error(errMsg);
    }

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

    await setDoc(
      doc(db, "users", userId),
      { username, email },
      { merge: true },
    );

    errMsg = await setUsernameCookie(username);
    if (errMsg.length !== 0) {
      throw new Error(errMsg);
    }
  } catch (error: any) {
    console.log("Error setting username:", error.message);
    throw error;
  }
};

// export const signUserOut = async () => {
//   try {
//     await signOut(auth);
//     console.log("User signed out");
//   } catch (error) {
//     console.error("Error signing out:", error);
//     throw error;
//   }
// };

export async function signUserOut() {
  try {
    await auth.signOut();

    const response = await fetch("/api/auth/signout", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resBody = (await response.json()) as APIResponse<string>;
    if (response.ok && resBody.success) {
      return true;
    }
    return false;
  } catch (error: any) {
    console.log("Error signing out:", error.message);
    return false;
  }
}
