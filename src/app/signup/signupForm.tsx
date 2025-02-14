'use client'

import { useState } from "react"
import { signInWithGoogle, signUpWithEmail } from "@lib/firebase/auth"
import { useRouter } from "next/navigation";
import "@css/authentication.css"


export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleSignUp = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const isOk = await signUpWithEmail(email, username, password);
      setSuccess(isOk);
      if (!isOk) {
        throw new Error("Unsuccessful sign up attempt.");
      }

      setEmail("");
      setPassword("");
      setUsername("");
      router.push("/");
    } catch (err) {
      setSuccess(false);
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  const handleSignInWithGoogle = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    const isOk = await signInWithGoogle();
    if (isOk) {
      router.push("/setusername")
      return;
    }
  };

  return (
    <div>
      <div className="center mt-10">
        <div className="mb-2 text-3xl font-bold">Sign Up</div>
      </div>

      <div className="center flex flex-col gap-4 mt-5 max-w-md mx-auto bg-gray-900 p-10 rounded-lg">
        <form className="grid gap-4" onSubmit={handleSignUp}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit" className="relative px-6 py-4 font-semibold text-white bg-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#d67500] hover:border-[#d67500] shadow-[0_0_10px_rgba(240,135,0,0.4)] hover:shadow-[0_0_15px_rgba(240,135,0,0.6)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 hover:before:scale-100 hover:before:opacity-50">
              <div className="text-center">
                  <div className="-mt-1 font-sans text-lg font-semibold">
                    Sign Up
                  </div>
              </div>
            </button>
        </form>

        {success && <p>Sign-up successful!</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Google Sign-In Button */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <button
            onClick={handleSignInWithGoogle}
           className="flex items-center w-full max-w-xs px-4 py-3 bg-white border border-gray-300 rounded-md shadow-md transition duration-300 hover:bg-gray-100 focus:outline-none"
          >
           <img src="googlelogo.png" alt="Google logo" className="w-6 h-6 mr-3" />
            <span className="text-gray-700 font-medium">Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
