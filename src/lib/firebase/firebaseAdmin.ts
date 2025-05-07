// import "server-only";

import { initializeApp, getApp, getApps, cert } from "firebase-admin/app";
import { cookies } from "next/headers";
import { getAuth, SessionCookieOptions } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const firebaseAdminConfig = {
  credential: cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string),
  ),
};

export const firebaseApp = !getApps().length
  ? initializeApp(firebaseAdminConfig)
  : getApp();

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export async function isUserAuthenticated(
  session: string | undefined = undefined,
) {
  const _session = session ?? (await getSession());
  if (!_session) return false;

  try {
    const isRevoked = !(await auth.verifySessionCookie(_session, true));
    return !isRevoked;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!(await isUserAuthenticated(session))) {
    return null;
  }

  const decodedIdToken = await auth.verifySessionCookie(session!);
  const currentUser = await auth.getUser(decodedIdToken.uid);

  return currentUser;
}

async function getSession() {
  try {
    return (await cookies()).get("__session")?.value;
  } catch (error: any) {
    console.log("Error retrieving session:", error.message);
    return undefined;
  }
}

export async function createSessionCookie(
  idToken: string,
  sessionCookieOptions: SessionCookieOptions,
) {
  return auth.createSessionCookie(idToken, sessionCookieOptions);
}

export async function revokeAllSessions(session: string) {
  const decodedIdToken = await auth.verifySessionCookie(session);

  return await auth.revokeRefreshTokens(decodedIdToken.sub);
}
