'use client';
import Link from 'next/link';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@lib/firebase/firebaseApp"
import { signUserOut } from "@lib/firebase/auth"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APIResponse } from "@customTypes/apiResponse";
import Navbar from "@components/Navbar"


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
                          {user ? <Navbar
                                    user={true}
                                    onSignOut={handleSignOut}
                                    navLinks={[
                                      { label: "Home", href: "/"}
                                    ]}
                                  /> :
                                  <Navbar
                                    user={false}
                                    navLinks={[
                                      { label: "Log In", href: "/login"},
                                      { label: "Sign Up", href: "/signup"}
                                    ]}
                                  />
                          }
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
