'use client';
import Link from 'next/link';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@lib/firebase/firebaseApp"
import { signUserOut } from "@lib/firebase/auth"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APIResponse } from "@customTypes/apiResponse";


export default function SavedDrafts() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (user) {
      getUsername();
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

  const getUsername = async () => {
    try {
      const response = await fetch("/api/user/username", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const resBody = await response.json() as APIResponse<string>;

      if (response.ok && resBody.success) {
        setUsername(resBody.data);
      } else {
        throw new Error("Unknown username");
      }
    } catch (error: any) {
      setUsername("Unknown");
      router.push("/setusername")
      console.log(error.message);
    }
  }

  const loadEditor = async (draftNumber: string) => {
    router.push("/editor?draftNumber=" + draftNumber);
  }

	return (
		<div>
			<header>
				<nav className="bg-white border-gray-200 dark:bg-gray-900">
					<div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
						<a
							href="."
							className="flex items-center space-x-3 rtl:space-x-reverse"
						>
							<img
								src="logo.png"
								className="h-8"
								alt="Profesite Logo"
							/>

							<span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
								Profesite
							</span>
						</a>
						<button
							data-collapse-toggle="navbar-default"
							type="button"
							className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
							aria-controls="navbar-default"
							aria-expanded="false"
						>
							<span className="sr-only">Open main menu</span>
							<svg
								className="w-5 h-5"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 17 14"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M1 1h15M1 7h15M1 13h15"
								/>
							</svg>
						</button>
						<div
							className="hidden w-full md:block md:w-auto"
							id="navbar-default"
						>
              { user ?
                <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                  <li>
                    <p>{username}</p>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                      aria-current="page"
                    >
                      Home
                    </Link>
                  </li>
                  <li onClick={handleSignOut} className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent cursor-pointer">
                    Log Out
                  </li>
                </ul>
                :
                <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                  <li>
                    <Link
                      href="/login"
                      className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                      aria-current="page"
                    >
                      Log In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                    >
                      Sign Up
                    </Link>
                  </li>
                </ul>
              }
						</div>
					</div>
				</nav>
			</header>
			<main className="mx-auto max-w-screen-xl p-4">

                <div>
                   <p className="text-2xl sm:text-5xl"> Saved Drafts </p>
                </div>

                <div id="draftsContainer" className="flex justify-evenly gap-4 mt-12">

                    <button onClick={() => loadEditor("1")} className="w-[250px] h-[350px] border-2 border-black shadow-lg p-2 hover:bg-[#111827] hover:text-[#f08700] transition duration-300">Draft 1</button>

                    <button onClick={() => loadEditor("2")} className="w-[250px] h-[350px] border-2 border-black shadow-lg p-2 hover:bg-[#111827] hover:text-[#f08700] transition duration-300">Draft 2</button>

                    <button onClick={() => loadEditor("3")} className="w-[250px] h-[350px] border-2 border-black shadow-lg p-2 hover:bg-[#111827] hover:text-[#f08700] transition duration-300">Draft 3</button>

                </div>

			</main>
			<footer></footer>
		</div>
	);
}
