import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser, db } from "@lib/firebase/firebaseAdmin";
import { APIResponse } from "@customTypes/apiResponse";

// POST /api/user/delete-account:
// Deletes the user's account: deletes the user doc and all their drafts
export async function POST() {
  try {
    const reqCookies = await cookies();
    const sessionCookie = reqCookies.get("__session")?.value;

    if (!sessionCookie) {
      return NextResponse.json<APIResponse<string>>(
        { success: false, error: "Session not found." },
        { status: 400 },
      );
    }

    // Get the user who sent the request and their uid to get their user document
    const user = await getCurrentUser();
    if (user === null) {
      throw new Error("No user found");
    }

    const userDoc = db.collection("users").doc(user.uid);
    const userData = (await userDoc.get()).data();
    if (userData === undefined) {
      throw new Error("Couldn't retrieve user data");
    }

    // Delete drafts
    const draftMappings = userData.draftMappings;
    if (draftMappings) {
      draftMappings.forEach(async (mapping: { id: number; name: string }) => {
        const query = db
          .collection("drafts")
          .where("draftId", "==", `${user.uid}-${mapping.id}`);
        query.get().then((draftSnapshot) => {
          draftSnapshot.docs.forEach((doc) => {
            doc.ref.delete();
          });
        });
      });
    }

    userDoc.delete();

    // Destroy session cookie
    reqCookies.getAll().map((cookieKey) => {
      reqCookies.delete(cookieKey);
    });

    return NextResponse.json<APIResponse<string>>({
      success: true,
      data: "Success",
    });
  } catch (error: any) {
    return NextResponse.json<APIResponse<string>>(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
