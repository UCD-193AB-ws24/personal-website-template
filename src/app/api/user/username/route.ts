import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { APIResponse } from "@customTypes/apiResponse";
import { db, getCurrentUser } from "@lib/firebase/firebaseAdmin";

// GET /api/user/username
// Returns the current signed in user's username
export async function GET() {
  const cookieStore = await cookies();

  // Checks to see if the username is cached in the cookie
  if (cookieStore.has("username")) {
    return NextResponse.json<APIResponse<string>>({
      success: true,
      data: cookieStore.get("username")!.value,
    });
  }

  try {
    const user = await getCurrentUser();
    if (user === null) {
      return NextResponse.json<APIResponse<string>>(
        { success: false, error: "User not found" },
        { status: 401 },
      );
    }

    const userDoc = await db.collection("users").doc(user.uid).get();
    if (userDoc.exists) {
      // Cache the username in the cookie
      cookieStore.set("username", userDoc.data()?.username, { secure: true });

      return NextResponse.json<APIResponse<string>>({
        success: true,
        data: userDoc.data()?.username,
      });
    } else {
      throw new Error("User not found");
    }
  } catch (error: any) {
    console.log("Error fetching user data:", error.message);

    return NextResponse.json<APIResponse<string>>(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
