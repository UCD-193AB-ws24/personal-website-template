'use client'

import { useState } from "react"
import { signInWithGoogle, signUpWithEmail } from "@firebase/auth"
import { useRouter } from "next/navigation";
import "../css/authentication.css"


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
      await signUpWithEmail(email, username, password);
      setSuccess(true);
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

  const handleSignUpWithGoogle = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      await signInWithGoogle();
      setSuccess(true);
      setEmail("");
      setPassword("");
      setUsername("");
      router.push("/setusername");
    } catch (err) {
      setSuccess(false);
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <div>

      <div className="center">
        <div className="mt-5 text-lg font-semibold">Sign Up</div>
      </div>

      <div className="center flex flex-col gap-4 mt-5 max-w-md mx-auto bg-gray-100 p-10 rounded-lg">
        <form className="grid gap-4" onSubmit={handleSignUp}>
            <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="p-2 border rounded w-full"
            />
            <input 
                type="username" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                className="p-2 border rounded w-full"
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md cursor-pointer hover:bg-green-600 hover:brightness-70 transition duration-200 ease-in-out">
              Sign Up
            </button>
        </form>

        {success && <p>Sign-up successful!</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      
        <div className="center">
          <img onClick={handleSignUpWithGoogle} src="googlelogo.png" alt="Sign in with Google" className="shadow-md hover:brightness-50 focus:outline-none transition duration-200 ease-in-out"/>
        </div>
      </div>
    </div>
  );
}
