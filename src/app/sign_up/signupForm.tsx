'use client'

import { useState } from "react"
import { signUpWithEmail } from "@firebase/auth"
import "../css/signup.css"

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError(false);
    setSuccess(false);

    try {
      await signUpWithEmail(email, password);
      setSuccess(true);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(true);
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

    </div>
  );
}
