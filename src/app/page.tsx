'use client'

import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@firebase/firebaseApp"
import { getUsername, signUserOut } from "@firebase/auth"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Home() {

  const [user] = useAuthState(auth);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (user) {
      handleGetUsername();
    }
  }, [user]);

  const handleSignOut = async () => {

    try {
      await signUserOut();
      setUsername("")
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  const handleGetUsername = async () => {

    try {
      const username =  await getUsername();
      setUsername(username || "username not found");
    } catch (error) {
      console.error("Could not retrieve username");
      setUsername("username not found");
    }
  }

  return (
    <div>
      <header>
        <nav className="bg-white border-gray-200 dark:bg-gray-900">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <Link href="." className="flex items-center space-x-3 rtl:space-x-reverse">

              <img src="logo.png" className="h-8" alt="Profesite Logo" />

              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Profesite</span>
            </Link>
            <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
              </svg>
            </button>
            <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                
                { user ? <button onClick={handleSignOut}>Log Out</button> : 
                  <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                    <li>
                      <Link href="/login" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent" aria-current="page">
                        Log In
                      </Link>
                    </li>
                    <li>
                      <Link href="/signup" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                        Sign Up
                      </Link>
                    </li>
                  </ul>
                }

            </div>
          </div>
        </nav>
      </header>
      <main className="flex justify-center">

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          { user && username !== "" ? <h2>Hi {username}!</h2> : <div></div> }

            <Link href="/editor">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Editor
              </button>
            </Link>
        </div>
        
      </main>
      <footer></footer>
    </div>
  );
}
