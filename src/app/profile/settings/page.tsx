"use client";
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
import { reauthenticateWithPopup } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth/web-extension";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState(username);
  const [deleteAccModalOpen, setDeleteAccModalOpen] = useState(false);
  const [reauthModalOpen, setReauthModalOpen] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    getUsername();
  }, []);

  const getUsername = async () => {
    const name = await fetchUsername();
    setUsername(name);
    setUsernameInput(name);
  };

  const updateUsername = async (newUsername: string) => {
    const res = await changeUsername(newUsername);
    if (res.length === 0) {
      toastSuccess(`Successfully changed your username to ${newUsername}`);
    } else {
      toastError(`Couldn't change your username: ${res}`);
    }
  };

  const reauthSuccessWithEmail = () => {
    setReauthModalOpen(false);
    setDeleteAccModalOpen(true);
  };

  return (
    <div>
      <ToastContainer />
      <h1>Settings</h1>
      <p>Change username</p>
      <input
        defaultValue={username}
        onChange={(e) => {
          setUsernameInput(e.target.value);
        }}
        onKeyUp={(e) => {
          // Enter key pressed
          if (e.key === "Enter" || e.keyCode === 13) {
            updateUsername(usernameInput);
          }
        }}
      />
      <button
        onClick={() => {
          // Reauthenticate user: in order to delete a user from auth,
          // they must have signed in at least 5 minutes before deleteUser is called
          if (user!.providerData[0].providerId.indexOf("google") !== -1) {
            reauthenticateWithPopup(user!, new GoogleAuthProvider()).then(
              () => {
                setDeleteAccModalOpen(true);
              },
            );
          } else {
            setReauthModalOpen(true);
          }
        }}
      >
        Delete account
      </button>
      <DeleteAccountModal
        open={deleteAccModalOpen}
        setOpen={setDeleteAccModalOpen}
      />
      <ReauthModal
        open={reauthModalOpen}
        setOpen={setReauthModalOpen}
        reauthSuccess={reauthSuccessWithEmail}
      />
    </div>
  );
}
