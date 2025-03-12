"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@lib/firebase/firebaseApp";
import { signUserOut } from "@lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APIResponse } from "@customTypes/apiResponse";
import Navbar from "@components/Navbar";
import LoadingSpinner from "@components/LoadingSpinner";
import DraftItem from "@components/DraftItem";
import { fetchUsername } from "@lib/requests/fetchUsername";
import { fetchPublishedDraftNumber } from "@lib/requests/fetchPublishedDraftNumber";
import { deleteDraftStorage } from "@lib/requests/deleteDraftStorage";
import DraftNameModal from "@components/DraftNameModal";
import { ToastContainer } from "react-toastify";
import { createTemplate } from "@lib/requests/admin/createTemplate";
import { toastSuccess } from "@components/toasts/SuccessToast";
import { createDraft } from "@lib/requests/createDraft";

export default function SavedDrafts() {
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
  const [newDraftName, setNewDraftName] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [publishedDraftNumber, setPublishedDraftNumber] = useState(0);

  useEffect(() => {
    if (user) {
      getUsername();
      getDraftMappings();
      getPublishedDraftNumber();
    }
    // else {
    //   router.push("/")
    // }
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

  const getPublishedDraftNumber = async () => {
    setIsLoading(true);

    const pubDraftNum = await fetchPublishedDraftNumber();
    setPublishedDraftNumber(pubDraftNum);

    setIsLoading(false);
  };

  const unpublish = () => {
    setIsLoading(true);
    fetch("/api/user/unpublish-draft", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setPublishedDraftNumber(0);
          setIsLoading(false);
          toastSuccess("Successfully unpublished your site.");
        } else {
          throw new Error(res.error);
        }
      })
      .catch((error) => {
        console.log(error.message);
        setIsLoading(false);
      });
  };

  const loadEditor = async (draftNumber: string) => {
    router.push("/editor?draftNumber=" + draftNumber);
  };

  const handleNewDraft = async () => {
    const timestamp = Date.now();
    setSelectedDraft({ id: timestamp, name: "Untitled Draft" });
  };

  const handleDeleteDraft = async (draftNumber: number, draftName: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/delete-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftObj: { id: draftNumber, name: draftName },
        }),
      });

      const resBody = (await res.json()) as APIResponse<string>;

      if (res.ok && resBody.success) {
        // Delete the Firebase Storage directory since draft is
        // now successfully deleted
        const user = auth.currentUser;
        if (user) {
          await deleteDraftStorage(user.uid, draftNumber);
        }
        setDraftMappings((original) =>
          original.filter((d) => d.id !== draftNumber),
        );
        toastSuccess("Successfully deleted your draft.");
      } else if (!resBody.success) {
        throw new Error(resBody.error);
      }
      setIsLoading(false);
    } catch (error: any) {
      console.log("Error creating new draft:", error.message);
      setIsLoading(false);
    }
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
        toastSuccess("Successfully renamed your draft.");
      } else if (!resBody.success) {
        throw new Error(resBody.error);
      }
      setIsLoading(false);
    } catch (error: any) {
      console.log("Error creating new draft:", error.message);
      setIsLoading(false);
    }
    setIsModalHidden(true);
    setNewDraftName("");
    setSelectedDraft(undefined);
  };

  const handleNameChange = async (newDraftName: string) => {
    if (selectedDraft) {
      // Selected draft is not in the draft mappings, i.e. new draft is being created
      if (
        draftMappings.find((mapping) => mapping.id === selectedDraft.id) ===
        undefined
      ) {
        await createDraft(selectedDraft.id, newDraftName);
        router.push("/editor?draftNumber=" + selectedDraft.id);
      } else {
        handleRenameDraft(selectedDraft.id, selectedDraft.name, newDraftName);
      }
    }
  };

  const publishAsTemplate = async (id: number, name: string) => {
    setIsLoading(true);

    const result = await createTemplate(id, name);
    if (result) {
      toastSuccess("Successfully published draft as a template.");
    }
    setIsLoading(false);
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
      <main className="mx-auto max-w-screen-xl p-8">
        <ToastContainer />
        <LoadingSpinner show={isLoading} />
        <div className="flex gap-10">
          <p className="text-2xl sm:text-5xl"> Saved Drafts </p>
          <button
            onClick={() => {
              setIsModalHidden(false);
              handleNewDraft();
            }}
            className="bg-[#f08700] hover:bg-[#d67900] transition duration-300 text-white font-bold py-2 px-4 rounded-md border-none text-[#111827]"
          >
            New Draft
          </button>

          <button
            onClick={() => router.push("/templates")}
            className="bg-[#f08700] hover:bg-[#d67900] transition duration-300 text-white font-bold py-2 px-4 rounded-md border-none text-[#111827]"
          >
            Select Template
          </button>
        </div>

        <div
          id="draftsContainer"
          className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-evenly gap-4 mt-12"
        >
          {draftMappings
            ? draftMappings.map((d, i) => {
                return (
                  <DraftItem
                    key={i}
                    id={d.id}
                    name={d.name}
                    isPublished={d.id === publishedDraftNumber}
                    isAdmin={username === "admin"}
                    loadEditor={loadEditor}
                    handleDeleteDraft={handleDeleteDraft}
                    setIsModalHidden={setIsModalHidden}
                    setSelectedDraft={setSelectedDraft}
                    unpublish={unpublish}
                    publishAsTemplate={publishAsTemplate}
                  />
                );
              })
            : ""}
        </div>

        <DraftNameModal
          isHidden={isModalHidden}
          submitCallback={handleNameChange}
          setIsModalHidden={setIsModalHidden}
        />
      </main>
      <footer className="mt-[20vh]"></footer>
    </div>
  );
}
