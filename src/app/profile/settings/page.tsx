"use client";
import { toastError } from "@components/toasts/ErrorToast";
import { toastSuccess } from "@components/toasts/SuccessToast";
import { changeUsername } from "@lib/requests/changeUsername";
import { fetchUsername } from "@lib/requests/fetchUsername"
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState(username);

  useEffect(() => {
    getUsername();
  }, []);

  const getUsername = async () => {
    const name = await fetchUsername();
    setUsername(name);
    setUsernameInput(name);
  }

  const updateUsername = async (newUsername: string) => {
    const res = await changeUsername(newUsername);
    if (res.length === 0) {
      toastSuccess(`Successfully changed your username to ${newUsername}`);
    } else {
      toastError(`Couldn't change your username: ${res}`);
    }
  }

  return (
    <div>
      <ToastContainer />
      <h1>Settings</h1>
      <p>Change username</p>
      <input
        defaultValue={username}
        onChange={(e) => {setUsernameInput(e.target.value)}}
        onKeyUp={(e) => {
          // Enter key pressed
          if (e.key === "Enter" || e.keyCode === 13) {
            updateUsername(usernameInput);
          }
        }}
      />
      <p>Delete account</p>
    </div>
  )
}
