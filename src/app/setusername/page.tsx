'use client'

import "../css/authentication.css"
import Link from "next/link";
import { setUsername} from "@firebase/auth"
import { useState } from "react"
import { useRouter } from "next/navigation";


export default function SetUsername() {

      const [username, setLocalUsername] = useState("");
    //   const [email, setEmail] = useState("");
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
        //   setEmail("");
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
                <nav className="bg-white border-gray-200 dark:bg-gray-900">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <a href="." className="flex items-center space-x-3 rtl:space-x-reverse">

                        <img src="logo.png" className="h-8" alt="Profesite Logo" />

                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Profesite</span>
                    </a>
                    <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
                    </svg>
                    </button>
                    
                </div>
                </nav>

            </header>
            <div>
                <h1>Set Username</h1>

                <div className="center">
                    <h2>Set Username</h2>
                </div>

                <div className="center">
                    <form onSubmit={handleSetUsername}>
                        <input 
                            type="username" 
                            placeholder="Username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                        <button type="submit">Confirm</button>
                    </form>

                    {success && <p>Username successful!</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}
                </div>
            </div>
        </div>
    );
}