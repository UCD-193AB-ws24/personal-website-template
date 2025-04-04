"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@lib/firebase/firebaseApp";
import { signUserOut } from "@lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TemplateMapping } from "@customTypes/apiResponse";
import Navbar from "@components/Navbar";
import LoadingSpinner from "@components/LoadingSpinner";
import { fetchUsername } from "@lib/requests/fetchUsername";
import { fetchTemplateMappings } from "@lib/requests/fetchTemplateMappings";
import TemplateItem from "@components/TemplateItem";
import { deleteTemplate } from "@lib/requests/admin/deleteTemplate";
import DraftNameModal from "@components/DraftNameModal";
import { renameTemplate } from "@lib/requests/admin/renameTemplate";
import { createDraft } from "@lib/requests/createDraft";
import { toastSuccess } from "@components/toasts/SuccessToast";
import { ToastContainer } from "react-toastify";

export default function Templates() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState("");
  const [isModalHidden, setIsModalHidden] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [templateMappings, setTemplateMappings] = useState<TemplateMapping[]>(
    [],
  );
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateMapping>();
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

  const getTemplates = async () => {
    setIsLoading(true);

    setTemplateMappings(await fetchTemplateMappings());

    setIsLoading(false);
  };

  const loadEditor = async (mapping: TemplateMapping) => {
    const timestamp = Date.now();
    const result = await createDraft(
      timestamp,
      `Untitled Draft (${mapping.name})`,
      mapping.number,
    );
    if (result) {
      router.push("/editor?draftNumber=" + timestamp);
    }
  };

  const handleDeleteTemplate = async (mapping: TemplateMapping) => {
    if (username !== "admin") {
      return;
    }

    setIsLoading(true);

    const result = await deleteTemplate(mapping);
    if (result) {
      setTemplateMappings((original) =>
        original.filter((m) => m.number !== mapping.number),
      );

      toastSuccess("Successfully deleted the template.");
    }

    setIsLoading(false);
  };

  const handleNameChange = async (newName: string) => {
    if (username !== "admin") {
      return;
    }

    setIsLoading(true);

    if (selectedTemplate) {
      const result = await renameTemplate(selectedTemplate, newName);

      if (result) {
        setTemplateMappings((original) =>
          original.map((m) => {
            if (m.number === selectedTemplate.number) {
              m.name = newName;
            }
            return m;
          }),
        );

        console.log("rename template");
        toastSuccess("Successfully renamed the template");
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      getUsername();
      getTemplates();
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
      <main className="mx-auto max-w-screen-xl p-8">
        <ToastContainer />
        <LoadingSpinner show={isLoading} />
        <div className="flex gap-10">
          <h1 className="text-2xl sm:text-5xl"> Templates </h1>
        </div>

        <div
          id="draftsContainer"
          className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-evenly gap-4 mt-12"
        >
          {templateMappings &&
            templateMappings.map((m, i) => {
              return (
                <TemplateItem
                  key={i}
                  templateMapping={m}
                  isAdmin={username === "admin"}
                  loadEditor={loadEditor}
                  handleDeleteTemplate={handleDeleteTemplate}
                  setIsModalHidden={setIsModalHidden}
                  setSelectedDraft={setSelectedTemplate}
                />
              );
            })}
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
