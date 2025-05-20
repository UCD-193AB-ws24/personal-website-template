"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirebaseAuth } from "@lib/firebase/firebaseApp";
const auth = getFirebaseAuth();
import { signUserOut } from "@lib/firebase/auth";
import { fetchUsername } from "@lib/requests/fetchUsername";
import Navbar from "@components/Navbar";

export default function Help() {
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

  return (
    <>
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
      <div className="h-screen overflow-hidden flex justify-center items-center border">
        <iframe
          className="w-full md:w-[90vw] max-w-[816px] h-[90vh] overflow-x-hidden border rounded-lg bg-white"
          src="https://docs.google.com/document/d/e/2PACX-1vS0GWDSRMe_pjCnsHMh9RHMAyX_LFmUVtr4Y4YBu7g3acB555zxMAM_lNCTMJtiwGGFWuU4Xw6ol0gM/pub?embedded=true"
        ></iframe>
      </div>
    </>
  );
}
