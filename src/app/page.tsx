'use client';

import "./homePage.css"
import Link from 'next/link';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@firebase/firebaseApp"
import { signUserOut } from "@firebase/auth"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APIResponse } from "@customTypes/apiResponse";


export default function Home() {
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
                  <li onClick={handleSignOut} className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent cursor-pointer">
                    Log Out
                  </li> 
                </ul> :
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
				<div className="grid grid-cols-1 gap-y-16 sm:gap-y-32 justify-items-center md:items-end md:grid-cols-3 md:gap-x-8 pb-64">
          <div className="perspective-text justify-self-start mt-32 mr-16">
            <div className="perspective-line">
              <p className="text-3xl sm:text-6xl">Your</p>
            </div>
            <div className="perspective-line">
              <p className="text-2xl sm:text-5xl">Professional</p>
            </div>
            <div className="perspective-line">
              <p className="text-2xl sm:text-5xl">Website,</p>
            </div>
            <div className="perspective-line">
              <p className="text-2xl sm:text-5xl">Your</p>
            </div>
            <div className="perspective-line">
              <p className="text-3xl sm:text-6xl">Way</p>
            </div>
          </div>
          <div className="md:grid md:grid-cols-subgrid md:col-span-2 md:justify-end">
            <p className="md:col-start-2 mb-5 text-base text-gray-500 sm:text-lg dark:text-gray-400">
              Create a stunning personal website that showcases your
              skills, experience, and personality with no coding
              required. Impress recruiters, clients, and connections
              effortlessly.
            </p>
            <div className="justify-self-center md:col-start-2 md:justify-self-start space-y-4 sm:flex sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
              <Link
                href="/editor"
                className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 text-white rounded-lg inline-flex items-center justify-center px-4 py-2.5 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
              >
                <div className="text-left rtl:text-right">
                  <div className="-mt-1 font-sans text-sm font-semibold">
                    Start building
                  </div>
                </div>
              </Link>
            </div>
          </div>
				</div>

        <div className="p-4 text-center bg-white border border-gray-200 rounded-lg shadow-sm sm:p-8 dark:bg-gray-800 dark:border-gray-700">
					<h3 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Why Profesite?
					</h3>
          <div className="flex justify-center">
            <div className="grid justify-start pl-16 pr-16 gap-x-8" style={{gridTemplateColumns: "auto minmax(0, 1fr)"}}>
              <p className="justify-self-start">Stand out</p>
              <p className="justify-self-start">Go beyond a resume with a polished personal site</p>
              <p className="justify-self-start">Effortless customization</p>
              <p className="justify-self-start">Choose sleek templates and personalize within minutes</p>
              <p className="justify-self-start">Seamless integration</p>
              <p className="justify-self-start">Connect your portfolio, LinkedIn, and contact info</p>
            </div>
          </div>
				</div>

        <div className="mt-16 p-4 text-center bg-white border border-gray-200 rounded-lg shadow-sm sm:p-8 dark:bg-gray-800 dark:border-gray-700">
					<h3 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            How it works
					</h3>
          <div className="flex justify-center">
            <div className="grid justify-start pl-16 pr-16 gap-x-8" style={{gridTemplateColumns: "auto minmax(0, 1fr)"}}>
              <p className="justify-self-start">Pick a template</p>
              <p className="justify-self-start">Choose a design that fits your style</p>
              <p className="justify-self-start">Customize</p>
              <p className="justify-self-start">Add your bio, projects, and experiences</p>
              <p className="justify-self-start">Publish and share</p>
              <p className="justify-self-start">Launch in one click, impress instantly</p>
            </div>
          </div>
				</div>

        <div className="mt-16 p-4 text-center bg-white border border-gray-200 rounded-lg shadow-sm sm:p-8 dark:bg-gray-800 dark:border-gray-700">
					<h3 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Who it&apos;s for
					</h3>
          <div className="flex justify-center">
            <div className="grid justify-start pl-16 pr-16 gap-x-8" style={{gridTemplateColumns: "auto minmax(0, 1fr)"}}>
              <p className="justify-self-start">Job seekers</p>
              <p className="justify-self-start">Make a powerful first impression</p>
              <p className="justify-self-start">Freelancers</p>
              <p className="justify-self-start">Showcase your portfolio and services</p>
              <p className="justify-self-start">Students and graduates</p>
              <p className="justify-self-start">Stand out from the competition</p>
              <p className="justify-self-start">Entrepreneurs</p>
              <p className="justify-self-start">Build your own personal brand with credibility</p>
            </div>
          </div>
				</div>

        <div className="mt-16 p-4 text-center bg-white border border-gray-200 rounded-lg shadow-sm sm:p-8 dark:bg-gray-800 dark:border-gray-700">
					<h3 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Start your website today
					</h3>
          <p className="mb-4">No coding. No hassle. Just results</p>
          <Link
            href="/editor"
            className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 text-white rounded-lg inline-flex items-center justify-center px-4 py-2.5 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
          >
            <div className="text-left rtl:text-right">
              <div className="-mt-1 font-sans text-sm font-semibold">
                Create my site now
              </div>
            </div>
          </Link>
				</div>
			</main>
			<footer></footer>
		</div>
	);
}
