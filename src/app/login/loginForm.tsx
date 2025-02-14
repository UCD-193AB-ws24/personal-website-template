'use client'

import Image from "next/image";
import googleLogo from "@public/googlelogo.png";
import "@css/authentication.css"
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

    const response = await signInWithEmail(email, password);
    if (response.success === true) {
      router.push("/")
      return;
    } else {
      setError(response.error);
    }
  };

  const handleSignInWithGoogle = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    const isOk = await signInWithGoogle();
    if (isOk) {
      router.push("/")
      return;
    }
  };

  return (
    <div>

      <div className="center">
        <div className="mt-5 text-lg font-semibold">Log In</div>
      </div>

      <div className="center flex flex-col gap-4 mt-5 max-w-md mx-auto bg-gray-100 p-10 rounded-lg">
        <form className="grid gap-4" onSubmit={handleSignIn}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="p-2 border rounded w-full"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="p-2 border rounded w-full"
          />
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md cursor-pointer hover:bg-green-600 hover:brightness-70 transition duration-200 ease-in-out">
            Log In
          </button>
        </form>

        {success && <p>Log in successful!</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="center">
          <Image onClick={handleSignInWithGoogle} src={googleLogo} alt="Sign in with Google" className="shadow-md hover:brightness-50 focus:outline-none transition duration-200 ease-in-out"/>
        </div>

        <Link href="/signup" className="center">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 hover:brightness-70 focus:outline-none transition duration-200 ease-in-out">
            Make an account
          </button>
        </Link>

      </div>
    </div>
  );
}
