"use client";

import "../homePage.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@lib/firebase/firebaseApp";
import { signUserOut } from "@lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APIResponse } from "@customTypes/apiResponse";
import { fetchUsername } from "@lib/requests/fetchUsername";
import LoadingSpinner from "@components/LoadingSpinner";

import Navbar from "@components/Navbar";
import { fetchPublishedDraftNumber } from "@lib/requests/fetchPublishedDraftNumber";

export default function Profile() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState("");
  const [publishedDraftNumber, setPublishedDraftNumber] = useState(0);
  const [views, setViews] = useState("0");
  const [draftMappings, setDraftMappings] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      getUsername();
      getPublishedDraftNumber();
      getDraftMappings();
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

  const getDraftMappings = () => {
    setIsLoading(true);
    fetch("/api/user/get-drafts", {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setDraftMappings(res.data);
          setIsLoading(false);
        } else {
          throw new Error(res.error);
        }
      })
      .catch((error) => {
        console.log(error.message);
        setIsLoading(false);
      });
  };

  const handleOpenWebsite = async () => {
    try {
      window.open(`/pages/${username}`, "_blank");
    } catch (error: any) {
      console.log("Error opening website:", error.message);
    }
  };

  const getPublishedDraftNumber = async () => {
    const pubDraftNum = await fetchPublishedDraftNumber();
    getViews(pubDraftNum);
    setPublishedDraftNumber(pubDraftNum);
  };

  const getViews = async (publishedDraftNumber: number) => {
    if (publishedDraftNumber === 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/user/get-published-views?publishedDraftNumber=${publishedDraftNumber}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const resBody = (await response.json()) as APIResponse<string>;

      if (response.ok && resBody.success) {
        console.log("views: ", resBody.data);

        if (resBody.data !== undefined) {
          setViews(resBody.data);
        }

        setIsLoading(false);
      } else {
        throw new Error("views could not be returned");
      }
    } catch (error: any) {
      setViews("0");
      setIsLoading(false);
      console.log(error.message);
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
        <div className="fixed top-[130px] left-[50px] pointer-events-none">
          <h1 className="text-5xl sm:text-[50px] md:text-[100px] lg:text-[150px] xl:text-[200px] font-bold text-black opacity-20 select-none">
            {username ? username : ""}
          </h1>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 justify-evenly gap-7 mt-20">
          <div className="mt-16 p-6 text-center bg-gray-900 sm:p-10 rounded-lg relative overflow-hidden before:absolute before:inset-0 flex flex-col justify-between w-[275px] sm:w-full h-[285px]">
            <div className="flex justify-center mt-5 mb-4 text-3xl sm:text-1xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-white">
              <h2>
                Your website is:{" "}
                {publishedDraftNumber === 0 ? (
                  <div className="text-red-500 flex justify-center">
                    Offline!
                  </div>
                ) : (
                  <div className="text-green-500 flex justify-center">
                    Online!
                  </div>
                )}
              </h2>
            </div>

            <div>
              {publishedDraftNumber === 0 ? (
                <button
                  disabled
                  className="relative inline-flex px-6 py-4 w-1/2 text-lg font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all shadow-[0_0_10px_rgba(240,135,0,0.4)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 items-center justify-center text-center"
                >
                  My Website
                </button>
              ) : (
                <button
                  onClick={handleOpenWebsite}
                  className="relative inline-flex px-6 py-4 w-1/2 text-lg font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#f08700] hover:text-black shadow-[0_0_10px_rgba(240,135,0,0.4)] hover:shadow-[0_0_15px_rgba(240,135,0,0.6)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 hover:before:scale-100 hover:before:opacity-50 items-center justify-center text-center"
                >
                  My Website
                </button>
              )}
            </div>
          </div>

          <div className="mt-16 p-6 text-center bg-gray-900 sm:p-10 rounded-lg relative overflow-hidden before:absolute before:inset-0 flex flex-col justify-between w-[275px] sm:w-full h-[285px]">
            <LoadingSpinner show={isLoading} />

            <div>
              <div className="mb-4 text-5xl font-bold text-white">
                {draftMappings ? draftMappings.length : 0}
              </div>

              <h3 className="mb-4 text-3xl text-center font-bold text-white bg-gray-900">
                Saved drafts
              </h3>
            </div>

            <div>
              <button
                onClick={() => router.push("/saveddrafts")}
                className="relative inline-flex px-6 py-4 w-1/2 text-lg font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#f08700] hover:text-black shadow-[0_0_10px_rgba(240,135,0,0.4)] hover:shadow-[0_0_15px_rgba(240,135,0,0.6)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 hover:before:scale-100 hover:before:opacity-50 items-center justify-center text-center"
              >
                <div className="text-left rtl:text-right">
                  <div className="-mt-1 font-sans text-lg font-semibold">
                    View Drafts
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-16 p-6 text-center bg-gray-900 sm:p-10 rounded-lg relative overflow-hidden before:absolute before:inset-0 flex flex-col justify-between w-[275px] sm:w-full h-[285px]">
            <div>
              <h3 className="mb-4 text-3xl font-bold text-white">
                Make a new website!
              </h3>
            </div>

            <div>
              <button
                onClick={() => router.push("/setupdraft")}
                className="relative inline-flex px-6 py-4 w-1/2 text-lg font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#f08700] hover:text-black shadow-[0_0_10px_rgba(240,135,0,0.4)] hover:shadow-[0_0_15px_rgba(240,135,0,0.6)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 hover:before:scale-100 hover:before:opacity-50 items-center justify-center text-center"
              >
                <div className="text-left rtl:text-right">
                  <div className="-mt-1 font-sans text-lg font-semibold">
                    Create My Site
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-16 p-6 text-center bg-gray-900 sm:p-10 rounded-lg relative overflow-hidden before:absolute before:inset-0 flex flex-col justify-between w-[275px] sm:w-full h-[285px]">
            <LoadingSpinner show={isLoading} />
            <div className="mb-4 text-5xl font-bold text-white">{views}</div>

            <div>
              <h3 className="mb-4 text-3xl text-center font-bold text-white bg-gray-900">
                Views on your published draft!
              </h3>
            </div>
          </div>
        </div>
      </main>

      <footer></footer>
    </div>
  );
}
