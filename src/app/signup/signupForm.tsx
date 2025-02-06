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

  return (
    <div>

      <div className="center">
        <h2>Sign Up</h2>
      </div>

      <div className="center">
        <form onSubmit={handleSignUp}>
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
            <button type="submit">Sign Up</button>
        </form>

        {success && <p>Sign-up successful!</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <div className="center">
        <button onClick={signInWithGoogle} className="google-btn">
          Sign Up with Google
        </button>
      </div>

    </div>
  );
}
