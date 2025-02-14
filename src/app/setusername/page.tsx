'use client'

import "@css/authentication.css"
import { setUsername} from "@lib/firebase/auth"
import { useState } from "react"
import { useRouter } from "next/navigation";
import Navbar from "@components/Navbar"


export default function SetUsername() {

      const [username, setLocalUsername] = useState("");
      const [error, setError] = useState("");
      const [success, setSuccess] = useState(false);

      const router = useRouter();

      const handleSetUsername = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        try {
          await setUsername(username);
          setSuccess(true);
          setLocalUsername("");
          router.push("/");

        } catch (err) {
          setSuccess(false);
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("An unknown error occurred.");
          }
        }
      };


    return (
      <div>
        <header>
          <Navbar
            user={false}
          />
        </header>

        <div className="center">
          <div className="mt-5 text-lg font-semibold">Set Username</div>
        </div>

        <div className="center flex flex-col gap-4 mt-5 max-w-md mx-auto bg-gray-100 p-10 rounded-lg">
          <form className="grid gap-4" onSubmit={handleSetUsername}>
              <input
                  type="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setLocalUsername(e.target.value)}
                  required
                  className="p-2 border rounded w-full"
              />
              <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md cursor-pointer hover:bg-green-600 hover:brightness-70 transition duration-200 ease-in-out">
                Confirm
              </button>
          </form>

          {success && <p>Username successful!</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    );
}
