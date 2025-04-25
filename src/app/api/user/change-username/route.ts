import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, db } from "@lib/firebase/firebaseAdmin";
import { APIResponse } from "@customTypes/apiResponse";

// POST /api/user/change-username:
// Body: {
//   newUsername: string
// }
// Changes the user's username if the new username is unique
export async function POST(req: NextRequest) {
  try {
    const reqJson = await req.json();

    if (!reqJson.hasOwnProperty("newUsername")) {
      throw new Error("Invalid request");
    }

    // Get the new username
		const newUsername = reqJson["newUsername"];

    // Get the user who sent the request and their uid to get their user document
    const user = await getCurrentUser();
    if (user === null) {
      throw new Error("No user found");
    }

		// Check if there exists a user doc with `newUsername` as their username
		const newUsernameQuery = db.collection("users").where("username", "==", newUsername);
		const snapshot = await newUsernameQuery.get();
		if (snapshot.docs.length > 0) {
			// Such a doc exists, so `newUsername` can't be used
			throw new Error("Username has been taken.")
		}

		// Change the user's username
    const userDoc = db.collection("users").doc(user.uid);
		userDoc.update({
			username: newUsername
		})

		// Cache the new username in the session cookie
		const cookieStore = await cookies();
		cookieStore.set("username", newUsername, { secure: true });

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

