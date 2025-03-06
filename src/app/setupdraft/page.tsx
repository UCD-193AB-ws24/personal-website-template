"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@lib/firebase/firebaseApp";
import { signUserOut } from "@lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APIResponse } from "@customTypes/apiResponse";
import { fetchUsername } from "@lib/requests/fetchUsername";
import Navbar from "@components/Navbar";

export default function SetupDraft() {
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
      setUsername("");
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getUsername = async () => {
    const name = await fetchUsername();
    if (name === null) {
      setUsername("Unknown");
      router.push("/setusername");
    } else {
      setUsername(name);
    }
  };

  const handleNewDraft = async () => {
    if (!user) {
      router.push("/login");
    }

    const timestamp = Date.now();
    try {
      const res = await fetch("/api/user/update-drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: timestamp,
        }),
      });

      const resBody = (await res.json()) as APIResponse<string>;

      if (res.ok && resBody.success) {
        router.push("/editor?draftNumber=" + timestamp);
      } else if (!resBody.success) {
        throw new Error(resBody.error);
      }
    } catch (error: any) {
      console.log("Error creating new draft:", error.message);
    }
  };

  return (
    <div>
      <header>
        {user ? (
          <Navbar
            user={true}
            username={username}
            onSignOut={handleSignOut}
            navLinks={[
              { label: "Home", href: "/" },
              { label: "Profile", href: "/profile" },
              { label: "Drafts", href: "/saveddrafts" },
            ]}
          />
        ) : (
          <Navbar
            user={false}
            navLinks={[
              { label: "Log In", href: "/login" },
              { label: "Sign Up", href: "/signup" },
            ]}
          />
        )}
      </header>

      <main className="mx-auto max-w-screen-xl p-4">
        <div className="flex w-full max-w-screen-xl p-4 h-1/2">
          <div className="flex w-full max-w-screen-xl p-4">
            {/* Left Content */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-md p-16 text-white bg-[#111827] shadow-md flex flex-col justify-between rounded-md">
                <div>
                  <h1 className="text-xl font-semibold">Choose a template</h1>

                  <p className="mt-4">
                    Want some inspiration for your website? Find a template to
                    quickstart your draft!
                  </p>
                </div>

                <div className="flex justify-center mt-16">
                  <button
                    onClick={() => router.push("/templates")}
                    className="relative inline-flex px-6 py-4 w-1/2 text-md font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#f08700] hover:text-black shadow-[0_0_10px_rgba(240,135,0,0.4)] hover:shadow-[0_0_15px_rgba(240,135,0,0.6)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 hover:before:scale-100 hover:before:opacity-50 items-center justify-center text-center"
                  >
                    Templates
                  </button>
                </div>
              </div>
            </div>

            {/* Vertical Separator */}
            <div className="w-1 bg-gray-400 mx-4"></div>

            {/* Right Content */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-md p-16 text-white bg-[#111827] shadow-md flex flex-col justify-between rounded-md">
                <div>
                  <h1 className="text-xl font-semibold">Start from scratch</h1>

                  <p className="mt-4">
                    What better joy than making your own idea come to life?
                    Start with a clean canvas!
                  </p>
                </div>

                <div className="flex justify-center mt-16">
                  <button
                    onClick={handleNewDraft}
                    className="relative inline-flex px-6 py-4 w-1/2 text-md font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#f08700] hover:text-black shadow-[0_0_10px_rgba(240,135,0,0.4)] hover:shadow-[0_0_15px_rgba(240,135,0,0.6)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 hover:before:scale-100 hover:before:opacity-50 items-center justify-center text-center"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer></footer>
    </div>
  );
}
