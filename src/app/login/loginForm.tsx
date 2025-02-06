'use client'

import "../css/authentication.css"
import Link from "next/link";
import { signInWithGoogle, signInWithEmail } from "@firebase/auth"
import { useState } from "react"
import { useRouter } from "next/navigation";


export default function LogInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleSignIn = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      await signInWithEmail(email, password);
      setSuccess(true);
      setEmail("");
      setPassword("");
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

  const handleSignInWithGoogle = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      await signInWithGoogle();
      setSuccess(true);
      setEmail("");
      setPassword("");
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

      <div className="center">
        <h2>Log In</h2>
      </div>

      <div className="center">
        <form onSubmit={handleSignIn}>
            <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />
            <button type="submit">Log In</button>
        </form>

        {success && <p>Log in successful!</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <div className="center">
        <button onClick={handleSignInWithGoogle} className="google-btn">
          Log in with Google
        </button>
      </div>

      <div className="center">
        <Link href="/signup">
          Make an account
        </Link>
      </div>

    </div>
  );
}
