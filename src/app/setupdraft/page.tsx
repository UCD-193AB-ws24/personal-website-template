"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirebaseAuth } from "@lib/firebase/firebaseApp";
const auth = getFirebaseAuth();

import { signUserOut } from "@lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { APIResponse } from "@customTypes/apiResponse";
import { fetchUsername } from "@lib/requests/fetchUsername";
import LoadingSpinner from "@components/LoadingSpinner";
import DraftNameModal from "@components/DraftNameModal";
import Navbar from "@components/Navbar";
import { createDraft } from "@lib/requests/createDraft";

export default function SetupDraft() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState("");
  const [draftMappings, setDraftMappings] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [isModalHidden, setIsModalHidden] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState<{
    id: number;
    name: string;
  }>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signUserOut();
      setUsername("");
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getUsername = useCallback(async () => {
    const name = await fetchUsername();
    if (name === null) {
      setUsername("Unknown");
      router.push("/setusername");
    } else {
      setUsername(name);
    }
  }, [router]);

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

  const handleNewDraft = async () => {
    const timestamp = Date.now();
    setSelectedDraft({ id: timestamp, name: "Untitled Draft" });
  };

  const handleRenameDraft = async (
    draftNumber: number,
    oldName: string,
    newName: string,
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/rename-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: draftNumber,
          oldName: oldName,
          newName: newName,
        }),
      });

      const resBody = (await res.json()) as APIResponse<string>;

      if (res.ok && resBody.success) {
        setDraftMappings((original) =>
          original.map((d) => {
            if (d.id === draftNumber) {
              d.name = newName;
            }
            return d;
          }),
        );
      } else if (!resBody.success) {
        throw new Error(resBody.error);
      }
      setIsLoading(false);
    } catch (error: any) {
      console.log("Error creating new draft:", error.message);
      setIsLoading(false);
    }
    setIsModalHidden(true);
    setSelectedDraft(undefined);
  };

  const handleNameChange = async (newDraftName: string) => {
    setIsLoading(true);
    if (selectedDraft) {
      // Selected draft is not in the draft mappings, i.e. new draft is being created
      if (
        draftMappings.find((mapping) => mapping.id === selectedDraft.id) ===
        undefined
      ) {
        await createDraft(selectedDraft.id, newDraftName);
        setIsLoading(false);
        router.push("/editor?draftNumber=" + selectedDraft.id);
      } else {
        handleRenameDraft(selectedDraft.id, selectedDraft.name, newDraftName);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      getUsername();
      getDraftMappings();
    }
  }, [user, getUsername]);

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

      <main className="mx-auto p-4">
        <LoadingSpinner show={isLoading} />
        <div className="flex flex-col md:flex-row gap-y-4 lg:gap-x-16 w-full p-8">
          {/* Left Content */}
          <div className="flex-1 flex justify-center md:justify-end">
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
                  data-testid="new-draft-btn"
                  onClick={() => {
                    if (!user) {
                      router.push("/login");
                    } else {
                      router.push("/templates");
                    }
                  }}
                  className="relative inline-flex px-6 py-4 w-1/2 text-md font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#f08700] hover:text-black shadow-[0_0_10px_rgba(240,135,0,0.4)] hover:shadow-[0_0_15px_rgba(240,135,0,0.6)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 hover:before:scale-100 hover:before:opacity-50 items-center justify-center text-center"
                >
                  Templates
                </button>
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="w-1 invisible md:visible bg-gray-400 mx-4"></div>

          {/* Right Content */}
          <div className="flex-1 flex justify-center md:justify-start">
            <div className="w-full max-w-md p-16 text-white bg-[#111827] shadow-md flex flex-col justify-between rounded-md">
              <div>
                <h1 className="text-xl font-semibold">Start from scratch</h1>

                <p className="mt-4">
                  What better joy than making your own idea come to life? Start
                  with a clean canvas!
                </p>
              </div>

              <div className="flex justify-center mt-16">
                <button
                  data-testid="select-template-btn"
                  onClick={() => {
                    setIsModalHidden(false);
                    handleNewDraft();
                  }}
                  className="relative inline-flex px-6 py-4 w-1/2 text-md font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#f08700] hover:text-black shadow-[0_0_10px_rgba(240,135,0,0.4)] hover:shadow-[0_0_15px_rgba(240,135,0,0.6)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 hover:before:scale-100 hover:before:opacity-50 items-center justify-center text-center"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>

        <DraftNameModal
          isHidden={isModalHidden}
          submitCallback={handleNameChange}
          setIsModalHidden={setIsModalHidden}
        />
      </main>

      <footer></footer>
    </div>
  );
}
