"use client";

import "./homePage.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirebaseAuth } from "@lib/firebase/firebaseApp";
const auth = getFirebaseAuth();

import { signUserOut } from "@lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUsername } from "@lib/requests/fetchUsername";
import Navbar from "@components/Navbar";

export default function Home() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (user) {
      getUsername();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } else {
      router.push("/setupdraft");
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
        <div className="grid grid-cols-1 gap-y-16 md:gap-y-32 justify-items-center md:items-end md:grid-cols-3 md:gap-x-8 md:pb-64">
          <div className="perspective-text justify-self-start mt-16 md:mt-48 md:mr-16">
            <div className="perspective-line left-[1rem] h-[2.25rem] md:h-[3.5rem]">
              <p className="text-4xl/[2.25rem] md:text-6xl/[3.5rem]">Your</p>
            </div>
            <div className="perspective-line left-[2.25rem] md:left-[3rem] h-[1.875rem] md:h-[3.5rem]">
              <p className="text-3xl/[1.875rem] md:text-5xl/[3.5rem]">
                Professional
              </p>
            </div>
            <div className="perspective-line left-[3.33rem] md:left-[5rem] h-[1.875rem] md:h-[3.5rem]">
              <p className="text-3xl/[1.875rem] md:text-5xl/[3.5rem]">
                Website,
              </p>
            </div>
            <div className="perspective-line left-[4.45rem] md:left-[7rem] h-[1.875rem] md:h-[3.5rem]">
              <p className="text-3xl/[1.875rem] md:text-5xl/[3.5rem]">Your</p>
            </div>
            <div className="perspective-line left-[5.55rem] md:left-[9rem] h-[1.875rem] md:h-[3.5rem]">
              <p className="text-4xl/[2.25rem] md:text-6xl/[3.5rem]">Way</p>
            </div>
          </div>
          <div className="md:grid md:grid-cols-subgrid md:col-span-2 md:justify-end">
            <p className="md:col-start-2 mb-5 text-base text-gray-700 sm:text-xl tracking-wide mt-10 sm:mt-16 md:mt-24">
              Build a personal website that&apos;s as unique as you. Showcase
              your skills, experience, and personality with no coding required.
              Make a lasting impression on recruiters, clients, and connections.
            </p>
            <div className="justify-self-center md:col-start-2 md:justify-self-start space-y-4 sm:flex sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
              <button
                data-testid="new-draft-button"
                onClick={handleNewDraft}
                className="relative px-6 py-4 font-semibold text-white bg-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#d67500] hover:border-[#d67500] shadow-[0_0_10px_rgba(240,135,0,0.4)] hover:shadow-[0_0_15px_rgba(240,135,0,0.6)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 hover:before:scale-100 hover:before:opacity-50"
              >
                <div className="text-left rtl:text-right">
                  <div className="-mt-1 font-sans text-lg font-semibold">
                    Start Building
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 p-6 text-center bg-gray-900 border border-[#00f2ff] sm:p-10 rounded-lg relative overflow-hidden">
          <h3 className="mb-2 text-3xl font-bold text-white">Why Profesite?</h3>
          <div className="flex justify-center mt-2">
            <div className="grid justify-start grid-cols-2 px-2 text-left gap-y-2 md:grid-cols-[auto_minmax(0,1fr)] md:px-16 gap-x-8">
              <p className="justify-self-start text-white">Stand Out</p>
              <p className="justify-self-start text-white">
                Go beyond a resume with a polished personal site
              </p>

              <p className="justify-self-start text-white">
                Effortless Customization
              </p>
              <p className="justify-self-start text-white">
                Choose sleek templates and personalize within minutes
              </p>
              <p className="justify-self-start text-white">
                Seamless Integration
              </p>
              <p className="justify-self-start text-white">
                Connect your portfolio, LinkedIn, and contact info
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 p-6 text-center bg-gray-900 border border-[#00f2ff] sm:p-10 rounded-lg relative overflow-hidden">
          <h3 className="mb-2 text-3xl font-bold text-white">How It Works</h3>
          <div className="flex justify-center mt-2">
            <div className="grid justify-start grid-cols-2 px-2 text-left gap-y-2 md:grid-cols-[auto_minmax(0,1fr)] md:px-16 gap-x-8">
              <p className="justify-self-start text-white">Pick a template</p>
              <p className="justify-self-start text-white">
                Choose a design that fits your style
              </p>
              <p className="justify-self-start text-white">Customize</p>
              <p className="justify-self-start text-white">
                Add your bio, projects, and experiences
              </p>
              <p className="justify-self-start text-white">Publish and share</p>
              <p className="justify-self-start text-white">
                Launch in one click, impress instantly
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 p-6 text-center bg-gray-900 border border-[#00f2ff] sm:p-10 rounded-lg relative overflow-hidden">
          <h3 className="mb-2 text-3xl font-bold text-white">
            Who&apos;s It For?
          </h3>
          <div className="flex justify-center mt-2">
            <div className="grid justify-start grid-cols-2 px-2 text-left gap-y-2 md:grid-cols-[auto_minmax(0,1fr)] md:px-16 gap-x-8">
              <p className="justify-self-start text-white">Job seekers</p>
              <p className="justify-self-start text-white">
                Make a powerful first impression
              </p>
              <p className="justify-self-start text-white">Freelancers</p>
              <p className="justify-self-start text-white">
                Showcase your portfolio and services
              </p>
              <p className="justify-self-start text-white">
                Students and graduates
              </p>
              <p className="justify-self-start text-white">
                Stand out from the competition
              </p>
              <p className="justify-self-start text-white">Entrepreneurs</p>
              <p className="justify-self-start text-white">
                Build your own personal brand with credibility
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 p-6 text-center bg-gray-900 border border-[#00f2ff] sm:p-10 rounded-lg relative overflow-hidden">
          <h3 className="mb-4 text-3xl font-bold text-white">
            Start Your Website Today
          </h3>
          <p className="mb-4 text-white">No coding. No hassle. Just results.</p>
          <button
            data-testid="new-draft-button"
            onClick={handleNewDraft}
            className="relative inline-flex px-6 py-4 text-lg font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#f08700] hover:text-black shadow-[0_0_10px_rgba(240,135,0,0.4)] hover:shadow-[0_0_15px_rgba(240,135,0,0.6)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 hover:before:scale-100 hover:before:opacity-50 items-center justify-center text-center"
          >
            <div className="text-left rtl:text-right">
              <div className="-mt-1 font-sans text-lg font-semibold">
                Create My Site Now
              </div>
            </div>
          </button>
        </div>
      </main>

      <footer></footer>
    </div>
  );
}
