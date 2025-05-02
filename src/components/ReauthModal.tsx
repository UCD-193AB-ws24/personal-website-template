"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
// import { auth } from "@lib/firebase/firebaseApp";
import { getFirebaseAuth } from "@lib/firebase/firebaseApp";
const auth = getFirebaseAuth();

import { LogIn } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";
import Image from "next/image";

interface ReauthModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  reauthSuccess: () => void;
  reauthFailure: (error: any) => void;
}

export default function ReauthModal({
  open,
  setOpen,
  reauthSuccess,
  reauthFailure,
}: ReauthModalProps) {
  const [user] = useAuthState(auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleSignIn, setIsGoogleSignIn] = useState(false);

  const reauthWithEmail = (email: string, password: string) => {
    const credentials = EmailAuthProvider.credential(email, password);
    reauthenticateWithCredential(user!, credentials)
      .then(() => {
        reauthSuccess();
      })
      .catch((error) => {
        reauthFailure(error);
      });
  };

  useEffect(() => {
    if (user) {
      setIsGoogleSignIn(
        user.providerData[0].providerId.indexOf("google") !== -1,
      );
    }
  }, [user]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      className="relative z-10"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                  <LogIn aria-hidden="true" className="size-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-gray-900"
                  >
                    Log in
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Please reauthenticate with your{" "}
                      {isGoogleSignIn ? "Google account" : "email and password"}{" "}
                      before deleting your account.
                    </p>
                  </div>
                  {isGoogleSignIn ? (
                    <div className="flex justify-center mt-5">
                      <button
                        className="p-1 border rounded"
                        onClick={() => {
                          if (user) {
                            reauthenticateWithPopup(
                              user,
                              new GoogleAuthProvider(),
                            )
                              .then(() => {
                                reauthSuccess();
                              })
                              .catch((error) => {
                                reauthFailure(error);
                              });
                          }
                        }}
                      >
                        <Image
                          src="/googlelogo.svg"
                          alt="Google logo"
                          width={24}
                          height={24}
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between mt-5">
                      <div className="flex flex-col g-2">
                        <label className="text-md" htmlFor="email">
                          Email
                        </label>
                        <input
                          className="border rounded"
                          id="email"
                          type="email"
                          onChange={(e) => {
                            setEmail(e.target.value);
                          }}
                        />
                      </div>
                      <div className="flex flex-col g-2">
                        <label className="text-md" htmlFor="password">
                          Password
                        </label>
                        <input
                          className="border rounded"
                          id="password"
                          type="password"
                          onChange={(e) => {
                            setPassword(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              {!isGoogleSignIn && (
                <button
                  type="button"
                  onClick={() => {
                    reauthWithEmail(email, password);
                  }}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  Log in
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                }}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
