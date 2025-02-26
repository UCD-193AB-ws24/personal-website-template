'use client';

import "../homePage.css"
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@lib/firebase/firebaseApp"
import { signUserOut } from "@lib/firebase/auth"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APIResponse } from "@customTypes/apiResponse";
import { fetchUsername } from '@lib/requests/fetchUsername'
import Navbar from "@components/Navbar"


export default function Profile() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState("");
  const [publishedDraftNumber, setPublishedDraftNumber] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (user) {
      getUsername();
      getPublishedDraftNumber();
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
    const name = await fetchUsername();
    if (name === null) {
      setUsername("Unknown");
      router.push("/setusername") 
    } else {
      setUsername(name);
    }
  }

  const handleNewDraft = async () => {
    if (!user) {
      router.push("/login");
    }

		const timestamp = Date.now();
		try {
			const res = await fetch('/api/user/update-drafts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					timestamp: timestamp,
				}),
			});

			const resBody = (await res.json()) as APIResponse<string>;

			if (res.ok && resBody.success) {
				router.push('/editor?draftNumber=' + timestamp);
			} else if (!resBody.success) {
				throw new Error(resBody.error);
			}
		} catch (error: any) {
			console.log('Error creating new draft:', error.message);
		}
	};

  const handleOpenWebsite = async () => {
    try {
      window.open("https://www.profesite.online/pages/" + username, "_blank");
    } catch (error: any) {
      console.log('Error opening website:', error.message);
    }
  };

  const getPublishedDraftNumber = async () => {
    try {
      const response = await fetch("/api/user/get-published-draftnumber", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const resBody = await response.json() as APIResponse<string>;

      if (response.ok && resBody.success) {

        console.log("draftnum: ", resBody.data);

        if (resBody.data !== undefined) {
          setPublishedDraftNumber(resBody.data);
        }

      } else {
        throw new Error("Unknown draftNumber");
      }
    } catch (error: any) {
      setPublishedDraftNumber("");
      console.log(error.message);
    }
  }

	return (
		<div>
			<header>
                {user ? <Navbar
                        user={true}
                        username={username}
                        onSignOut={handleSignOut}
                        navLinks={[
                            { label: "Home", href: "/"},
                            { label: "Drafts", href: "/saveddrafts"}
                        ]}
                        /> :
                        <Navbar
                        user={false}
                        navLinks={[
                            { label: "Log In", href: "/login" },
                            { label: "Sign Up", href: "/signup" }
                        ]}
                        />
                }
			</header>
      

        <main className="mx-auto max-w-screen-xl p-4">
          
          <div className="absolute top-[130px] left-[50px] pointer-events-none">
            <h1 className="text-5xl sm:text-[50px] md:text-[100px] lg:text-[150px] xl:text-[200px] font-bold text-black opacity-20 select-none">
              {username ? username : ""}
            </h1>
          </div>

          <div className="flex justify-center mt-5">
            <h2>
              Your Website Is: {publishedDraftNumber === ""
              ? <div className="text-red-500 flex justify-center">Offline!</div>
              : <div className="text-green-500 flex justify-center">Online!</div>}
            </h2>
          </div>

          <div className="flex justify-center mt-5">

            { publishedDraftNumber === "" ?
              <button disabled className="relative inline-flex px-6 py-4 text-lg font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all shadow-[0_0_10px_rgba(240,135,0,0.4)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 items-center justify-center text-center">
                My Website
              </button>
            :
              <button onClick={handleOpenWebsite} className="relative inline-flex px-6 py-4 text-lg font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#f08700] hover:text-black shadow-[0_0_10px_rgba(240,135,0,0.4)] hover:shadow-[0_0_15px_rgba(240,135,0,0.6)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 hover:before:scale-100 hover:before:opacity-50 items-center justify-center text-center">
                My Website
              </button>
            }
          </div>

          <div className="mt-16 p-6 text-center bg-gray-900 border border-[#00f2ff] sm:p-10 rounded-lg relative overflow-hidden before:absolute before:inset-0">
            <h3 className="mb-4 text-3xl font-bold text-white">
              Start Your Website Today
            </h3>
            <p className="mb-4 text-white">No coding. No hassle. Just results.</p>
            <button
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
