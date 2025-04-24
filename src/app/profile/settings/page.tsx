"use client";

import Navbar from "@components/Navbar";
import DeleteAccountModal from "@components/DeleteAccountModal";
import ReauthModal from "@components/ReauthModal";
import { toastError } from "@components/toasts/ErrorToast";
import { toastSuccess } from "@components/toasts/SuccessToast";
import { changeUsername } from "@lib/requests/changeUsername";
import { fetchUsername } from "@lib/requests/fetchUsername";
import { auth } from "@lib/firebase/firebaseApp";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { ToastContainer } from "react-toastify";
import { signUserOut } from "@lib/firebase/auth";
import { useRouter } from "next/navigation";

export default function Settings() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [deleteAccModalOpen, setDeleteAccModalOpen] = useState(false);
  const [reauthModalOpen, setReauthModalOpen] = useState(false);

  useEffect(() => {
    getUsername();
  }, []);

  const getUsername = async () => {
    const name = await fetchUsername();
    setUsername(name);
  };

  const handleSignOut = async () => {
    try {
      await signUserOut();
      setUsername("");
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const updateUsername = async (newUsername: string) => {
    const res = await changeUsername(newUsername);
    if (res.length === 0) {
      toastSuccess(`Successfully changed your username to ${newUsername}`);
    } else {
      toastError(`Couldn't change your username: ${res}`);
    }
  };

  const reauthSuccess = () => {
    setReauthModalOpen(false);
    setDeleteAccModalOpen(true);
  };

  const reauthFailure = (error: any) => {
    setReauthModalOpen(false);
    if (error?.code === "auth/user-mismatch") {
      toastError(
        "Attempted to sign in as a different user. Please reauthenticate with the same account.",
      );
    } else if (error?.code === "auth/invalid-credential") {
      toastError("Invalid credentials");
    } else {
      toastError("Error reauthenticating. Please try again.");
    }
  };

  return (
    <div>
      <header>
        {user ? (
          <Navbar
            user={true}
            username={username}
            onSignOut={handleSignOut}
            navLinks={[
              { label: "Home", href: "/" },
              { label: "Profile", href: "/profile" },
            ]}
          />
        ) : (
          <Navbar
            user={false}
            navLinks={[
              { label: "Log In", href: "/login" },
              { label: "Sign Up", href: "/signup" },
            ]}
          />
        )}
      </header>
      <main className="mx-auto max-w-screen-xl p-8">
        <div className="flex justify-center">
          <div className="flex flex-col p-2 w-[60%] bg-white rounded shadow-lg">
            <h1 className="text-xl p-2 font-bold border-b border-gray-100">
              Settings
            </h1>
            <div className="flex justify-between p-2 border-b border-gray-100">
              <p>Change username</p>
              <input
                className="px-1 border rounded text-sm"
                placeholder="New username"
                maxLength={20}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    updateUsername(usernameInput);
                  }
                }}
              />
            </div>
            <div className="flex justify-between items-center p-2">
              <p>Delete account</p>
              <button
                className="px-2 py-1 text-sm rounded bg-red-600 text-white font-semibold hover:bg-red-500"
                onClick={() => {
                  // Reauthenticate user: in order to delete a user from auth,
                  // they must have signed in at least 5 minutes before deleteUser is called
                  setReauthModalOpen(true);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
        <DeleteAccountModal
          open={deleteAccModalOpen}
          setOpen={setDeleteAccModalOpen}
        />
        <ReauthModal
          open={reauthModalOpen}
          setOpen={setReauthModalOpen}
          reauthSuccess={reauthSuccess}
          reauthFailure={reauthFailure}
        />
      </main>
      <footer className="mt-[20vh]"></footer>
    </div>
  );
}
