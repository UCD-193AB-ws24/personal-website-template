"use client";

import DeleteAccountModal from "@components/DeleteAccountModal";
import ReauthModal from "@components/ReauthModal";
import { toastError } from "@components/toasts/ErrorToast";
import { toastSuccess } from "@components/toasts/SuccessToast";
import { changeUsername } from "@lib/requests/changeUsername";
import { fetchUsername } from "@lib/requests/fetchUsername";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState(username);
  const [deleteAccModalOpen, setDeleteAccModalOpen] = useState(false);
  const [reauthModalOpen, setReauthModalOpen] = useState(false);

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
      toastError("Error reauthenticating. Please try again.")
    }
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
          setReauthModalOpen(true);
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
        reauthSuccess={reauthSuccess}
        reauthFailure={reauthFailure}
      />
    </div>
  );
}
